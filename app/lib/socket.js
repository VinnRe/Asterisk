// fix transport and consumer nadodoble doble

import * as mediasoup from 'mediasoup';
import { config } from '../src/config.js';


/**
 * Worker
 * |-> Router(s)
 *     |-> Producer Transport(s)
 *         |-> Producer
 *     |-> Consumer Transport(s)
 *         |-> Consumer 
 **/
let worker
var devicee
let rooms = {}          // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}
let peers = {}          // { socketId1: { roomName1, socket, transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], peerDetails }, ...}
let transports = []     // [ { socketId1, roomName1, transport, consumer }, ... ]
let producers = []      // [ { socketId1, roomName1, producer, }, ... ]
let consumers = []      // [ { socketId1, roomName1, consumer, }, ... ]


async function ioConnection(io) {

	const connections = io.of('/mediasoup');

	async function createWorker() {
		try {		
			worker = await mediasoup.createWorker({
				logLevel: config.mediasoup.worker.logLevel,
				logTags: config.mediasoup.worker.logTags,
				rtcMinPort: config.mediasoup.worker.rtcMinPort,
				rtcMaxPort: config.mediasoup.worker.rtcMaxPort
			});

			console.log(`Worker id: ${worker.pid}`);

			worker.on('died', () => {
				console.error(`mediasoup worker died, exiting in 2 seconds... ${worker.pid}`);
				setTimeout( () => {
					process.exit(1);
				}, 2000);
			});

			return worker
		} catch (error) {
			console.log('Worker Error: ', error);
		}
	}

	worker = createWorker();

	const mediaCodecs = config.mediasoup.router.mediaCodecs;

	connections.on('connection', async (socket) => {
		console.log(`SocketId: ${socket.id}`);
		socket.emit('connection-success', {
			socketId: socket.id
		})

		socket.on('disconnect', () => {
			// do some clean up
			console.log('peer disconnected')
			consumers = removeItems(consumers, socket.id, 'consumer')
			producers = removeItems(producers, socket.id, 'producer')
			transports = removeItems(transports, socket.id, 'transport')

			if (peers[socket.id]) {
				const { roomName } = peers[socket.id]
				delete peers[socket.id]

				
				// remove socket from room
				rooms[roomName] = {
					router: rooms[roomName].router,
					peers: rooms[roomName].peers.filter(socketId => socketId !== socket.id)
				}
			}

		})

		function removeItems(items, socketId, type) {
			items.forEach(item => {
				if (item.socketId === socket.id) {
					item[type].close()
				}
			})
			items = items.filter(item => item.socketId !== socket.id)

			return items;
		}

		socket.on('joinRoom', async({roomName}, callback) => {
			// create router if it doesnt exist
			const router1 = await createRoom(roomName, socket.id);

			// add new user to the peer list
			peers[socket.id] = {
				socket,
				roomName,
				transports: [],
				producers: [],
				consumers: [],
				peerDetails: {
					name: '',
					isAdmin: false
				}
			}

			// get router rtp capabilities
			const rtpCapabilities = router1.rtpCapabilities

			callback({ rtpCapabilities })
		})

		async function createRoom(roomName, socketId) {
			let router1;
			let peers = []

			if(rooms[roomName]) {
				// room exists
				router1 = rooms[roomName].router
				peers = rooms[roomName].peers || [];
			} else {
				// room doesnt exist
				router1 = await worker.createRouter({mediaCodecs});
			}

			console.log(`Router ID: ${router1.id}`, peers.length)

			rooms[roomName] = {
				router: router1,
				peers: [...peers, socketId]
			}

			// console.log(rooms)

			return router1;
		}



		socket.on('createWebRtcTransport', async ({ consumer, type }, callback) => {
			// get the room name for this peer
			const roomName = peers[socket.id].roomName

			// based on the roomname get the router
			const router = rooms[roomName].router


			createWebRtcTransport(router).then(
				transport => {
					callback({
						params: {
							id: transport.id,
							iceParameters: transport.iceParameters,
							iceCandidates: transport.iceCandidates,
							dtlsParameters: transport.dtlsParameters
						}
					})

					addTransport(transport, roomName, consumer, type)
				}, error => {
					console.log(error);
				}
			)
		})

		function addTransport(transport, roomName, consumer, type) {
			transports = [
				...transports,
				{
					socketId: socket.id,
					transport,
					roomName,
					consumer,
					type
				}
			]

			peers[socket.id] = {
				...peers[socket.id],
				transports: [
					...peers[socket.id].transports,
					transport.id
				]
			}

			// balik dito for checking ng number of transports sa user
			// console.log("TRANSPORT: ", transports)
		}


		socket.on('transportConnect', ({ dtlsParameters, transportId }) => {
			getTransport(socket.id, transportId).connect({ dtlsParameters })
		})

		function getTransport(socketId, transportId) {

			// console.log(transports[0].transport.id)
			// console.log(transportId)

			const [ producerTransport ] = transports.filter(transport =>
				transport.transport.internal.transportId === transportId && !transport.consumer
			)

			return producerTransport.transport
		}


		function addProducer(producer, roomName, type) {
			producers = [
				...producers,
				{
					socketId: socket.id,
					producer,
					roomName, 
					type
				}
			]

			peers[socket.id] = {
				...peers[socket.id],
				producers: [
					...peers[socket.id].producers,
					producer.id
				]
			}
		}

		function addConsumer(consumer, roomName, consumerType) {
			consumers = [
				...consumers,
				{
					socketId: socket.id,
					consumer,
					roomName,
					consumerType
				}
			]

			// add consumer id to the peers list

			peers[socket.id] = {
				...peers[socket.id],
				consumers: [
					...peers[socket.id].consumers,
					consumer.id
				]
			}
		}

		socket.on('transportProduce', async ({ kind, rtpParameters, appData, transportId, type }, callback) => {

			const producer = await getTransport(socket.id, transportId).produce({ 
				kind,
				rtpParameters,
			})

			// add producer in the producers array
			const { roomName } = peers[socket.id]

			addProducer(producer, roomName, type)

			// inform other clients that a new producer has joined so they can consume
			informConsumers(roomName, socket.id, producer.id);

			console.log('Producer ID: ', producer.id, producer.kind ,type)

			producer.on('transportclose', () => {
				console.log('transport for this producer closed')
				producer.close();
			})

			callback({
				serverProducerId: producer.id,
				producerExist: producers.length > 1 ? true:false
			})
		})


		socket.on('transportRecvConnect', async ({ dtlsParameters, serverConsumerTransportId }) => {
			// console.log("DTLS Parameters: ", { dtlsParameters });
			const consumerTransport = transports.find(transport => (
				transport.consumer && transport.transport.id == serverConsumerTransportId
			)).transport


			await consumerTransport.connect({ dtlsParameters })
		})

		function removeScreenItem(items, socketId, type) {
			let itemToRemove
			items.forEach(item => {
				if (item.socketId === socketId && item.type === type) {
					if (item['transport']) {
						item['transport'].close()
						// console.log("TRANSPORTTT")
					}
					if (item['producer']) {
						item['producer'].close()
						// console.log("PRODUCERRRR")
					}
					if (item['consumer']) {
						item['consumer'].close()
						// console.log("CONSUMERRRR")
					}
					itemToRemove = item
				}
			})
			items = items.filter(item => item !== itemToRemove)

			return items
		}

		socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId, consumerType, remoteProducerSocketId }, callback) => {
			try {

				const { roomName } = peers[socket.id]
				const router = rooms[roomName].router
				let consumerTransport = transports.find(transport => (
					transport.consumer && transport.transport.id == serverConsumerTransportId
				)).transport

				if (router.canConsume({
					producerId: remoteProducerId,
					rtpCapabilities
				})) {
					const consumer = await consumerTransport.consume({
						producerId: remoteProducerId,
						rtpCapabilities,
						paused: true
					})

					console.log('consumer ID: ', consumer.id)

					let consumerId = consumer.id

					consumer.on('transportclose', () => {
						console.log('transport close from consumer')
					})

					consumer.on('producerclose', () => {
						console.log('producer of consumer closed')
						socket.emit('producerClosed', { remoteProducerId, remoteProducerSocketId })

						// remove
						consumerTransport.close([])
						transports = transports.filter(transport => transport.transport.id !== consumerTransport.id)
						consumer.close()

						consumers = consumers.filter(consumer => consumer.consumer.id !== consumerId)
						// console.log("consumersssss", consumers)
					})

					addConsumer(consumer, roomName, consumerType)

					const params = {
						id: consumer.id,
						producerId: remoteProducerId,
						kind: consumer.kind,
						rtpParameters: consumer.rtpParameters,
						serverConsumerId: consumer.id
					}

					callback({ params });
				}
			} catch (error) {
				console.log(error.message)
				callback({
					params: {
						error: error
					}
				})
			}
		})

		socket.on('consumerResume', async({ serverConsumerId }) => {
			// console.log('consumer resume')
			const { consumer } = consumers.find(consumer => consumer.consumer.id === serverConsumerId)
			await consumer.resume();
		})

		let userSharing = false
		function informConsumers(roomName, socketId, producerId) {
			// console.log('just joined, id', producerId, roomName, socketId)
			// a new produced jus joined
			// all consumer will consume this producer
			producers.forEach(producer => {

				if (producer.type === "screenShareProducer") {
					userSharing = true
					return
				}
			})

			// two times nacacall
			producers.forEach(producer => {

				// check if producer is in the same room with the clients
				if (producer.socketId !== socketId && producer.roomName === roomName) {
					const producerSocket = peers[producer.socketId].socket
				

					// use socket to send producer id to other producer (user) to consume its media
					if (userSharing) {
						producerSocket.emit('newProducer', { 
							producerId: producerId,
							producerType: "screenShareProducer",
							producerSocketId: socketId
						})
					} else {
						producerSocket.emit('newProducer', { 
							producerId: producerId,
							producerType: producer.type,
							producerSocketId: socketId
						})
					}
				}
			})
		}

		socket.on('getProducers', callback => {
			// return all producer transports

			const { roomName } = peers[socket.id];

			let producerList = []
			// get all producers except current producer
			producers.forEach(producer => {
				if (producer.socketId !== socket.id && producer.roomName === roomName) {
					producerList = [
						...producerList,
						{
							producerId: producer.producer.id,
							producerType: producer.type,
							producerSocketId: producer.socketId
						}
					]
				}
			})

			// console.log(producerList)

			// return back to client
			callback(producerList);
		})


		function sendToOtherPeers(roomName, event) {
			Object.values(peers).forEach(peer => {
				if (peer.roomName === roomName && peer.socket.id !== socket.id) {
					switch (event) {
						case "raiseHand":
							peer.socket.emit("userRaisedHand", {userSocketId: socket.id});
							break;
						case "lowerHand":
							peer.socket.emit("userLowerHand", {userSocketId: socket.id});
							break;
						case "micOn":
							peer.socket.emit("userMicOn", {userSocketId: socket.id});
							break;
						case "micOff":
							peer.socket.emit("userMicOff", {userSocketId: socket.id});
							break;
					}
					console.log(peer.socket.id)
				}
			})
		}

		socket.on('closingScreenShare', () => {
			// close screen share transports
			transports = removeScreenItem(transports, socket.id, "screenShareProducer")
			producers = removeScreenItem(producers, socket.id, "screenShareProducer")
			consumers = removeScreenItem(consumers, socket.id, "screenShareConsumer")
		})

		socket.on('handsUp', (data) => {
			// send sa other sockets
			console.log(socket.id, "hands up")
			sendToOtherPeers(data.roomName, "raiseHand")
		})

		socket.on('handsDown', (data) => {
			console.log(socket.id, "hands down")
			sendToOtherPeers(data.roomName, "lowerHand")
		})

		socket.on('micOn', (data) => {
			console.log(socket.id, "Mic is on")
			sendToOtherPeers(data.roomName, "micOn")
		})

		socket.on('micOff', (data) => {
			console.log(socket.id, "Mic is off")
			sendToOtherPeers(data.roomName, "micOff")
		})
		socket.on('camOff', (data) => {
			console.log(socket.id, "Cam is off")
			if (data.producerTransport !== null) {
				console.log("transport ID", data.producerTransport._id)
				producers.forEach(producer => {
					if (producer.producer.kind === "video") {
						// producer.producer.close()

			// 			items.forEach(item => {
			// 	if (item.socketId === socket.id) {
			// 		item[type].close()
			// 	}
			// })
			// items = items.filter(item => item.socketId !== socket.id)
						// producers = removeScreenItem(producers, socket.id, "screenShareProducer")
					}
				})
				// producers = producers.filter
			}
		})
	})


	async function createWebRtcTransport(router) {
		return new Promise(async (resolve, reject) => {
			try {
				const configWebRtcTransport = config.mediasoup.webRtcTransport;

				let transport = await router.createWebRtcTransport(configWebRtcTransport);

				console.log("transport id: ", transport.id);

				transport.on('dtlsstatechange', dtlsState => {
					if (dtlsState == 'closed') {
						transport.close();
					}
				})

				transport.on("close", () => {
					console.log("transport closed");
				})


				resolve(transport);
			} catch (error) {
				reject(error);
			}
		})
	}
}

function getUsers(roomName) {
	let users = rooms[roomName].peers.length
	return users
}

// roomName di nagamitttt
function getTransports(roomName) {
	let transportss = transports
	return transportss
}

function getConsumers(roomName) {
	return consumers
}

function getProducers(roomName) {
	return producers
}


export {
	ioConnection, getUsers, getTransports, getConsumers, getProducers
};
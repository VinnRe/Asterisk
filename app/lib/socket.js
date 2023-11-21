

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


			const { roomName } = peers[socket.id]
			delete peers[socket.id]

			// remove socket from room
			rooms[roomName] = {
				router: rooms[roomName].router,
				peers: rooms[roomName].peers.filter(socketId => socketId !== socket.id)
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

			return router1;
		}



		socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
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

					addTransport(transport, roomName, consumer)
				}, error => {
					console.log(error);
				}
			)
		})

		function addTransport(transport, roomName, consumer) {
			transports = [
				...transports,
				{
					socketId: socket.id,
					transport,
					roomName,
					consumer
				}
			]

			peers[socket.id] = {
				...peers[socket.id],
				transports: [
					...peers[socket.id].transports,
					transport.id
				]
			}
		}


		socket.on('transportConnect', ({ dtlsParameters }) => {
			// console.log("DTLS Parameters: ", { dtlsParameters });

			getTransport(socket.id).connect({ dtlsParameters })
		})

		function getTransport(socketId) {
			const [ producerTransport ] = transports.filter(transport =>
				transport.socketId === socketId && !transport.consumer
			)
			return producerTransport.transport
		}

		function addProducer(producer, roomName) {
			producers = [
				...producers,
				{
					socketId: socket.id,
					producer,
					roomName
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

		function addConsumer(consumer, roomName) {
			consumers = [
				...consumers,
				{
					socketId: socket.id,
					consumer,
					roomName
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

		socket.on('transportProduce', async ({ kind, rtpParameters, appData }, callback) => {
			// console.log("rtp parametersssss", rtpParameters)
			const producer = await getTransport(socket.id).produce({ 
				kind,
				rtpParameters,
			})

			// add producer in the producers array
			const { roomName } = peers[socket.id]

			addProducer(producer, roomName)

			// inform other clients that a new producer has joined so they can consume
			informConsumers(roomName, socket.id, producer.id);

			console.log('Producer ID: ', producer.id, producer.kind)

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
			console.log("DTLS Parameters: ", { dtlsParameters });
			const consumerTransport = transports.find(transport => (
				transport.consumer && transport.transport.id == serverConsumerTransportId
			)).transport


			    // console.log(`DTLS PARAMS: ${dtlsParameters}`)
			    // const consumerTransport = transports.find(transportData => (
			    //   transportData.consumer && transportData.transport.id == serverConsumerTransportId
			    // )).transport

			await consumerTransport.connect({ dtlsParameters })
		})

		socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
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

					consumer.on('transportclose', () => {
						console.log('transport close from consumer')
					})

					consumer.on('producerclose', () => {
						console.log('producer of consumer closed')
						socket.emit('producerClosed', { remoteProducerId })

						// remove
						consumerTransport.close([])
						transports = transports.filter(transport => transport.transport.id !== consumerTransport.id)
						consumer.close()
						consumers = consumers.filter(consumer => consumer.consumer.id !== consumer.id)
					})

					addConsumer(consumer, roomName)

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
			console.log('consumer resume')
			const { consumer } = consumers.find(consumer => consumer.consumer.id === serverConsumerId)
			await consumer.resume();
		})

		function informConsumers(roomName, socketId, producerId) {
			console.log('just joined, id', producerId, roomName, socketId)

			// a new produced jus joined
			// all consumer will consume this producer
			producers.forEach(producer => {
				// check if producer is in the same room with the clients
				if (producer.socketId !== socketId && producer.roomName === roomName) {
					const producerSocket = peers[producer.socketId].socket

					// use socket to send producer id to other producer (user) to consume its media
					producerSocket.emit('newProducer', { producerId: producerId })
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
						producer.producer.id
					]
				}
			})

			// return back to client
			callback(producerList);
		})

	})

	async function createWebRtcTransport(router) {
		return new Promise(async (resolve, reject) => {
			try {
				const configWebRtcTransport = config.mediasoup.webRtcTransport;

				// console.log("configWebRtcTransport: ", configWebRtcTransport);

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



export {
	ioConnection
};
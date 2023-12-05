/**
 * Worker
 * |-> Router(s)
 *     |-> Producer Transport(s)
 *         |-> Producer
 *     |-> Consumer Transport(s)
 *         |-> Consumer 
 **/

import * as mediasoup from 'mediasoup';
import { config } from '../src/config.js';


class Mediasoup {

	// overload constructor
	constructor(io) {
		this.#io = io
		this.#connections = this.#io.of('mediasoup');
	}

	// private attributes
	#io
	#rooms = {}
	#peers = {}
	#connections
	#producers = []
	#consumers = []
	#transports = []
	#worker = this.#createWorker();
	#mediaCodecs = config.mediasoup.router.mediaCodecs;


	// public methods
	getUsers(roomName) {
		let users = this.#rooms[roomName].peers.length
		return users
	}

	#getItems(roomName, items) {
		let itemsToGet = []
		items.forEach(item => {
			if (item.roomName === roomName) {
				itemsToGet = [
					...itemsToGet,
					item
				]
			}
		})
		return itemsToGet
	}

	getTransports(roomName) {
		let roomTransports = this.#getItems(roomName, this.#transports)
		return roomTransports
	}

	getConsumers(roomName) {
		let roomConsumers = this.#getItems(roomName, this.#consumers)
		return roomConsumers
	}

	getProducers(roomName) {
		let roomProducers = this.#getItems(roomName, this.#producers)
		return roomProducers
	}


	// private methods
	async #createWorker() {
		try {		
			let worker = await mediasoup.createWorker({
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

			// this.#ioConnection()
			this.#ioConnection()
			return worker
		} catch (error) {
			console.log('Worker Error: ', error);
		}
	}

	#removeItems(items, socketId, type, socket) {
		items.forEach(item => {
			if (item.socketId === socket.id) {
				item[type].close()
			}
		})
		items = items.filter(item => item.socketId !== socket.id)

		return items;
	}

	async #createRoom(roomName, socketId) {
		let router1
		let peers = []
		let worker = await this.#worker
		let mediaCodecs = this.#mediaCodecs

		if(this.#rooms[roomName]) {
			// room exists
			router1 = this.#rooms[roomName].router
			peers = this.#rooms[roomName].peers || [];
		} else {
			// room doesnt exist
			router1 = await worker.createRouter({mediaCodecs})
		}

		console.log(`Router ID: ${router1.id}`, peers.length)

		this.#rooms[roomName] = {
			router: router1,
			peers: [...peers, socketId]
		}

		return router1;
	}

	#addTransport(transport, roomName, consumer, type, userName, socket) {
		this.#transports = [
			...this.#transports,
			{
				socketId: socket.id,
				transport,
				roomName,
				consumer,
				type,
				userName
			}
		]

		this.#peers[socket.id] = {
			...this.#peers[socket.id],
			transports: [
				...this.#peers[socket.id].transports,
				transport.id
			]
		}

		// balik dito for checking ng number of transports sa user
		// console.log("TRANSPORT: ", transports)
	}

	#getTransport(socketId, transportId) {
		const [ producerTransport ] = this.#transports.filter(transport =>
			transport.transport.internal.transportId === transportId && !transport.consumer
		)

		return producerTransport.transport
	}

	#addProducer(producer, roomName, type, socket) {
		let userName;
		this.#transports.forEach(transport => {
			if (transport.socketId === socket.id) {
				userName = transport.userName
				return
			}
		})

		this.#producers = [
			...this.#producers,
			{
				socketId: socket.id,
				producer,
				roomName, 
				type,
				userName
			}
		]

		this.#peers[socket.id] = {
			...this.#peers[socket.id],
			producers: [
				...this.#peers[socket.id].producers,
				producer.id
			]
		}
	}

	#addConsumer(consumer, roomName, consumerType, socket) {
		this.#consumers = [
			...this.#consumers,
			{
				socketId: socket.id,
				consumer,
				roomName,
				consumerType
			}
		]

		// add consumer id to the peers list

		this.#peers[socket.id] = {
			...this.#peers[socket.id],
			consumers: [
				...this.#peers[socket.id].consumers,
				consumer.id
			]
		}
	}

	#informConsumers(roomName, socketId, producerId) {
		// console.log('just joined, id', producerId, roomName, socketId)
		// a new produced jus joined
		// all consumer will consume this producer

		let userSharing = false
		this.#producers.forEach(producer => {

			if (producer.type === "screenShareProducer") {
				userSharing = true
				return
			}
		})

		// two times nacacall
		this.#producers.forEach(producer => {

			// check if producer is in the same room with the clients
			if (producer.socketId !== socketId && producer.roomName === roomName) {
				const producerSocket = this.#peers[producer.socketId].socket
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
						producerSocketId: socketId,
						producerUserName: producer.userName
					})
				}
			} 
		})
	}

	#removeScreenItem(items, socketId, type) {
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

	#sendToOtherPeers(roomName, event, socket) {
		Object.values(this.#peers).forEach(peer => {
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
				// console.log(peer.socket.id)
			}
		})
	}

	async #ioConnection() {
		// console.log(this.#connections)
		this.#connections.on('connection', async (socket) => {
			console.log(`SocketId: ${socket.id}`);

			socket.emit('connection-success', {
				socketId: socket.id
			})

			socket.on('disconnect', () => {
				// do some clean up
				console.log('peer disconnected')
				this.#consumers = this.#removeItems(this.#consumers, socket.id, 'consumer', socket)
				this.#producers = this.#removeItems(this.#producers, socket.id, 'producer', socket)
				this.#transports = this.#removeItems(this.#transports, socket.id, 'transport', socket)

				if (this.#peers[socket.id]) {
					const { roomName } = this.#peers[socket.id]
					delete this.#peers[socket.id]

					
					// remove socket from room
					this.#rooms[roomName] = {
						router: this.#rooms[roomName].router,
						peers: this.#rooms[roomName].peers.filter(socketId => socketId !== socket.id)
					}
				}
			})

			socket.on('joinRoom', async({roomName}, callback) => {
				// create router if it doesnt exist
				const router1 = await this.#createRoom(roomName, socket.id);

				// add new user to the peer list
				this.#peers[socket.id] = {
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

			socket.on('createWebRtcTransport', async ({ consumer, type, userName }, callback) => {
				// get the room name for this peer
				const roomName = this.#peers[socket.id].roomName

				// based on the roomname get the router
				const router = this.#rooms[roomName].router


				this.#createWebRtcTransport(router).then(
					transport => {
						callback({
							params: {
								id: transport.id,
								iceParameters: transport.iceParameters,
								iceCandidates: transport.iceCandidates,
								dtlsParameters: transport.dtlsParameters
							}
						})

						this.#addTransport(transport, roomName, consumer, type, userName, socket)
					}, error => {
						console.log("createWebRtcTransport", error);
					}
				)
			})

			socket.on('transportConnect', ({ dtlsParameters, transportId }) => {
				this.#getTransport(socket.id, transportId).connect({ dtlsParameters })
			})

			socket.on('transportProduce', async ({ kind, rtpParameters, appData, transportId, type }, callback) => {
				const producer = await this.#getTransport(socket.id, transportId).produce({ 
					kind,
					rtpParameters,
				})

				// add producer in the producers array
				const { roomName } = this.#peers[socket.id]

				this.#addProducer(producer, roomName, type, socket)

				// inform other clients that a new producer has joined so they can consume
				this.#informConsumers(roomName, socket.id, producer.id);

				// console.log('Producer ID: ', producer.id, producer.kind ,type)

				producer.on('transportclose', () => {
					console.log('transport for this producer closed')
					producer.close();
				})

				callback({
					serverProducerId: producer.id,
					producerExist: this.#producers.length > 1 ? true:false
				})
			})


			socket.on('transportRecvConnect', async ({ dtlsParameters, serverConsumerTransportId }) => {
				// console.log("DTLS Parameters: ", { dtlsParameters });
				const consumerTransport = this.#transports.find(transport => (
					transport.consumer && transport.transport.id == serverConsumerTransportId
				)).transport


				await consumerTransport.connect({ dtlsParameters })
			})


			socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId, consumerType, remoteProducerSocketId }, callback) => {
				try {
					const { roomName } = this.#peers[socket.id]
					const router = this.#rooms[roomName].router
					let consumerTransport = this.#transports.find(transport => (
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

						// console.log('consumer ID: ', consumer.id)

						let consumerId = consumer.id

						consumer.on('transportclose', () => {
							console.log('transport close from consumer')
						})

						consumer.on('producerclose', () => {
							console.log('producer of consumer closed')
							socket.emit('producerClosed', { remoteProducerId, remoteProducerSocketId })

							// remove
							consumerTransport.close([])
							this.#transports = this.#transports.filter(transport => transport.transport.id !== consumerTransport.id)
							consumer.close()

							this.#consumers = this.#consumers.filter(consumer => consumer.consumer.id !== consumerId)
							// console.log("consumersssss", consumers)
						})

						this.#addConsumer(consumer, roomName, consumerType, socket)

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
					console.log("consume", error.message)
					callback({
						params: {
							error: error
						}
					})
				}
			})

			socket.on('consumerResume', async({ serverConsumerId }) => {
				// console.log('consumer resume')
				const { consumer } = this.#consumers.find(consumer => consumer.consumer.id === serverConsumerId)
				await consumer.resume();
			})

			socket.on('getProducers', callback => {
				// return all producer transports

				const { roomName } = this.#peers[socket.id];

				let producerList = []
				// get all producers except current producer
				this.#producers.forEach(producer => {
					if (producer.socketId !== socket.id && producer.roomName === roomName) {
						producerList = [
							...producerList,
							{
								producerId: producer.producer.id,
								producerType: producer.type,
								producerSocketId: producer.socketId,
								producerUserName: producer.userName
							}
						]
					}
				})


				// return to client
				callback(producerList);
			})

			socket.on('closingScreenShare', () => {
				// close screen share transports
				this.#transports = this.#removeScreenItem(this.#transports, socket.id, "screenShareProducer")
				this.#producers = this.#removeScreenItem(this.#producers, socket.id, "screenShareProducer")
				this.#consumers = this.#removeScreenItem(this.#consumers, socket.id, "screenShareConsumer")
			})

			socket.on('handsUp', (data) => {
				// console.log(socket.id, "hands up")
				this.#sendToOtherPeers(data.roomName, "raiseHand", socket)
			})

			socket.on('handsDown', (data) => {
				// console.log(socket.id, "hands down")
				this.#sendToOtherPeers(data.roomName, "lowerHand", socket)
			})

			socket.on('micOn', (data) => {
				// console.log(socket.id, "Mic is on")
				this.#sendToOtherPeers(data.roomName, "micOn", socket)
			})

			socket.on('micOff', (data) => {
				// console.log(socket.id, "Mic is off")
				this.#sendToOtherPeers(data.roomName, "micOff", socket)
			})

			socket.on('camOff', (data) => {
				let itemToRemove;
				// console.log(socket.id, "Cam is off")
				// console.log("PRODUCERSS", producers)
				if (data.producerTransport !== null) {
					// console.log("transport ID", data.producerTransport._id)
					this.#producers.forEach(producer => {
						if (producer.producer.kind === "video" && producer.socketId === socket.id) {
							// console.log(1)
							// console.log("PPPP", producer)
							producer.producer.close()
							itemToRemove = producer
						}
					})

					// console.log(itemToRemove)
					this.#producers = this.#producers.filter(producer => 
						producer !== itemToRemove
					)
				}
				// console.log(producers)
			})


		})

		// connections.on('connection', async (socket) => {
	}

	async #createWebRtcTransport(router) {
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


function setIo(io) {
	const mediasoupp = new Mediasoup(io)
	return mediasoupp
}

export {
	setIo
};
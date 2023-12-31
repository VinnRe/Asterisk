import * as fs from 'fs';
import * as http from 'http';
import express from 'express';
import * as https from 'https';
import cors from 'cors';
import { Server } from 'socket.io';
import * as mediasoup from '../lib/mediasoup.js';

const privateKey = fs.readFileSync('./server/ssl/server.key', 'utf8');
const certificate = fs.readFileSync('./server/ssl/server.crt', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate 
}

const port = 8000;
const app = express();

app.use(cors());

// both express app and ws running on the same http server
// const server = http.createServer(app);
const server = https.createServer(credentials, app);

const io = new Server(server, {
	cors: {
		origins: "http://localhost:3000",
		methods: ["GET", "POST"]
	}
});



app.get("/", (request, response) => {
	// console.log(request);
	response.send("Go to to create room http://localhost:3000/room/{roomName}");
})


server.listen(port, () => {
	console.log(`Server is running at https://localhost:${port}`);
});


let mediasoupInstance = new mediasoup.Mediasoup(io)
// let medisoupp = mediasoup.setIo(io);


// to get the number of users in roomName 
app.get("/get_users/:room", (request, response) => {
	let roomName = request.params.room
	let users = mediasoupInstance.getUsers(roomName)
	response.send({users})
})

app.get("/get_transports/:room", (request, response) => {
	let roomName = request.params.room
	let transports = mediasoupInstance.getTransports(roomName)
	// response.send(transports)
	response.send({transports})
})


app.get("/get_consumers/:room", (request, response) => {
	let roomName = request.params.room
	let consumers = mediasoupInstance.getConsumers(roomName)
	// let userInstance = new socket.Users(roomName)
	// response.send(consumers)
	response.send({consumers})
})

app.get("/get_producers/:room", (request, response) => {
	let roomName = request.params.room
	let producers = mediasoupInstance.getProducers(roomName)
	// let userInstance = new socket.Users(roomName)
	// response.send(producers)
	response.send({producers})
})


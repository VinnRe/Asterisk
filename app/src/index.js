import * as fs from 'fs';
import * as http from 'http';
import express from 'express';
import * as https from 'https';
import cors from 'cors';
import { Server } from 'socket.io';
import * as socket from '../lib/socket.js';

import WebSocket, { WebSocketServer } from 'ws';

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
	// console.log(request.params.roomId);
	response.send("Go to to create room http://localhost:3000/room/{roomName}")
})



server.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});

socket.ioConnection(io);

# to run: python server.py
import schemas

import json
import uvicorn

from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


users = []

async def broadcast_to_room(message: str, sender):
	res = list(filter(lambda i:i["socket"] == sender, users))


	for user in users:
		if sender != user["socket"]:
			await user['socket'].send_text(message)

# async def remove_user()


@app.websocket("/ws/{userID}")
async def websocket_endpoint(websocket: WebSocket, userID: str):
	try:
		await websocket.accept()
		user = {
			"userID": userID,
			"socket": websocket
		}
		users.append(user)
		while True:
			data = await websocket.receive_text()
			# await websocket.send_text(data)
			await broadcast_to_room(data, websocket)

	except WebSocketDisconnect as e:
		print("error: ", e)



@app.get("/")
def index():
	return {"msg": "ok"}



if __name__ == '__main__':
	uvicorn.run('server:app', reload=True)

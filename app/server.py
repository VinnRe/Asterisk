# to run, uvicorn server:app --reload
import schemas

import uuid
import asyncio

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription

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

pcs = set()



# pede apply ng img tranformation sa video (edge detection para sa bg change)
class VideoTransformTrack(MediaStreamTrack):

	# a video stream track that transforms frames from an another track

	kind = "video"

	def __init__(self, track, transform):
	    super().__init__()  # don't forget this!
	    self.track = track
	    self.transform = transform

	async def recv(self):
	    frame = await self.track.recv()
	    return frame


# voice changer??
class AudioTransformTrack(MediaStreamTrack):

	# an audio stream track that transforms frames from an another track

	kind = "audio"

	def __init__(self, track, transform):
	    super().__init__()  # don't forget this!
	    self.track = track
	    self.transform = transform

	async def recv(self):
	    frame = await self.track.recv()
	    return frame


async def on_shutdown(app):
	# close peer connections
	coros = [pc.close() for pc in pcs]
	await asyncio.gather(*coros)
	pcs.clear()


@app.get("/")
def index():
	return {"msg": "ok"}


# fetch sa js para masend yung answer
@app.post("/offer")
async def offer(params: schemas.Offer):

	# offer from js frontend
	sdp = params.sdp
	_type = params.type
	offer = RTCSessionDescription(sdp = sdp, type = _type)

	# # unique id
	# generated_uuid = uuid.uuid4()
	# pc_id = f"pc{generated_uuid}"
	
	pc = RTCPeerConnection()
	pcs.add(pc)
	recorder = MediaBlackhole()

	# def log_info(msg, *args):
 #        logger.info(pc_id + " " + msg, *args)

 #    log_info(f"Created for %s", request.remote)

 	# Open webcam on Windows.
	player = MediaPlayer('video=Integrated Camera', format='dshow', options={
	    'video_size': '640x480'
	})


	# # can be use to record a video call and save it as a file on your server or device.
	# recorder = MediaRecorder("path/file.mp4")


	# check data channel
	@pc.on("datachannel")
	def on_datachannel(channel):
	    @channel.on("message")
	    def on_message(message):
	        if isinstance(message, str) and message.startswith("ping"):
	            channel.send("pong" + message[4:])


	# check the state of ICE connection
	@pc.on("iceconnectionstatechange")
	async def on_iceconnectionstatechange():
	    log_info("ICE connection state is %s", pc.iceConnectionState)
	    if pc.iceConnectionState == "failed":
	        await pc.close()
	        pcs.discard(pc)


	@pc.on("track")
	def on_track(track):
		log_info(f"Track {track.kind} received")

		if track.kind == "audio":
			local_audio = AudioTransformTrack(relay.subscribe(track))
			pc.addTrack(local_audio)
		elif track.kind == "video":
			local_video = VideoTransformTrack(relay.subscribe(track), transform="")
			pc.addTrack(local_video)

		@track.on("ended")
		async def on_ended():
			log_info(f"Track {track.kind} ended")
			# await recorder.stop()


	# handle offer
	await pc.setRemoteDescription(offer)
	await recorder.start()


	# generate an spd answer
	answer = await pc.createAnswer()
	await pc.setLocalDescription(answer)


	# send answer
	sdp = pc.localDescription.sdp
	_type = pc.localDescription.type 
	return {"sdp": sdp, "type": _type}

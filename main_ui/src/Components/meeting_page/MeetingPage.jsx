// move other functions to join Conference jsx
// matitira here is yung functions needed sa pagcreate lang ng new room


// run index.js
// /app/src/npm run start:dev

// create conference
// yung btn na create conference need maggenerate ng random pathName
// http://localhost:3000/room/{anyy} -- use this sa create conference

// edit the config.js file   announcedIp: '192.168.0.116' // replace by public IP address





import React, { useEffect, useState, useRef } from 'react';
import './styles.css';
import * as meetIcons from './imports';
import Clock from './clock';
import * as mediasoupClient from "mediasoup-client";
import { io } from "socket.io-client";


export const MeetingPage = () => {
  // const userID = window.crypto.randomUUID();

  // create channel link "?room=asdfafafgbn"
  const roomName = window.location.pathname.split('/')[2];

  console.log(roomName);

  // free stun server -- from google
  const servers = {
    iceServers: [{
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }]
  }

  const localVideoRef = useRef(null);
  const localAudioRef = useRef(null);

  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [camStatus, setCamStatus] = useState('Hide Cam');
  const [micStatus, setMicStatus] = useState('Mute Mic');
  const [screenStatus, setScreenStatus] = useState('Share Screen');
  const [screenShareStream, setScreenShareStream] = useState(null);
  // const [endCall, setEndCall] = useState(false);

  let localStream;
  let device;
  let rtpCapabilities
  let producerTransport;
  let consumerTransports = []
  let producer;
  let consumer;
  let isProducer = false
  let params = {
    encoding: [
      {
        rid: 'r0',
        maxBitrate: 100000,
        scalabilityMode: 'S1T3'
      },
      {
        rid: 'r1',
        maxBitrate: 300000,
        scalabilityMode: 'S1T3'
      },
      {
        rid: 'r2',
        maxBitrate: 300000,
        scalabilityMode: 'S1T3'
      }
    ], 
    codecOptions: {
      videoGoogleStartBitrate : 1000
    }
  };


  // Function to toggle the camera stream
  function toggleCamera() {
    if (stream) {
      const videoTrack = stream.getTracks().find(track => track.kind === 'video');
      if (videoTrack.enabled) {
        videoTrack.enabled = false;
        setCamStatus('Show Cam');
      } else {
        videoTrack.enabled = true;
        setCamStatus('Hide Cam');
      }
    }
  }

  // Function to toggle the microphone stream
  function toggleMic() {
    if (stream) {
      const audioTrack = stream.getTracks().find(track => track.kind === 'audio');
      if (audioTrack.enabled) {
        audioTrack.enabled = false;
        setMicStatus('Unmute Mic');
      } else {
        audioTrack.enabled = true;
        setMicStatus('Mute Mic');
      }
    }
  }

  // Resize of button images
  const imageSize = {
    width: '2rem',
    height: '2rem',
  };

  async function endStream() {
    setScreenShareStream(null);
    setScreenStatus("Share Screen");
    let screenVidCon = await document.getElementById("screenVidShare");
    let screenAudCon = await document.getElementById("screenAudShare");
    screenVidCon.remove();
    screenAudCon.remove();
  }

  async function toggleScreenShare() {
    try {
      if (screenShareStream == null) {
        const userScreen = await navigator.mediaDevices.getDisplayMedia({
          cursor:true,
          video: true,
          audio: false
        })

        await setScreenShareStream(userScreen);
        await setScreenStatus("Stop Sharing");

        let vid_con = document.getElementById("video-container");
        let screen_vid_con = document.createElement("video");
        let screen_aud_con = document.createElement("audio");

        screen_vid_con.setAttribute('id', 'screenVidShare');
        screen_aud_con.setAttribute('id', 'screenAudShare');

        screen_vid_con.setAttribute('playsInline', 'playsInline');
        screen_vid_con.setAttribute('autoPlay', "autoPlay");
        screen_vid_con.className = "video-element";
        screen_vid_con.srcObject = userScreen;

        vid_con.appendChild(screen_vid_con);
        vid_con.appendChild(screen_aud_con);

        const cur_screen_vid_con = {current: screen_vid_con}
        const cur_screen_aud_con = {current: screen_aud_con}

        resizeVideoElements(cur_screen_vid_con, cur_screen_aud_con);
      
      } else {
        var tracks = await screenShareStream.getVideoTracks();
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].stop();
        }
        endStream();  
      }

    } catch (error) {
      console.log("Error: ", error);
    }
  }

  if (screenShareStream != null) {  // screenshare on
    screenShareStream.getVideoTracks()[0].addEventListener('ended', async () => {
      endStream();  
    });
  }

  function endCall() {
    window.location.replace("http://localhost:3000");
  }

  function resizeVideoElements(videoRef, audioRef) {
    if (videoRef.current && audioRef.current) {
      const videoContainerWidth = videoRef.current.offsetWidth;
      const videoContainerHeight = videoRef.current.offsetHeight;
      const aspectRatio = 4 / 3; // You can adjust this based on your desired aspect ratio

      // Calculate the width and height for the video elements
      let videoWidth = videoContainerWidth;
      let videoHeight = videoContainerWidth / aspectRatio;

      // Check if the calculated video height exceeds the container height
      if (videoHeight > videoContainerHeight) {
          videoHeight = videoContainerHeight;
          videoWidth = videoContainerHeight * aspectRatio;
      }

      // Set the width and height for video elements
      videoRef.current.style.width = `${videoWidth}px`;
      videoRef.current.style.height = `${videoHeight}px`;
      audioRef.current.style.width = `${videoWidth}px`;
      audioRef.current.style.height = `${videoHeight}px`;
    }
  }


  useEffect(() => {


    const socket = io('https://127.0.0.1:8000/mediasoup');
    
    function connectSocket() {
      socket.on('connect', () => {
        console.log('Connected!');

        // send yung roomName sa server-side
      })
      socket.on('connection-success', ({ socketId }) => {
        console.log(socketId);
        startStream();
      });
    }

    async function startStream() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true, 
          audio: {
            echoCancellation: true
          }
        });

        setStream(localStream);


        // Attach video localStream to the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Attach audio localStream to the audio element
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
        }

        const track = localStream.getVideoTracks()[0];
        params = {
          track,
          ...params
        }

        joinRoom();


      } catch (error) {
        console.error('Error accessing media devices: ', error);
      }
    }

    function joinRoom() {
      socket.emit('joinRoom', { roomName }, (data) => {
        // get the router rtp capability
        console.log("Router RTP Capabilities", data.rtpCapabilities)
        rtpCapabilities = data.rtpCapabilities;
        createDevice()
      })
    }


    async function createDevice() {
      try {
        device = new mediasoupClient.Device()

        await device.load({
          routerRtpCapabilities: rtpCapabilities
        })

        console.log("Device RTP Capabilities: ", device.rtpCapabilities);

        // everyone is both producer and consumer
        createSendTransport();

      } catch (error) {
        console.log(`Error: ${error}`);

        if (error.name === 'UnsupportedError') {
          console.warn('browser not supported');
        }
      }
    }

    // server informs the client that a new producer (user) just joined
    socket.on('newProducer', ({ producerId }) => {
      createNewConsumerTransport(producerId);
    })

    // ask the server to get the producer's ids
    function getProducers() {
      socket.emit('getProducers', remoteProducersIds => {
        //  for each producer create consumer
        remoteProducersIds.forEach(remoteProducerId => {
          createNewConsumerTransport(remoteProducerId);
        })
      })
    }

    function createSendTransport() {
      //  when we join, we join as a producer
      socket.emit('createWebRtcTransport', { consumer:false }, ({ params }) => {
      
      // get producers transport parameters from the server side
        if (params.error) {
          console.log("producer transport create error", params.error);
          return;
        }
        // console.log(params);

        // creae new webrtc transport to send media
        producerTransport = device.createSendTransport(params);

        producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            // send local DTLS parameters to the server side transport
            await socket.emit('transportConnect', {
              dtlsParameters: dtlsParameters
            })

            // Tell the transport that parameters were transmitted
            callback();

          } catch (error) {
            errback(error);
          }
        })

        producerTransport.on('produce', async (parameters, callback, errback) => {
          // console.log(parameters);

          try {
            // tell the server to create a Producer
            await socket.emit('transportProduce', {
              kind: parameters.kind,
              rtpParameters: parameters.rtpParameters,
              appData: parameters.appData
            }, ({ serverProducerId, producerExist }) => {
              // server will let us know if there's other producer
              // Tell the transport that parameters were transmitted and produced
              callback({ serverProducerId })
              
              // if producer exist, join the room
              if (producerExist) {
                getProducers();
              }


            })
          } catch (error) {
            errback(error);
          }

        })

        connectSendTransport();
      })

    }

    async function connectSendTransport() {
      producer = await producerTransport.produce(params)

      producer.on('trackended', () => {
        console.log('track ended');

        // close video track
      })

      producer.on('transportclose', () => {
        console.log('transport ended');

        // close video track
      })
    }

    async function createNewConsumerTransport(remoteProducerId) {
      // console.log("NEW USER JUST JOINED");

      //     if (consumingTransports.includes(remoteProducerId)) return;
      // consumingTransports.push(remoteProducerId);


      await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
        if (params.error) {
          console.log("consumer transport create error", params.error);
          return;
        }
        // console.log(params);

        let consumerTransport;

        try {

          //  create the recv transport
          consumerTransport = device.createRecvTransport(params);
        } catch (error) {
          console.log(error)
          return
        }


        consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            // send local DTLS parameters to the server side transport
            await socket.emit('transportRecvConnect', {
              dtlsParameters: dtlsParameters,
              serverConsumerTransportId: params.id
            })

            // Tell the transport that parameters were transmitted
            callback();
          } catch (error) {
            errback(error);
          }
        })
        // params.id is the server side consumer transport id
        connectRecvTransport(consumerTransport, remoteProducerId, params.id);
      });
    }

    async function connectRecvTransport(consumerTransport, remoteProducerId, serverConsumerTransportId) {
      //  tell the server to create a consumer based on the rtp capabilities
      //  if the router can consume, server side will send back params
      await socket.emit('consume', {
        rtpCapabilities: device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId
      }, async ({ params }) => {
        if (params.error) {
          console.log("Cannot Consumer")
          return
        }

        // console.log(params)

        // consume with the local consumer transport which creates a consumer

        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters
        })

        consumerTransports = [
          ...consumerTransports,
          {
            consumerTransport,
            serverConsumerTransportId: params.id,
            producerId: remoteProducerId,
            consumer
          }
        ]

        // get audio/video track
        // create a new div element for the new consumer media
        // append sa video-container
        let vid_con = document.getElementById("video-container");
        const videoElement = document.createElement('video');
        const audioElement = document.createElement('audio');

        videoElement.setAttribute('id', remoteProducerId);
        videoElement.setAttribute('playsInline', true);
        videoElement.setAttribute('autoPlay', true);
        videoElement.setAttribute('ref', `${remoteVideoRef}`);
        videoElement.className = "video-element";
        vid_con.appendChild(videoElement);


        const { track } = consumer

        videoElement.srcObject = new MediaStream([ track ]);

        const remoteCurrentVid = {current: videoElement}
        const remoteCurrentAud = {current: audioElement}

        resizeVideoElements(remoteCurrentVid, remoteCurrentAud);


        // let the server know which consumerid to resume
        socket.emit('consumerResume', { serverConsumerId: params.serverConsumerId})


      })
    }

    socket.on('producerClosed', ({ remoteProducerId }) => {
      // server will let us know when a user left
      // filter the remoteProducerId in thconsumertransport array 

      const producerToClose = consumerTransports.find((transportData) => 
        transportData.producerId === remoteProducerId
      )

      producerToClose.consumerTransport.close()
      producerToClose.consumer.close()

      // remove that consumer transport in the consumerTransports array
      consumerTransports = consumerTransports.filter(transportData => 
        transportData.producerId !== remoteProducerId
      )

      // remove the video element
      let vid_con = document.getElementById("video-container");
      vid_con.removeChild(document.getElementById(remoteProducerId))
    })



    // Call the resize function when the window is resized
    window.addEventListener('resize', resizeVideoElements);

    // Call the resize function on initial render
    resizeVideoElements(localVideoRef, localAudioRef);


    connectSocket();

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', resizeVideoElements);
    };

  }, []);

  return (
    <div className="container">
      <header className="meeting-header">
        <h1>Asterisk - Video Meeting App</h1>
        <div id="video-container" className="video-container">
          {/* Add video elements here */}
          <video ref={localVideoRef} muted autoPlay playsInline className="video-element"></video>
          <audio ref={localAudioRef} muted autoPlay playsInline className="audio-element"></audio>

        </div>
        <div className="button__control-panel">
            <div className="clock-content">
              <Clock />
            </div>
            <button className="toggle-button" onClick={toggleCamera}>
              <div className="button-content">
                {camStatus === 'Hide Cam' ? (
                  <img src={meetIcons.camOnIcon} alt='camOn' style={imageSize} />
                ) : (
                  <img src={meetIcons.camOffIcon} alt='camOff' style={imageSize} />
                )} 
                <span>{camStatus}</span>
              </div>
            </button>
            <button className="toggle-button" onClick={toggleMic}>
              <div className="button-content">
                {micStatus === 'Mute Mic' ? (
                  <img src={meetIcons.micOnIcon} alt='micOn' style={imageSize} />
                ) : (
                  <img src={meetIcons.micOffIcon} alt='micOff' style={imageSize} />
                )} 
                <span>{micStatus}</span>
              </div>
            </button>
            <button className="toggle-button" onClick={toggleScreenShare}>
              <div className="button-content">
                {screenStatus === 'Share Screen' ? (
                  <img src={meetIcons.shareScreenOnIcon} alt='shareScreenOn' style={imageSize} />
                ) : (
                  <img src={meetIcons.shareScreenOffIcon} alt='shareScreenOff' style={imageSize} />
                )} 
                <span>{screenStatus}</span>
              </div>
            </button>
            <button className="toggle-button" onClick>
              <div className="button-content">
                <img src={meetIcons.raiseHandIcon} alt="raiseHandIcon" style={imageSize} />
                <span>Raise Hand</span>
              </div>
            </button>
            <button className="toggle-button" onClick>
              <div className="button-content">
                <img src={meetIcons.chatIcon} alt="chatIcon" style={imageSize} />
                <span>Open Chat</span>
              </div>
            </button>
            <button className="toggle-button" onClick={endCall}>
                <div className="button-content">
                  <img src={meetIcons.endCallIcon} id="endCallBtn" alt="callEndIcon" style={imageSize} />
                  <span>End Call</span>
                </div>
            </button>
        </div>
      </header>
    </div>
  );
};
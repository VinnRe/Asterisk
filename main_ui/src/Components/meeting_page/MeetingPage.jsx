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


  let socket = io.connect('https://127.0.0.1:8000/mediasoup');
export const MeetingPage = () => {

  const userID = window.crypto.randomUUID();

  // create channel link "?room=asdfafafgbn"
  const roomName = window.location.pathname.split('/')[2];

  console.log(roomName);


  const localVideoRef = useRef(null);
  const localAudioRef = useRef(null);

  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [camStatus, setCamStatus] = useState('Hide Cam');
  const [micStatus, setMicStatus] = useState('Mute Mic');
  const [screenStatus, setScreenStatus] = useState('Share Screen');
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [ddevice, setDevice] = useState(null);
  const [screenVidParams, setScreenVidParams] = useState(null);
  const [screenAudParams, setScreenAudParams] = useState(null);
  // const [socket, setSocket] = useState(io.connect('https://127.0.0.1:8000/mediasoup'))
  // const [endCall, setEndCall] = useState(false);

  let localStream;
  let device;
  let rtpCapabilities
  let screenProducerTransport
  let producerTransport;
  let consumerTransports = []
  let audioProducer
  let videoProducer
  let screenshareAudioProducer
  let screenshareVidProducer
  let consumer;
  let isProducer = false
  let params = {
    encoding: [
      {
        rid: 'r0',
        maxBitrate: 100000,
        scalabilityMode: 'S1T1'
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

  let audioParams
  let screenshareAudParams
  let videoParams = { params }
  let screenshareVidParams = { params }
  let consumingTransports = []


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
        // create new transport


        const userScreen = await navigator.mediaDevices.getDisplayMedia({
          cursor:true,
          video: true,
          audio: true
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

        resizeVideoElements(cur_screen_vid_con);
        resizeVideoElements(cur_screen_aud_con)

        screenshareVidParams = {
          track: userScreen.getVideoTracks()[0],
          ...screenshareVidParams
        }

        screenshareAudParams = {
          track: userScreen.getAudioTracks()[0],
          ...screenshareAudParams
        }

        setScreenVidParams(screenshareVidParams);
        setScreenAudParams(screenshareAudParams);

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

  function resizeVideoElements(videoRef) {
    if (videoRef.current) {
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
    }
  }

  useEffect(() => {  
  
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
          audio: true
        });

        setStream(localStream);


        // Attach video localStream to the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.muted = true;
        }

        // Attach audio localStream to the audio element
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
          localAudioRef.current.muted = true;
        }

        videoParams = {
          track: localStream.getVideoTracks()[0],
          ...videoParams
        }

        audioParams = {
          track: localStream.getAudioTracks()[0],
          ...audioParams
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

        setDevice(device);

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
    socket.on('newProducer', ({ producerId, producerType }) => {
      // console.log(producerType)
      createNewConsumerTransport(producerId, producerType);
    })

    // ask the server to get the producer's ids
    function getProducers() {
      socket.emit('getProducers', remoteProducers => {
        //  for each producer create consumer
        remoteProducers.forEach(remoteProducer => {
          // console.log(remoteProducer.producerType)
          createNewConsumerTransport(remoteProducer.producerId, remoteProducer.producerType);
        })
      })
    }

    function createSendTransport() {
      //  when we join, we join as a producer
      socket.emit('createWebRtcTransport', { consumer:false, type:"userProducer" }, ({ params }) => {
      
      // get producers transport parameters from the server side
        if (params.error) {
          console.log("producer transport create error", params.error);
          return;
        }
        // console.log(params);

        // creae send transport
        producerTransport = device.createSendTransport(params);

        producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            // send local DTLS parameters to the server side transport
            await socket.emit('transportConnect', {
              transportId: producerTransport.id,
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
              appData: parameters.appData,
              transportId: producerTransport.id,
              type: "userProducer"

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

      // console.log(producerTransport)

      audioProducer = await producerTransport.produce(audioParams)
      videoProducer = await producerTransport.produce(videoParams)


      audioProducer.on('trackended', () => {
        console.log('audio track ended')

        // close audio track
      })

      audioProducer.on('transportclose', () => {
        console.log('audio transport ended')

        // close audio track
      })

      videoProducer.on('trackended', () => {
        console.log('video track ended')

        // close video track
      })

      videoProducer.on('transportclose', () => {
        console.log('video trans ended')

        // close video track
      })
    }

    async function createNewConsumerTransport(remoteProducerId, remoteProducerType) {
      console.log(remoteProducerId);
      console.log(remoteProducerType);

      let consumerType;

      if (remoteProducerType === "screenShareProducer") {
        consumerType = "screenShareConsumer"
      } else {
        consumerType = "userConsumer"
      }

      if (consumingTransports.includes(remoteProducerId)) {
        return;
      }
      consumingTransports.push(remoteProducerId);

      await socket.emit('createWebRtcTransport', { consumer: true, type:consumerType }, ({ params }) => {
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
        connectRecvTransport(consumerTransport, remoteProducerId, params.id, consumerType);
      });
    }

    async function connectRecvTransport(consumerTransport, remoteProducerId, serverConsumerTransportId, consumerType) {
      //  tell the server to create a consumer based on the rtp capabilities
      //  if the router can consume, server side will send back params
      await socket.emit('consume', {
        rtpCapabilities: device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId,
        consumerType: consumerType
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
        let audioElement
        let videoElement

        if (params.kind == 'audio') {
          audioElement = document.createElement('audio');
          audioElement.setAttribute('id', remoteProducerId);
          audioElement.setAttribute('playsInline', true);
          audioElement.setAttribute('autoPlay', true);
          audioElement.className = "audio-element";
          vid_con.appendChild(audioElement);
        } else {
          videoElement = document.createElement('video');
          videoElement.setAttribute('id', remoteProducerId);
          videoElement.setAttribute('playsInline', true);
          videoElement.setAttribute('autoPlay', true);
          videoElement.className = "video-element";
          vid_con.appendChild(videoElement);
        }


        const { track } = consumer
        const remoteElem = document.getElementById(remoteProducerId)

        remoteElem.srcObject = new MediaStream([ track ]);

        const remoteCurrentVid = {current: videoElement}
        const remoteCurrentAud = {current: audioElement}

        console.log(remoteCurrentVid)

        resizeVideoElements(remoteCurrentVid)
        resizeVideoElements(remoteCurrentAud)


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
    resizeVideoElements(localVideoRef)
    resizeVideoElements(localAudioRef)


    connectSocket();

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', resizeVideoElements);
    };

  }, []);

  useEffect(() => {
    if (screenShareStream){
      console.log("sharing screen")

      // create new transport and 2 producers
      function screenCreateSendTransport() {
        // create new producer for screen sharing
        socket.emit('createWebRtcTransport', { consumer:false, type:"screenShareProducer" }, ({ params }) => {
        // get producers transport parameters from the server side
        // webrtctransport created!!
          if (params.error) {
            console.log("producer transport create error", params.error);
            return;
          }

          // console.log(params);

          // create new producer transport to send media
          screenProducerTransport = ddevice.createSendTransport(params);

          screenProducerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
              console.log('producer on connect')
              // send local DTLS parameters to the server side transport
              await socket.emit('transportConnect', {
                transportId: screenProducerTransport.id,
                dtlsParameters: dtlsParameters
              })

              // Tell the transport that parameters were transmitted
              callback();

            } catch (error) {
              errback(error);
            }
          })

          screenProducerTransport.on('produce', async (parameters, callback, errback) => {
            try {

              console.log('producer on produce')

              // // tell the server to create a Producer
              await socket.emit('transportProduce', {
                kind: parameters.kind,
                rtpParameters: parameters.rtpParameters,
                appData: parameters.appData,
                transportId: screenProducerTransport.id,
                type: "screenShareProducer"
              }, ({ serverProducerId, producerExist }) => {
                // server will let us know if there's other producer
                // Tell the transport that parameters were transmitted and produced
                callback({ serverProducerId })
              })
            } catch (error) {
              errback(error);
            }

          })
          connectSendTransport();
        })

      }

      async function connectSendTransport() {
        // console.log(screenVidParams);
        // console.log(screenAudParams);

        if (screenshareVidParams != undefined) {
          console.log('vid not undefined')
          screenshareVidProducer = await screenProducerTransport.produce(screenVidParams)
        }

        if (screenshareAudParams != undefined) {
          console.log('audio not undefined')
          screenshareAudioProducer = await screenProducerTransport.produce(screenAudParams)

          screenshareAudioProducer.on('trackended', () => {
            console.log('audio track ended')

            // close audio track
          })

          screenshareAudioProducer.on('transportclose', () => {
            console.log('audio transport ended')

            // close audio track
          })
        }

        screenshareVidProducer.on('trackended', () => {
          console.log('video track ended')

          // close video track
        })

        screenshareVidProducer.on('transportclose', () => {
          console.log('video trans ended')

          // close video track
        })
      }


      screenCreateSendTransport();


    } else {
      console.log("not sharing screen")

      if (socket.connected) {
        socket.emit("closingScreenShare")
      }
    }
  }, [screenShareStream]);

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
            <button className="toggle-button">
              <div className="button-content">
                <img src={meetIcons.raiseHandIcon} alt="raiseHandIcon" style={imageSize} />
                <span>Raise Hand</span>
              </div>
            </button>
            <button className="toggle-button">
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
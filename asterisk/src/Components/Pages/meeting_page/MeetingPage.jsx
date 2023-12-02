
import React, { useEffect, useState, useRef } from 'react';
import '../../Styles/meet_styles.css';
import * as meetIcons from './imports';
import Clock from './clock';
import { Link } from 'react-router-dom';
import * as mediasoupClient from "mediasoup-client";
import { io } from "socket.io-client";
import { resizeVideoElements } from './videoFunctions';
import ChatApp from '../chat_bar/ChatApp';



// const socket = io.connect('https://127.0.0.1:8000/mediasoup');

export const MeetingPage = ({ userName, audioVolume, setAudioVolume, roomNumber, camStatus, setCamStatus, micStatus, setMicStatus }) => {

  const roomName = window.location.pathname.split('/')[2];

  const [ssocket, setSocket] = useState(null);

  const localVideoRef = useRef(null);
  const localAudioRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [ddevice, setDevice] = useState(null);

  const [raiseHandStyle, setRaiseHandStyle] = useState(null);
  const [raiseHand, setRaiseHand] = useState(false);

  const [screenVidParams, setScreenVidParams] = useState(null);
  const [screenAudParams, setScreenAudParams] = useState(null);
  const [screenStatus, setScreenStatus] = useState('Share Screen');
  const [screenShareStream, setScreenShareStream] = useState(null);

  
  const [isChatOpen, setChatOpen] = useState(false);

  // Function to toggle the chat sidebar
  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };

  const [userCount, setUserCount] = useState(1);

  let device;
  let localStream;
  let rtpCapabilities;

  let producerTransport;
  let consumerTransports = []
  let screenProducerTransport;

  let audioProducer;
  let videoProducer;
  let screenshareAudProducer;
  let screenshareVidProducer;

  let consumer;
  let isProducer = false;

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

  let audioParams;
  let videoParams = { params };

  let screenshareAudParams;
  let screenshareVidParams = { params };

  let consumingTransports = [];


  // Function to toggle the microphone stream
  function toggleMic() {
    if (stream) {
      const audioTrack = stream.getTracks().find(track => track.kind === 'audio');
      if (micStatus === 'Mute Mic') {
        audioTrack.enabled = false;
        setMicStatus(false);
      } else {
        audioTrack.enabled = true;
        setMicStatus(true);
      }
    }
  } 


  // Function to toggle the camera stream
  function toggleCamera() {
    if (stream) {
      const videoTrack = stream.getTracks().find(track => track.kind === 'video');
      if (camStatus === 'Hide Cam') {
        videoTrack.enabled = false;
        setCamStatus(false);
      } else {
        videoTrack.enabled = true;
        setCamStatus(true);
      }
    }
  }

  console.log("camStatus: ", camStatus);
  console.log("micStatus: ", micStatus);

  async function endStream() {
    setScreenShareStream(null);
    setScreenStatus("Share Screen");
    let screenVidCon = await document.getElementById("screenVidShare");
    let screenAudCon = await document.getElementById("screenAudShare");
    screenVidCon.remove();
    screenAudCon.remove();
  }

  function endCall() {
    window.location.replace("http://localhost:3000/home");
  }

  async function toggleScreenShare() {
    try {
      if (screenShareStream == null) {
        const userScreen = await navigator.mediaDevices.getDisplayMedia({
          cursor:true,
          video: true,
          audio: true
        })

        await setScreenShareStream(userScreen);
        await setScreenStatus("Stop Sharing");

        let local_vid_con1 = document.getElementsByClassName("local-vid-con1")[0];
        let screen_vid_con = document.createElement("video");
        let screen_aud_con = document.createElement("audio");

        screen_vid_con.setAttribute('id', 'screenVidShare');
        screen_aud_con.setAttribute('id', 'screenAudShare');

        screen_vid_con.setAttribute('playsInline', 'playsInline');
        screen_vid_con.setAttribute('autoPlay', "autoPlay");
        screen_vid_con.className = "video-element";
        screen_vid_con.srcObject = userScreen;
        
        local_vid_con1.appendChild(screen_vid_con);
        local_vid_con1.appendChild(screen_aud_con);

        const cur_screen_vid_con = {current: screen_vid_con}
        const cur_screen_aud_con = {current: screen_aud_con}

        resizeVideoElements(cur_screen_vid_con);
        resizeVideoElements(cur_screen_aud_con);

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

  if (screenShareStream != null) {
    screenShareStream.getVideoTracks()[0].addEventListener('ended', async () => {
      endStream();  
    });
  }

  async function toggleRaiseHand() {
    if (!raiseHand) {
      setRaiseHand(true);

      setRaiseHandStyle({backgroundColor: "rgb(158, 44, 44)"});
    } else {
      setRaiseHand(false);

      setRaiseHandStyle(null);
    }
  }


  useEffect(() => {
    const socket = io.connect('https://127.0.0.1:8000/mediasoup')
    setSocket(socket)


    function connectSocket() {
      console.log("here")
      socket.on('connect', () => {
        console.log('Connected!');

      })
      socket.on('connection-success', ({ socketId }) => {
        console.log(socketId);

        let local_vid_con1 = document.getElementsByClassName("local-vid-con1")[0];
        local_vid_con1.setAttribute("id", socketId)

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

    // 4 TIMES NA NACACALL TOOO 
    // NEED TO CHECK THE BACKEND
    // LATERRRR
    socket.on('newProducer', ({ producerId, producerType, producerSocketId }) => {
      createNewConsumerTransport(producerId, producerType, producerSocketId);
    })

    // ask the server to get the producer's ids
    function getProducers() {
      socket.emit('getProducers', remoteProducers => {
        //  for each producer create consumer
        remoteProducers.forEach(remoteProducer => {
          createNewConsumerTransport(remoteProducer.producerId, remoteProducer.producerType, remoteProducer.producerSocketId);
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
      
      audioProducer = await producerTransport.produce(audioParams)
      videoProducer = await producerTransport.produce(videoParams)

      audioProducer.on('trackended', () => {
        console.log('audio track ended')
        // close audio track
      })

      audioProducer.on('transportclose', () => {
        console.log('audio transport ended')
      })
      
      videoProducer.on('trackended', () => {
        console.log('video track ended')
      }) // close video track

      videoProducer.on('transportclose', () => {
        console.log('video transport ended')
      })
    }

    async function createNewConsumerTransport(remoteProducerId, remoteProducerType, remoteProducerSocketId) {

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

        connectRecvTransport(consumerTransport, remoteProducerId, params.id, consumerType, remoteProducerSocketId);
      });
    }

    async function connectRecvTransport(consumerTransport, remoteProducerId, serverConsumerTransportId, consumerType, remoteProducerSocketId) {
      //  tell the server to create a consumer based on the rtp capabilities
      //  if the router can consume, server side will send back params

      await socket.emit('consume', {
        rtpCapabilities: device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId,
        consumerType: consumerType,
        remoteProducerSocketId: remoteProducerSocketId
      }, async ({ params }) => {
        if (params.error) {
          console.log("Cannot Consume")
          return
        }

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

        let vid_con1;

        if (!document.getElementById(remoteProducerSocketId)) {
          vid_con1 = document.createElement("div");
          vid_con1.className = "vid-con1"
          vid_con1.setAttribute('id', remoteProducerSocketId)

          let icon_status = document.createElement("div");
          icon_status.className = "icon-status"

          vid_con1.appendChild(icon_status)

        } else {
          vid_con1 = document.getElementById(remoteProducerSocketId)
        }
      
        let vid_con = document.getElementById("video-container");
        let audioElement;
        let videoElement;
        
        if (params.kind == 'audio') {
          audioElement = document.createElement('audio');
          audioElement.setAttribute('id', remoteProducerId);
          audioElement.setAttribute('autoPlay', true);
          audioElement.setAttribute('playsInLine', true);
          audioElement.className = "audio-element";

          vid_con1.appendChild(audioElement);

        } else {
          videoElement = document.createElement('video');
          videoElement.setAttribute('id', remoteProducerId);
          videoElement.setAttribute('playsInline', true);
          videoElement.setAttribute('autoPlay', true);
          videoElement.className = "video-element";
          vid_con1.appendChild(videoElement);
        }

        vid_con.appendChild(vid_con1)
        
        const { track } = consumer;
        const remoteElem = document.getElementById(remoteProducerId);

        remoteElem.srcObject = new MediaStream([ track ]);

        const remoteCurrentVid = {current: videoElement}
        const remoteCurrentAud = {current: audioElement}

        resizeVideoElements(remoteCurrentVid)
        resizeVideoElements(remoteCurrentAud)

        if (micStatus) {
          socket.emit("micOn", {roomName: roomName})
        } else {
          socket.emit("micOff", {roomName: roomName})
        }

        // let the server know which consumerid to resume
        socket.emit('consumerResume', { serverConsumerId: params.serverConsumerId})
      })
    }

    socket.on('producerClosed', ({ remoteProducerId, remoteProducerSocketId }) => {
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
      let vid_con1 = document.getElementById(remoteProducerSocketId);
      let elementToRemove = document.getElementById(remoteProducerId) 
      vid_con1.removeChild(elementToRemove)

      console.log(vid_con1.childElementCount)
      if (vid_con1.childElementCount === 1) {
        vid_con.removeChild(vid_con1)
      }
    })



    // Call the resize function when the window is resized
    window.addEventListener('resize', resizeVideoElements);

    // Call the resize function on initial render
    resizeVideoElements(localVideoRef)
    resizeVideoElements(localAudioRef)

    connectSocket();

    function set_icon_on(userSocketId, icon) {
      let on = false
      if (document.getElementById(userSocketId)) {
        console.log("mic on", userSocketId)

        document.getElementById(userSocketId)
          .querySelectorAll('span')
          .forEach(element => {
            if (element.innerHTML === icon) {
              on = true
              console.log(userSocketId, "meron na")
            }
          }
        )

        if (!on) {
          let icon_status = document.getElementById(userSocketId).firstChild
          let span = document.createElement('span')
          span.className = "material-icons control-buttons"
          span.innerHTML = icon

          if (icon === "mic_none") {
            icon_status.prepend(span)
          } else {
            icon_status.appendChild(span)
          }
        }
      }
    }

    function set_icon_off(userSocketId, icon) {
      if (document.getElementById(userSocketId)) {
        document.getElementById(userSocketId)
          .querySelectorAll('span')
          .forEach(element => {
            if (element.innerHTML === icon) {
              element.remove()
            }
          }
        )
      }
    }

    socket.on("userRaisedHand", (data) => {
      set_icon_on(data.userSocketId, "back_hand")
    })

    socket.on("userLowerHand", (data) => {
      set_icon_off(data.userSocketId, "back_hand")
    })

    socket.on("userMicOn", (data) => {
      set_icon_on(data.userSocketId, "mic_none")
    })

    socket.on("userMicOff", (data) => {
      set_icon_off(data.userSocketId, "mic_none")
    })


    // Get the user count FOR OTHER PURPOSE
    const fetchUserCount = async () => {
      let url = "https://127.0.0.1:8000/get_users/" + roomName;


      const response = await fetch(url); // CHANGE THE API ENDPOINT FOR USERCOUNT
      const data = await response.json();

      
      setUserCount(data.users);
    }

    fetchUserCount(); // 

    // Get the audio volume value from localStorage and set it in the state
    const storedAudioVolume = localStorage.getItem('audioVolume');
    if (storedAudioVolume !== null) {
      setAudioVolume(Number(storedAudioVolume));
    }

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', resizeVideoElements);
    };

  }, []);


  // di pa taposss
  useEffect(() => {
    console.log(audioVolume)
  }, [audioVolume])


  useEffect(() => {
    if (screenShareStream){
      console.log("sharing screen")

      // create new transport and 2 producers
      function screenCreateSendTransport() {
        // create new producer for screen sharing
        ssocket.emit('createWebRtcTransport', { consumer:false, type:"screenShareProducer" }, ({ params }) => {
        // get producers transport parameters from the server side
        // webrtctransport created!!
          if (params.error) {
            console.log("producer transport create error", params.error);
            return;
          }

          // create new producer transport to send media
          screenProducerTransport = ddevice.createSendTransport(params);

          screenProducerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
              // send local DTLS parameters to the server side transport
              await ssocket.emit('transportConnect', {
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
              // // tell the server to create a Producer
              await ssocket.emit('transportProduce', {
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
        console.log(screenVidParams.track);
        console.log(screenAudParams.track);

        if (screenVidParams.track !== undefined) {
          screenshareVidProducer = await screenProducerTransport.produce(screenVidParams)
          console.log('vid on')
        }

        if (screenAudParams.track !== undefined) {
          console.log('audio on')

          screenshareAudProducer = await screenProducerTransport.produce(screenAudParams)

          screenshareAudProducer.on('trackended', () => {
            console.log('audio track ended')

            // close audio track
          })

          screenshareAudProducer.on('transportclose', () => {
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

      if (ssocket !== null) {
        ssocket.emit("closingScreenShare")
      }
    }
  }, [screenShareStream]);


  useEffect(() => {
    if (ssocket !== null) {
      if (raiseHand) {
        ssocket.emit("handsUp", {roomName: roomName})
      } else {
        ssocket.emit("handsDown", {roomName: roomName})
      }
    }
  }, [raiseHand]);


  useEffect(() => {
    if (ssocket !== null) {
      if (micStatus) {
        ssocket.emit("micOn", {roomName: roomName})
      } else {
        ssocket.emit("micOff", {roomName: roomName})
      }
    }
  }, [micStatus])



  return (
    <html className='html--m' lang='en'>
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Asterisk</title>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet' />
      </head>
      
      <body className='body--m'>
        <div id="video-container" className="video-container">
          {/* Add video elements here */}

          <div className="vid-con1 local-vid-con1">
            <div className="icon-status">
              {micStatus ? (
                <span className="material-icons control-buttons">mic_none</span>
              ) : (
                null
              )}

              {raiseHand ? (
                <span className="material-icons control-buttons">back_hand</span>
              ) : (
                null
              )}
            </div>

            <video 
              ref={localVideoRef}
              muted
              autoPlay 
              playsInline 
              className="video-element">
            </video>

            <audio 
              ref={localAudioRef} 
              muted
              autoPlay 
              playsInline 
              className="audio-element" 
              // volume={audioVolume / 100} 
              // onVolumeChange={(e) => setAudioVolume(e.target.volume * 100)}>
            >
            </audio>
          </div>
        </div>

        <div className="button__control-panel">
          <div className="clock-content">
            <Clock />
          </div>

          <button className="toggle-button" onClick={toggleMic}>
            <div className="button-content">
              {micStatus ? (
                <span className="material-icons control-buttons">mic_none</span>
              ) : (
                <span className="material-icons control-buttons">mic_off</span>
              )} 
            </div>
          </button>

          <button className="toggle-button" onClick={toggleCamera}>
            <div className="button-content">
              {camStatus ? (
                <span className="material-icons control-buttons">videocam</span>
              ) : (
                <span className="material-icons control-buttons">videocam_off</span>
              )} 
            </div>
          </button>
          
          <button className="toggle-button" onClick={toggleScreenShare}>
            <div className="button-content">
              {screenStatus === 'Share Screen' ? (
                <span className="material-icons control-buttons">screen_share</span>
              ) : (
                <span className="material-icons control-buttons">stop_screen_share</span>
              )} 
            </div>
          </button>

          <button className="toggle-button" onClick={toggleRaiseHand} style={raiseHandStyle}>
            <div className="button-content">
              <span className="material-icons control-buttons">back_hand</span>
            </div>
          </button>
          
          <button className="toggle-button" onClick={toggleChat}>
              <div className="button-content">
                <span className="material-icons control-buttons">chat</span>
                {/* <img src={meetIcons.chatIcon} alt="chatIcon" style={imageSize} /> */}
                {/* <span>{isChatOpen ? 'Close Chat' : 'Open Chat'}</span> */}
              </div>
          </button>

          <button className="toggle-button" onClick>
            <div className="button-content">
              <span className="material-icons control-buttons">more_horiz</span>
            </div>
          </button>

          <div className={`chat-sidebar ${isChatOpen ? 'chat-sidebar-open' : ''}`}>
            <ChatApp userName={userName} roomNumber={roomNumber} />
          </div>

          <Link className="text-decoration--none" to="/">
            <button className="toggle-button" onClick={endCall}>
                <div className="button-content">
                  <span className="material-icons control-buttons">phone_disabled</span>
                </div>
            </button>
          </Link>
      </div>
      </body>
    </html>
  );
};

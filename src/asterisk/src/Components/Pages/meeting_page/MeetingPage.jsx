
import React, { useEffect, useState, useRef } from 'react';
import '../../Styles/meet_styles.css';
import * as meetIcons from './imports';
import Clock from './clock';
import { Link } from 'react-router-dom';
import * as mediasoupClient from "mediasoup-client";
import { io } from "socket.io-client";
import { resizeVideoElements } from './videoFunctions';
import ChatApp from '../chat_bar/ChatApp';



export const MeetingPage = ({ userName, audioVolume, setAudioVolume, roomNumber, homeCamStatus, homeMicStatus }) => {

  // console.log("camStatus: ", camStatus);
  // console.log("micStatus: ", micStatus);

  const roomName = window.location.pathname.split('/')[2];

  const [ssocket, setSocket] = useState(null);

  const localVideoRef = useRef(null);
  const localAudioRef = useRef(null);

  const [camStatus, setCamStatus] = useState(homeCamStatus);
  const [micStatus, setMicStatus] = useState(homeMicStatus);

  const [stream, setStream] = useState(null);
  const [ddevice, setDevice] = useState(null);

  const [raiseHandStyle, setRaiseHandStyle] = useState(null);
  const [raiseHand, setRaiseHand] = useState(false);

  const [screenVidParams, setScreenVidParams] = useState(null);
  const [screenAudParams, setScreenAudParams] = useState(null);
  const [screenStatus, setScreenStatus] = useState('Share Screen');
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [pproducerTransport, setProducerTransport] = useState(null);


  
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
    // console.log(micStatus)
    if (micStatus === true) {
      setMicStatus(false);
    } else {
      setMicStatus(true);
    }
  } 


  // Function to toggle the camera stream
  async function toggleCamera() {
    // console.log(camStatus)
    if (camStatus === true) {
      if (localVideoRef.current.srcObject) {
        let localVidStream = localVideoRef.current.srcObject
        let tracks = localVidStream.getTracks();
        tracks.forEach(track => {
          track.stop()
        })
        setCamStatus(false);
      }
    } else {
      setCamStatus(true);
    }
  }


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

        resizeVideoElements(cur_screen_vid_con, 16/9, 300, 200);
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

      setRaiseHandStyle({backgroundColor: "rgb(113, 53, 54)", color: "#d2cccc"});
    } else {
      setRaiseHand(false);

      setRaiseHandStyle(null);
    }
  }

  // Get the user count FOR OTHER PURPOSE
  const fetchUserCount = async () => {
    let url = "https://127.0.0.1:8000/get_users/" + roomName;


    const response = await fetch(url); // CHANGE THE API ENDPOINT FOR USERCOUNT
    const data = await response.json();

    console.log(data.users)
    setUserCount(data.users);
  }

  useEffect(() => {

    const socket = io.connect('https://127.0.0.1:8000/mediasoup')
    setSocket(socket)


    function connectSocket() {
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

        console.log(camStatus)
        console.log(micStatus)

        localStream = await navigator.mediaDevices.getUserMedia({
          video: camStatus, 
          audio: true         // always true -- disable nalang yung track
        });

        setStream(localStream);

        // Attach audio localStream to the audio element
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
          localAudioRef.current.muted = true;
        }

        if (camStatus) {
          // Attach video localStream to the video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.muted = true;
          }

          videoParams = {
            track: localStream.getVideoTracks()[0],
            ...videoParams
          }
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

      // fetchUserCount(); //
    }

    // server informs the client that a new producer (user) just joined

    // 4 TIMES NA NACACALL TOOO 
    // NEED TO CHECK THE BACKEND
    // LATERRRR
    socket.on('newProducer', ({ producerId, producerType, producerSocketId, producerUserName }) => {
      console.log(producerUserName)
      createNewConsumerTransport(producerId, producerType, producerSocketId, producerUserName);
    })

    // ask the server to get the producer's ids
    function getProducers() {
      socket.emit('getProducers', remoteProducers => {
        //  for each producer create consumer
        remoteProducers.forEach(remoteProducer => {
          createNewConsumerTransport(remoteProducer.producerId, remoteProducer.producerType, remoteProducer.producerSocketId, remoteProducer.producerUserName);
        })
      })
    }

    function createSendTransport() {

      //  when we join, we join as a producer
      socket.emit('createWebRtcTransport', { consumer:false, type:"userProducer", userName: userName }, ({ params }) => {
      
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


      setProducerTransport(producerTransport)
      
      audioProducer = await producerTransport.produce(audioParams)

      if (camStatus) {
        videoProducer = await producerTransport.produce(videoParams)

        videoProducer.on('trackended', () => {
          console.log('video track ended')
        }) // close video track

        videoProducer.on('transportclose', () => {
          console.log('video transport ended')
        })
      }


      audioProducer.on('trackended', () => {
        console.log('audio track ended')
        // close audio track
      })

      audioProducer.on('transportclose', () => {
        console.log('audio transport ended')
      })
      
    }

    async function createNewConsumerTransport(remoteProducerId, remoteProducerType, remoteProducerSocketId, RemoteProducerUserName) {

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

        connectRecvTransport(consumerTransport, remoteProducerId, params.id, consumerType, remoteProducerSocketId, RemoteProducerUserName);
      });
    }

    async function connectRecvTransport(consumerTransport, remoteProducerId, serverConsumerTransportId, consumerType, remoteProducerSocketId, RemoteProducerUserName) {
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

        } else {
          vid_con1 = document.getElementById(remoteProducerSocketId)
        }
      
        let vid_con = document.getElementById("video-container");
        let audioElement;
        let videoElement;
        let vidOff;
        
        let videoTag = vid_con1.querySelector('video')
        let spanTag = vid_con1.querySelector("span")

        if (params.kind == 'audio') {
          audioElement = document.createElement('audio');
          audioElement.setAttribute('id', remoteProducerId);
          audioElement.setAttribute('autoPlay', true);
          audioElement.setAttribute('playsInLine', true);
          audioElement.className = "audio-element";

          vid_con1.appendChild(audioElement);

        } else {
          if (videoTag && videoTag.srcObject === null) {
            videoTag.setAttribute('id', remoteProducerId);
            console.log("here")
          } else {
            console.log("hereeee")
            videoElement = document.createElement('video');
            videoElement.setAttribute('id', remoteProducerId);
            videoElement.setAttribute('playsInline', true);
            videoElement.setAttribute('autoPlay', true);
            videoElement.className = "video-element screenShare";
            vid_con1.prepend(videoElement);
          }
          if (spanTag) {
            console.log(spanTag)
            spanTag.style.visibility = "hidden"
          }
        }

        console.log(videoTag)
        console.log(camStatus)

        if (videoTag === null) {
          if (spanTag) {
            spanTag.remove()
          }
          videoElement = document.createElement('video');
          // videoElement.setAttribute('id', remoteProducerId);
          videoElement.setAttribute('playsInline', true);
          videoElement.setAttribute('autoPlay', true);
          videoElement.className = "video-element";
          vid_con1.prepend(videoElement);

          let vidOff = document.createElement("span")
          vidOff.className = "vid-off material-icons control-buttons"
          vidOff.style.visibility = "visible"
          vidOff.innerHTML = "videocam_off"
          vid_con1.prepend(vidOff)
        }


        let vid_con_footer = document.createElement("div")
        let span_username = document.createElement("span")
        let icon_status = document.createElement("div")

        vid_con_footer.className = "vid-con-footer"
        span_username.innerHTML = RemoteProducerUserName
        icon_status.className = "icon-status"

        let mic_span_icon = document.createElement("span")
        mic_span_icon.className = "material-icons control-buttons"

        if (micStatus) {
          mic_span_icon.innerHTML = "mic_none"
        } else {
          mic_span_icon.innerHTML = "mic_off"
        }

        icon_status.appendChild(mic_span_icon)

        let hand_span_icon = document.createElement("span")
        hand_span_icon.className = "material-icons control-buttons"
        hand_span_icon.innerHTML = "back_hand"

        if (raiseHand) {
          hand_span_icon.style.visibility = "visible"
        } else {
          hand_span_icon.style.visibility = "hidden"
        }

        icon_status.appendChild(hand_span_icon)

        vid_con_footer.appendChild(span_username)
        vid_con_footer.appendChild(icon_status)

        if(vid_con1.getElementsByClassName("vid-con-footer").length < 1) {
          vid_con1.appendChild(vid_con_footer)
        }

        vid_con.appendChild(vid_con1)
        
        const { track } = consumer;
        const remoteElem = document.getElementById(remoteProducerId);

        remoteElem.srcObject = new MediaStream([ track ]);

        const remoteCurrentVid = {current: videoElement}
        const remoteCurrentAud = {current: audioElement}


        resizeVideoElements(remoteCurrentVid, 16/9, 300, 200)
        resizeVideoElements(remoteCurrentAud)

        fetchUserCount(); //

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

      console.log(remoteProducerId)
      // remove the video element
      let vid_con = document.getElementById("video-container");
      let vid_con1 = document.getElementById(remoteProducerSocketId);
      let elementToRemove = document.getElementById(remoteProducerId)
      console.log(elementToRemove)

      if (elementToRemove !== null) {
        if (elementToRemove.tagName === "AUDIO") {
        //   // vid_con1.removeChild(elementToRemove)
          fetchUserCount()
          vid_con.removeChild(vid_con1)
          return
        } else if (elementToRemove.className.includes('screenShare')) {
          elementToRemove.remove()
          return
        } else {
          elementToRemove.srcObject = null
          vid_con1.querySelector("span").style.visibility = "visible"
        }
      }
    })



    // Call the resize function when the window is resized
    window.addEventListener('resize', resizeVideoElements);

    // Call the resize function on initial render
    resizeVideoElements(localVideoRef, 16/9, 300, 200)
    resizeVideoElements(localAudioRef)

    connectSocket();

    function set_icon_mic(userSocketId, micIcon) {
      if (document.getElementById(userSocketId)) {
        document.getElementById(userSocketId)
          .querySelectorAll('span')
          .forEach(element => {
            if (element.innerHTML === "mic_none" || element.innerHTML === "mic_off") {
              element.innerHTML = micIcon
            }
          }
        )
      }
    }

    function set_icon(userSocketId, icon, status) {
      if (document.getElementById(userSocketId)) {
        document.getElementById(userSocketId)
          .querySelectorAll('span')
          .forEach(element => {
            if (element.innerHTML === icon) {
              // element.remove()
              if (status) {
                element.style.visibility = "visible"
              } else {
                element.style.visibility = "hidden"
              }
            }
          }
        )
      }
    }

    socket.on("userRaisedHand", (data) => {
      console.log(data.userSocketId, "HANDS ON")
      set_icon(data.userSocketId, "back_hand", true)
    })

    socket.on("userLowerHand", (data) => {
      console.log(data.userSocketId, "HANDS OFF")
      set_icon(data.userSocketId, "back_hand", false)
    })

    socket.on("userMicOn", (data) => {
      console.log(data.userSocketId, "MIC ON")
      set_icon_mic(data.userSocketId, "mic_none")
    })

    socket.on("userMicOff", (data) => {
      console.log(data.userSocketId, "MIC OFFFF")
      set_icon_mic(data.userSocketId, "mic_off")
    })



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
    if (stream) {
      const audioTrack = stream.getTracks().find(track => track.kind === 'audio')
      if (micStatus) {
        audioTrack.enabled = true;
        ssocket.emit("micOn", {roomName: roomName})
      } else {
        audioTrack.enabled = false;
        ssocket.emit("micOff", {roomName: roomName})
      }
    }
  }, [micStatus, stream])

  useEffect(() => {
    if (stream && ddevice !== null) {

      let localVidELem = document.getElementById(ssocket.id).querySelector("video")

      // console.log(localVidELem.srcObject)

      if (camStatus && localVidELem.srcObject === null) {
        // create new vid producer transport
        async function getLocalCam() {
          let localCam = await navigator.mediaDevices.getUserMedia({
            video: camStatus
          });

          // Attach video localStream to the video element
          if (localVideoRef.current) {

            localVideoRef.current.srcObject = localCam;
            localVideoRef.current.muted = true;
          }

          videoParams = {
            track: localCam.getVideoTracks()[0],
            ...videoParams
          }

          connectSendTransport()
        }

        async function connectSendTransport() {
          videoProducer = await pproducerTransport.produce(videoParams)
          

          videoProducer.on('trackended', () => {
            console.log('video track ended')
          }) // close video track

          videoProducer.on('transportclose', () => {
            console.log('video transport ended')
          })          
        }

        getLocalCam()

      } else {
        // remove vid producer transport

        if (ssocket !== null) {
          console.log("CAM OFFFFF")
          ssocket.emit("camOff", { producerTransport: pproducerTransport })

          localVidELem.srcObject = null
        }
      }
    }
  }, [stream, camStatus])


  return (
    <html className='html--m' lang='en'>
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Asterisk</title>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet' />
      </head>
      
      <body id="m-body" className='body--m'>
        <div id="video-container" className="video-container">
          {/* Add video elements here */}

          <div className="vid-con1 local-vid-con1">
            {camStatus ? (
              <span style={{visibility: "hidden"}} className="vid-off material-icons control-buttons">videocam_off</span>
            ) : (
              <span style={{visibility: "visible"}} className="vid-off material-icons control-buttons">videocam_off</span>
            )}
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

            <div className="vid-con-footer">
              <span className='userName-meet'>{userName}</span>
              <div className="icon-status">
                {micStatus ? (
                  <span className="material-icons control-buttons">mic_none</span>
                ) : (
                  <span className="material-icons control-buttons">mic_off</span>
                )}

                {raiseHand ? (
                  <span style={{visibility: "visible"}} className="material-icons control-buttons">back_hand</span>
                ) : (
                  <span style={{visibility: "hidden"}} className="material-icons control-buttons">back_hand</span>
                )}
              </div>
            </div>


          </div>
        </div>

        <div className="button__control-panel">
          <div className="clock-content">
            <div className="num-con">
              <span className="icon-group material-icons">groups</span>
              <p className="num-user">{userCount}</p>
            </div>
            <Clock />
            <span className="roomName">{roomName}</span>
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
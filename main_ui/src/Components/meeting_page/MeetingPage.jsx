import React, { useEffect, useState, useRef } from 'react';
import './styles.css';


export const MeetingPage = () => {

  const userID = window.crypto.randomUUID();

  // create channel link "?room=asdfafafgbn"
  const ws = new WebSocket(`ws://localhost:8000/ws/${userID}`)



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

  let localStream;
  let remoteStream;
  let pc;


  useEffect(() => {

    function resizeVideoElements() {
      if (localVideoRef.current && localAudioRef.current) {
        const videoContainerWidth = localVideoRef.current.offsetWidth;
        const videoContainerHeight = localVideoRef.current.offsetHeight;
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
        localVideoRef.current.style.width = `${videoWidth}px`;
        localVideoRef.current.style.height = `${videoHeight}px`;
        localAudioRef.current.style.width = `${videoWidth}px`;
        localAudioRef.current.style.height = `${videoHeight}px`;
      }
    }

    // Call the resize function when the window is resized
    window.addEventListener('resize', resizeVideoElements);

    // Call the resize function on initial render
    resizeVideoElements();


    async function startStream() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        // Attach video localStream to the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Attach audio localStream to the audio element
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
        }

        ws.onopen = function(event) {
          console.log("Connection is open");
          console.log(userID, "has arrived!");

          ws.send(JSON.stringify({"userID":userID}));
        }

        ws.onclose = function(event) {
          console.log("Connection is closed");
        }

        ws.onmessage = function(event) {

          let obj = JSON.parse(event.data);

          if (obj.type) {
            if (obj.type === "offer") {
              console.log("received offer!");
              createAnswer(userID, obj.offer);
            } else if (obj.type === "answer") {
              console.log("received answer!");
              addAnswer(obj.answer);
            } else if (obj.type === "candidate") {
              console.log("received candidate!");
              if (pc) {
                pc.addIceCandidate(obj.candidate)
              }
            }
          } else {
            // another user has joined!!!
            createOffer(userID);
            console.log(obj.userID, "has arrived!");
          }
        }

      } catch (error) {
        console.error('Error accessing media devices: ', error);
      }
    }

    async function createPeerConnection(userID) {
      pc = new RTCPeerConnection(servers);

      remoteStream = new MediaStream();
      remoteVideoRef.current.srcObject = remoteStream;
      remoteAudioRef.current.srcObject = remoteStream;


      if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        // Attach video localStream to the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Attach audio localStream to the audio element
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
        }
      }

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track)
        })
      }

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          // console.log(event.candidate);
          ws.send(JSON.stringify({
            "type":"candidate", 
            "candidate":event.candidate
          }))
        }
      }
    }


    async function createOffer(userID) {

      await createPeerConnection(userID);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);


      // send the offer to peer (offer, userID)
      ws.send(JSON.stringify({
        "type":"offer", 
        "offer":offer,
        "userID": userID
      }))
    }

    async function createAnswer(userID, offer) {
      await createPeerConnection(userID);

      await pc.setRemoteDescription(offer);

      let answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // send back the answer to other peer (answer, userID)
      ws.send(JSON.stringify({
        "type":"answer",
        "answer":answer,
        "userID":userID
      }))
    }

    async function addAnswer(answer) {
      if (!pc.currentRemoteDescription) {
        pc.setRemoteDescription(answer)
      }
    }

    startStream();

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', resizeVideoElements);
    };

  }, []);

  return (
    <div className="container">
      <header className="meeting-header">
        <h1>Asterisk - Video Meeting App</h1>
        <div className="video-container">
          {/* Add video elements here */}
          <video ref={localVideoRef} autoPlay playsInline className="video-element"></video>
          <audio ref={localAudioRef} autoPlay playsInline className="audio-element"></audio>

          <video ref={remoteVideoRef} autoPlay playsInline className="video-element"></video>
          <audio ref={remoteAudioRef} autoPlay playsInline className="audio-element"></audio>
        </div>
      </header>
    </div>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import './styles.css';

export const MeetingPage = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Function to start the video and audio streams
    async function startStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Attach video stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Attach audio stream to the audio element
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }

        // Create an offer and send it to the backend
        const pc = new RTCPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send the offer to the backend
        const response = await fetch('http://localhost:8000/offer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sdp: pc.localDescription.sdp,
            type: pc.localDescription.type,
          }),
        });

        const data = await response.json();
        // Set the remote description of the peer connection with the received answer
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      } catch (error) {
        console.error('Error accessing media devices: ', error);
      }
    }

    startStream();
  }, []);

  return (
    <div className="container">
      <header className="meeting-header">
        <h1>Asterisk - Video Meeting App</h1>
        <div className="video-container">
          {/* Add video elements here */}
          <video ref={videoRef} autoPlay playsInline className="video-element"></video>
          <audio ref={audioRef} autoPlay playsInline className="audio-element"></audio>
        </div>
      </header>
    </div>
  );
};

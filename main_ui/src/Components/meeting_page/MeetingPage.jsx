import React, { useEffect, useState, useRef } from 'react'
import './styles.css';

export const MeetingPage = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Function to start the video and audio streams
    async function startStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        // Attact video stream to the video element
        if (videoRef.current) {
          video.current.srcObject = stream;
        }

        // Attach audio stream to the audio element
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices: ", error);
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
            <video ref = {videoRef} autoPlay playsInline className = "video-element"></video>
            <audio ref = {audioRef} autoPlay playsInline className = "audio-element"></audio>
          </div>
        </header>
    </div>
    )
}

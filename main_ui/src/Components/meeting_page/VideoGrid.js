import React, { useState, useEffect } from 'react';

const VideoGrid = ({ positions }) => {
  const [videoStreams, setVideoStreams] = useState([]);

  useEffect(() => {
    // Add all video streams to the state variable
    positions.forEach((position) => {
      const videoStream = new RTCPeerConnection();
      setVideoStreams((prevState) => [...prevState, videoStream]);
    });
  }, [positions]);

  return (
    <div>
      {videoStreams.map((videoStream, index) => (
        <video key={index} srcObject={videoStream} style={positions[index]} />
      ))}
    </div>
  );
};

export default VideoGrid;

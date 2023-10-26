/*
    FOR IF BACKEND IS DONE WITH THEiR CODE!
*/
import React, { useEffect, useRef } from 'react';

function App() {
  const videoRef = useRef();

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws');

    socket.onmessage = (event) => {
      const blob = new Blob([event.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      videoRef.current.src = imageUrl;
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Video Meeting App</h1>
        <div className="video-container">
          <video ref={videoRef} autoPlay></video>
        </div>
      </header>
    </div>
  );
}

export default App;

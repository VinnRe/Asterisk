import React, { useEffect, useState } from 'react'
import VideoGrid from './VideoGrid';

export const meeting_page = () => {
  const [positions, setPositions] = useState('');

  useEffect(() => {
    // Update the positions of all video streams when the state variable changes
    positions.forEach((positions, index) => {
      // Update the position of the video stream at the given index
    });
  }, [positions]);
  
    return (
      <div className="container">
        <div className="meeting-header">
          <h1>Meeting</h1>
          <button>Leave Meeting</button>
        </div>
        <div className="meeting-body">
          <VideoGrid positions={positions} />
        </div>
        <div className="meeting-footer">
          <input type="text" placeholder='Chat...' />
          <button>Send</button>
        </div>
      </div>
    )
}

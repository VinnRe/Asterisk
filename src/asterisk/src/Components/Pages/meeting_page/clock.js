import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <span className='clock'>
            {currentTime.toLocaleTimeString({ hour: '2-digit', minute: '2-digit' })}
        </span>
    );
};

export default Clock;
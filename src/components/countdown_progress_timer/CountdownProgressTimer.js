'use client';
import React, { useState, useEffect } from 'react';
import './countdown_progress_timer.css';

const CountdownProgressTimer = ({ minutes = 15 }) => {
  const totalSeconds = minutes * 60; // 15 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds, includeSeconds = false) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return includeSeconds
      ? `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      : `~${minutes.toString()} mins remaining`;
  };

  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="countdown-timer">
      <div className="countdown-progress">
        <div className="countdown-progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <p>{formatTime(timeLeft)}</p>
    </div>
  );
};

export default CountdownProgressTimer;

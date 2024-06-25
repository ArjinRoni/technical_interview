'use client';
import React from 'react';
import './progress.css';

const Progress = ({ step, maxSteps }) => {
  if (!step) return null;

  const progressPercentage = (step / maxSteps) * 100;

  return (
    <div className="progress">
      <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      <p>
        {step}/{maxSteps}
      </p>
    </div>
  );
};

export default Progress;

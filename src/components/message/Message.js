import React from 'react';
import './message.css';

const Message = ({ isAI = false, message }) => {
  return (
    <div className="message" style={{ backgroundColor: isAI ? 'black' : 'white' }}>
      {isAI && <img style={{ width: 24, height: 24 }} src="./logo.png" />}
      <p>{message}</p>
    </div>
  );
};

export default Message;

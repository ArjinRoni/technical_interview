'use client';
import React, { useRef, useEffect } from 'react';
import './user_input.css';

import { useFont } from '@/contexts/FontContext';

const UserInput = ({ userMessage, setUserMessage, onSubmit }) => {
  const { secondaryFont } = useFont();

  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current.style.height = '0px';
    const scrollHeight = textareaRef.current.scrollHeight;
    textareaRef.current.style.height = scrollHeight + 'px';
  }, [userMessage]);

  return (
    <form className="user-input-form" onSubmit={onSubmit}>
      <textarea
        ref={textareaRef}
        style={{ fontFamily: secondaryFont.style.fontFamily }}
        className="user-input"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
      />
      <img className="send-image" src="/send.png" onClick={onSubmit} />
    </form>
  );
};

export default UserInput;

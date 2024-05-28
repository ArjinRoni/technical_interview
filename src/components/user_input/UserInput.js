'use client';
import React, { useRef, useEffect } from 'react';
import './user_input.css';

import { useFont } from '@/contexts/FontContext';

const UserInput = ({ userMessage, setUserMessage, onSubmit, hide = false }) => {
  const { secondaryFont } = useFont();

  const textareaRef = useRef(null);

  // Hook to dynamically adjust the height of the text area
  useEffect(() => {
    textareaRef.current.style.height = '0px';
    const scrollHeight = textareaRef.current.scrollHeight;
    textareaRef.current.style.height = scrollHeight + 'px';
  }, [userMessage]);

  // Function to submit the form when enter is pressed
  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <>
      <form
        className="user-input-form"
        onSubmit={onSubmit}
        style={{ display: hide ? 'none' : 'flex' }}
      >
        <textarea
          ref={textareaRef}
          placeholder="Reply to Madison..."
          style={{ fontFamily: secondaryFont.style.fontFamily }}
          className="user-input"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => onEnterPress(e)}
        />
        {userMessage && userMessage.length > 0 && (
          <img className="send-image" src="/send-gradient.png" onClick={onSubmit} />
        )}
      </form>
      <div className="black-bg-mask" />
    </>
  );
};

export default UserInput;

'use client';
import React, { useRef, useEffect } from 'react';
import './user_input.css';

import Spinner from '../spinner/Spinner';

import { useFont } from '@/contexts/FontContext';

// Component for suggestions
const Suggestion = ({ suggestion, setUserMessage }) => {
  const buttonRef = useRef(null);

  const handleClick = () => {
    setUserMessage((prev) => (prev && prev.length > 0 ? prev + ', ' + suggestion : suggestion));

    // Trigger the bouncy animation
    buttonRef.current.style.transform = 'scale(0.8)';
    setTimeout(() => {
      buttonRef.current.style.transform = 'scale(1)';
    }, 100);
  };
  return (
    <div ref={buttonRef} className="user-input-suggestion" onClick={handleClick}>
      <p>{suggestion}</p>
    </div>
  );
};

const UserInput = ({
  userMessage,
  setUserMessage,
  onSubmit,
  isLoading = true,
  hide = false,
  suggestions = null,
  suggestionsLabel = null,
  height = 60,
}) => {
  const { secondaryFont } = useFont();
  const textareaRef = useRef(null);

  // Flag to keep track if there are suggestions
  const hasSuggestions = suggestions && suggestions.length > 0;

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
      onSubmitWithCheck();
    }
  };

  const onSubmitWithCheck = () => {
    if (isLoading) return;
    onSubmit();
  };

  return (
    <>
      <form
        className="user-input-form"
        onSubmit={onSubmitWithCheck}
        style={{ display: hide ? 'none' : 'flex' }}
      >
        {hasSuggestions && (
          <div className="user-input-suggestions-div">
            {suggestionsLabel && (
              <div className="user-input-suggestions-label">
                <p>{suggestionsLabel}</p>
              </div>
            )}
            {suggestions.map((x, index) => (
              <Suggestion key={index} suggestion={x} setUserMessage={setUserMessage} />
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          placeholder="Reply to Madison..."
          style={{ fontFamily: secondaryFont.style.fontFamily, height }}
          className="user-input"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => onEnterPress(e)}
        />
        {userMessage &&
          userMessage.length > 0 &&
          (isLoading ? (
            <Spinner isGray marginTop={-12} extraStyle={{ position: 'absolute', right: 16 }} />
          ) : (
            <img className="send-image" src="/send-gradient.png" onClick={onSubmitWithCheck} />
          ))}
      </form>
      {!hide && <div className="black-bg-mask" style={{ height: hasSuggestions ? 138 : 92 }} />}
    </>
  );
};

export default UserInput;

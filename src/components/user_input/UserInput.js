'use client';
import React, { useRef, useEffect } from 'react';
import './user_input.css';

import Spinner from '../spinner/Spinner';

import { useFont } from '@/contexts/FontContext';

const UserInput = ({
  userMessage,
  setUserMessage,
  onSubmit,
  isLoading = true,
  hide = false,
  suggestions = null,
  suggestionsLabel = null,
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

  // Component for suggestions
  const Suggestion = ({ suggestion }) => {
    return (
      <div
        className="user-input-suggestion"
        onClick={() => setUserMessage((prevMessage) => prevMessage + ` ${suggestion}`)}
      >
        <p>{suggestion}</p>
      </div>
    );
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
              <Suggestion key={index} suggestion={x} />
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          placeholder="Reply to Madison..."
          style={{ fontFamily: secondaryFont.style.fontFamily }}
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
      <div className="black-bg-mask" style={{ height: hasSuggestions ? 138 : 92 }} />
    </>
  );
};

export default UserInput;

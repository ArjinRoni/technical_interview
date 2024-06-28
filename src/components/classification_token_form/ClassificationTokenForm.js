'use client';
import React, { useRef } from 'react';
import './classification_token_form.css';

import FormInput from '../form_input/FormInput';

// Component for suggestions
const Suggestion = ({ suggestion, onClick = () => {} }) => {
  const buttonRef = useRef(null);

  const handleClick = () => {
    onClick(suggestion);

    // Trigger the bouncy animation
    buttonRef.current.style.transform = 'scale(0.8)';
    setTimeout(() => {
      buttonRef.current.style.transform = 'scale(1)';
    }, 100);
  };

  return (
    <div ref={buttonRef} className="form-input-suggestion" onClick={handleClick}>
      <p>{suggestion}</p>
    </div>
  );
};

const ClassificationTokenForm = ({
  suggestions,
  userMessage,
  setUserMessage = () => {},
  onSubmit = () => {},
}) => {
  const hasSuggestions = suggestions && suggestions.length > 0;

  // Function to submit the form when enter is pressed
  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div>
      <p className="form-text-label">Classification token</p>
      <FormInput
        width={400}
        placeholder="Type or select your classification token..."
        value={userMessage}
        setValue={setUserMessage}
        onKeyDown={(e) => onEnterPress(e)}
      />
      {hasSuggestions && (
        <div className="form-input-suggestions-div">
          {suggestions?.map((suggestion, index) => (
            <Suggestion
              key={index}
              suggestion={suggestion}
              onClick={(value) => setUserMessage(value)}
            />
          ))}
        </div>
      )}
      <p className="form-continue-button" onClick={onSubmit}>
        Press here or ↵ Enter to continue
      </p>
    </div>
  );
};

export default ClassificationTokenForm;

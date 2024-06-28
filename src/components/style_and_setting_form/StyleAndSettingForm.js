'use client';
import React, { useEffect, useState, useRef } from 'react';
import './style_and_setting_form.css';

import FormInput from '../form_input/FormInput';

// Component for suggestions
const Suggestion = ({ suggestion, setValue = () => {} }) => {
  const buttonRef = useRef(null);

  const handleClick = () => {
    setValue((prev) => (prev && prev.length > 0 ? prev + ', ' + suggestion : suggestion));

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

const StyleAndSettingForm = ({ suggestions, setUserMessage = () => {}, onSubmit = () => {} }) => {
  const [style, setStyle] = useState('');
  const [setting, setSetting] = useState('');
  const hasSuggestions = suggestions && suggestions.length > 0;

  // Function to submit the form when enter is pressed
  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Hook to update user message when when style or setting updates
  useEffect(() => {
    if (style && style.length > 0 && setting && setting.length > 0) {
      setUserMessage(`**Style:** ${style}\n\n**Setting:** ${setting}`);
    }
  }, [style, setting]);

  return (
    <div>
      <p className="form-text-label">Style</p>
      <FormInput
        width={600}
        placeholder="Type or select your style..."
        value={style}
        setValue={setStyle}
        // onKeyDown={(e) => onEnterPress(e)} // TODO: Pressing enter here should go to setting form input below... Ideally, there should be an Enter button too
      />
      {hasSuggestions && (
        <div className="form-input-suggestions-div" style={{ width: 600 }}>
          {suggestions?.slice(0, 3).map((suggestion, index) => (
            <Suggestion key={index} suggestion={suggestion} setValue={setStyle} />
          ))}
        </div>
      )}
      <div style={{ height: 24 }} />
      <p className="form-text-label">Setting</p>
      <FormInput
        width={600}
        placeholder="Type or select your setting..."
        value={setting}
        setValue={setSetting}
        onKeyDown={(e) => onEnterPress(e)}
      />
      {hasSuggestions && (
        <div className="form-input-suggestions-div" style={{ width: 600 }}>
          {suggestions?.slice(3).map((suggestion, index) => (
            <Suggestion key={index} suggestion={suggestion} setValue={setSetting} />
          ))}
        </div>
      )}
      <p className="form-continue-button" onClick={onSubmit}>
        Press here or ↵ Enter to continue
      </p>
    </div>
  );
};

export default StyleAndSettingForm;

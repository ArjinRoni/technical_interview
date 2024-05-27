'use client';
import React, { useRef, useEffect } from 'react';
import './multiline_input.css';

import { useFont } from '@/contexts/FontContext';

const MultilineInput = ({ placeholder = 'Type your feedback here...', value, setValue }) => {
  const { secondaryFont } = useFont();

  const textareaRef = useRef(null);

  // Hook to dynamically adjust the height of the text area
  useEffect(() => {
    textareaRef.current.style.height = '0px';
    const scrollHeight = textareaRef.current.scrollHeight;
    textareaRef.current.style.height = scrollHeight + 'px';
  }, [value]);

  // Function to submit the form when enter is pressed
  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      placeholder={placeholder}
      style={{ fontFamily: secondaryFont.style.fontFamily }}
      className="multiline-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => onEnterPress(e)}
    />
  );
};

export default MultilineInput;

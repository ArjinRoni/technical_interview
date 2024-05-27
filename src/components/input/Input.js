'use client';
import React, { useState } from 'react';
import './input.css';

const Input = ({ type, placeholder, pattern, autocomplete, value, setValue }) => {
  const [isVisible, setIsVisible] = useState(type !== 'password');
  const [inputType, setInputType] = useState(type);

  return (
    <div className="input-container">
      <input
        className="input"
        type={inputType}
        placeholder={placeholder}
        pattern={pattern}
        autoComplete={autocomplete}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {type === 'password' && (
        <img
          className="input-visibility-toggler"
          src={isVisible ? '/eye-off.png' : '/eye.png'}
          onClick={() => {
            const newValue = !isVisible;
            setIsVisible(newValue);
            if (newValue) {
              setInputType('text');
            } else {
              setInputType('password');
            }
          }}
        />
      )}
    </div>
  );
};

export default Input;

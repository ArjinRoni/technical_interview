import React from 'react';
import './input.css';

const Input = ({ type, placeholder, pattern, autocomplete, value, setValue }) => {
  return (
    <input
      className="input"
      type={type}
      placeholder={placeholder}
      pattern={pattern}
      autoComplete={autocomplete}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default Input;

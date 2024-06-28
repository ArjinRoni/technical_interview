'use client';
import React from 'react';
import './form_input.css';

const FormInput = ({ width = 400, placeholder, value, setValue, onKeyDown }) => {
  return (
    <div className="form-input-container">
      <input
        className="form-input"
        style={{ width: `${width}px` }}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default FormInput;

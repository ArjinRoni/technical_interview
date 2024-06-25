'use client';
import React, { useRef, useState } from 'react';
import './checkbox.css';

const Checkbox = ({ isSelectedInit = false, onPress = () => {} }) => {
  const [isSelected, setIsSelected] = useState(isSelectedInit);
  const checkboxRef = useRef(null);

  const handleClick = () => {
    setIsSelected(!isSelected);
    onPress();

    // Trigger the bouncy animation
    checkboxRef.current.style.transform = 'scale(0.8)';
    setTimeout(() => {
      checkboxRef.current.style.transform = 'scale(1)';
    }, 100);
  };

  return (
    <div
      ref={checkboxRef}
      className={`checkbox ${isSelected ? 'checkbox-selected' : ''}`}
      onClick={handleClick}
    >
      {isSelected && <img style={{ height: 32, width: 32 }} src="/check.png" />}
    </div>
  );
};

export default Checkbox;

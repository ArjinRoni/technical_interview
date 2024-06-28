'use client';
import React, { useRef } from 'react';
import './button.css';

const Button = ({
  text = 'Next',
  type = 'button',
  borderRadius = 300,
  width = '100%',
  fontSize = 18,
  marginTop = 24,
  alignSelf = undefined,
  emoji = null,
  onClick = null,
}) => {
  const ref = useRef(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    // Trigger the bouncy animation
    if (ref?.current) {
      ref.current.style.transform = 'scale(0.9)';
    }
    setTimeout(() => {
      if (ref?.current) {
        ref.current.style.transform = 'scale(1)';
      }
    }, 150);
  };

  return (
    <button
      ref={ref}
      style={{ alignSelf, borderRadius, width, marginTop }}
      className="button"
      type={type}
      onClick={handleClick}
    >
      <p style={{ fontSize, color: 'white', alignSelf: 'center', margin: 0 }}>{text}</p>
      {emoji && (
        <img
          style={{ marginLeft: 12 }}
          width={30}
          height={30}
          src={emoji === 'rocket' ? '/rocket.png' : emoji === 'plus' ? '/plus.png' : null}
        />
      )}
    </button>
  );
};

export default Button;

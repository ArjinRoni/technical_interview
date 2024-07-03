'use client';
import React, { useState } from 'react';
import NextImage from 'next/image';

import './image.css';

const Image = (props) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  const toggleEnlarge = () => {
    setIsEnlarged(!isEnlarged);
  };

  // Create props for the enlarged image
  const enlargedImageProps = { ...props };
  if (isEnlarged) {
    delete enlargedImageProps.width;
    delete enlargedImageProps.height;
    enlargedImageProps.fill = true;
    enlargedImageProps.sizes = '100vw';

    // Remove width and height from style object if it exists
    if (enlargedImageProps.style) {
      const { width, height, ...restStyle } = enlargedImageProps.style;
      enlargedImageProps.style = {
        ...restStyle,
        objectFit: 'contain',
      };
    } else {
      enlargedImageProps.style = { objectFit: 'contain' };
    }
  }

  return (
    <div className="image-container">
      <NextImage
        {...props}
        onClick={toggleEnlarge}
        className={`zoomable-image ${props.className || ''}`}
      />
      {isEnlarged && (
        <div className="enlarged-image-overlay" onClick={toggleEnlarge}>
          <div className="enlarged-image-container">
            <NextImage {...enlargedImageProps} className="enlarged-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Image;

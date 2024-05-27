import React, { useEffect, useRef } from 'react';
import './glow.css';

import { useUI } from '@/contexts/UIContext';

const Glow = () => {
  const { isSidebarOpen } = useUI();
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;

    const setRandomGlowPosition = () => {
      const randomX = isSidebarOpen
        ? Math.max(600, Math.random() * window.innerWidth)
        : Math.random() * window.innerWidth;
      const randomY = Math.random() * (window.innerHeight / 2);

      glow.style.left = `${randomX}px`;
      glow.style.top = `${randomY}px`;
      glow.style.display = 'flex';
    };

    setRandomGlowPosition();
  }, []);

  return <div ref={glowRef} className="glow center" />;
};

export default Glow;

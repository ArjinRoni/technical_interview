import React, { useEffect, useRef } from 'react';
import './glow.css';

import { useUI } from '@/contexts/UIContext';

const Glow = () => {
  const { isSidebarOpen } = useUI();
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;

    const setRandomGlow = () => {
      const randomX = isSidebarOpen
        ? Math.max(600, Math.random() * window.innerWidth)
        : Math.random() * window.innerWidth;
      const randomY = Math.random() * (window.innerHeight / 2);
      const randomScale = Math.random() * 0.5 + 0.5; // Random scale between 0.5 and 1.0

      glow.style.left = `${randomX}px`;
      glow.style.top = `${randomY}px`;
      glow.style.setProperty('--before-width', `${480 * randomScale}px`);
      glow.style.setProperty('--before-height', `${360 * randomScale}px`);
      glow.style.setProperty('--after-width', `${240 * randomScale}px`);
      glow.style.setProperty('--after-height', `${180 * randomScale}px`);
      glow.style.display = 'flex';
    };

    setRandomGlow();
  }, []);

  return <div ref={glowRef} className="glow center" />;
};

export default Glow;

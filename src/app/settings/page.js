'use client';
import React from 'react';
import '../../styles/settings.css';

import { Sidebar, Glow } from '@/components';

import { useUI } from '@/contexts/UIContext';
import { useFont } from '@/contexts/FontContext';

const Settings = () => {
  const { isSidebarOpen } = useUI();
  const { primaryFont } = useFont();

  return (
    <div className="settings-page">
      <Sidebar />
      <Glow />
      <div className="settings-panel" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        <h1 style={{ fontFamily: primaryFont.style.fontFamily }}>Settings</h1>
        <p style={{ marginTop: 24, alignSelf: 'flex-start', padding: 4 }}>Coming soon...</p>
      </div>
    </div>
  );
};

export default Settings;

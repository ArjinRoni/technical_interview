import React from 'react';
import './message.css';

import { getInitials } from '@/utils/StringUtils';

import { useAuth } from '@/contexts/AuthContext';
import { useFont } from '@/contexts/FontContext';

const Message = ({ isAI = false, text }) => {
  const { user } = useAuth();
  const { primaryFont } = useFont();

  const initials = getInitials(user?.name);

  return (
    <div
      className="message-container"
      style={{
        alignSelf: isAI ? 'flex-start' : 'flex-end',
        marginLeft: isAI ? 0 : 64,
        marginRight: isAI ? 64 : 0,
      }}
    >
      {isAI ? (
        <img style={{ width: 36, height: 36, borderRadius: 300 }} src="/logo.png" />
      ) : (
        <div className="initials-box">
          <p className="initials-text" style={{ fontFamily: primaryFont.style.fontFamily }}>
            {initials}
          </p>
        </div>
      )}
      <div
        className="message"
        style={{
          backgroundColor: isAI ? '#3C3C3C' : '#272727',
        }}
      >
        <p className="message-text" style={{ color: isAI ? 'white' : 'white' }}>
          {text}
        </p>
      </div>
    </div>
  );
};

export default Message;

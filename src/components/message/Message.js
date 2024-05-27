'use client';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import './message.css';

import { getInitials } from '@/utils/StringUtils';

import { useAuth } from '@/contexts/AuthContext';
import { useFont } from '@/contexts/FontContext';
import { useChats } from '@/contexts/ChatsContext';
import Spinner from '../spinner/Spinner';

const Message = ({ message, chatId }) => {
  const { user } = useAuth();
  const { primaryFont } = useFont();
  const { updateMessageRating } = useChats();

  // Parse props of the message object
  const { id, text, role, rating, isLoading = false } = message;
  const isAI = role === 'assistant';

  // State to manage the rating locally
  const [localRating, setLocalRating] = useState(rating);

  // Get initials of the user
  const initials = getInitials(user?.name);

  // Function to copy the text to clipboard
  const copyToClipboard = () => {
    toast.success('Copied to clipboard.');
    navigator.clipboard.writeText(text);
  };

  // Function to update the rating in the database
  const updateRating = async (newRating) => {
    try {
      await updateMessageRating({ chatId, messageId: id, rating: newRating });
      setLocalRating(newRating);
    } catch (error) {
      console.log('Got error updating message rating: ', error);
    }
  };

  return (
    <div
      className="message-container"
      style={{
        alignSelf: isAI ? 'flex-start' : 'flex-end',
        marginLeft: isAI ? 0 : 64,
        marginRight: isAI ? 64 : 0,
        marginBottom: isAI ? 24 : 4,
      }}
    >
      {isAI ? (
        <img
          style={{ width: 36, height: 36, borderRadius: 300, backgroundColor: 'white', padding: 6 }}
          src="/logo.png"
        />
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
        {isLoading ? (
          <Spinner marginTop={0} isGray={true} />
        ) : (
          <p className="message-text" style={{ color: isAI ? 'white' : 'white' }}>
            {text}
          </p>
        )}
      </div>
      {isAI && !isLoading && (
        <div className="message-actions-box">
          <img src="/clipboard.png" onClick={() => copyToClipboard()} />
          <img
            src={localRating === 1 ? '/thumbs-up-filled.png' : '/thumbs-up.png'}
            onClick={() => updateRating(localRating === 1 ? 0 : 1)}
          />
          <img
            style={{ marginTop: 1.5 }}
            src={localRating === -1 ? '/thumbs-down-filled.png' : '/thumbs-down.png'}
            onClick={() => updateRating(localRating === -1 ? 0 : -1)}
          />
        </div>
      )}
    </div>
  );
};

export default Message;

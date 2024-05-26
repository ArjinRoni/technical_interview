'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

import { useFB } from './FBContext';
import { useAuth } from './AuthContext';

export const ChatsContext = createContext({ chats: [] });

export const useChats = () => useContext(ChatsContext);

export const ChatsProvider = ({ children }) => {
  const { db } = useFB();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);

  // Function to get and set chats
  const getAndSetChats = async (userId) => {
    try {
      const chats_ = await getDocs(collection(db, 'chats', userId));
      setChats(chats_.map((x) => x?.data()));
    } catch (error) {
      console.log('Got error fetching chats: ', chats);
    }
  };

  // Function to create a chat
  const createChat = async (message) => {
    if (user && user.userId) {
      try {
        // Get user ID
        const userId = user.userId;

        // Set chat ID as the next integer
        const chatId = `chat${chats.length + 1}`;

        // Set message ID as first (1)
        const messageId = 'message1';

        // Add a new user document in DB
        await setDoc(doc(db, 'chats', userId, chatId, messageId), { text: message });
      } catch (error) {
        console.log('Got error creating chat: ', error);
      }
    } else {
      console.log('Cannot create a chat without user credentials');
    }
  };

  // Hook to retrieve and set chats for the user
  useEffect(() => {
    if (user && user.userId) {
      getAndSetChats(user.userId);
    }
  }, [user]);

  return <ChatsContext.Provider value={{ chats, createChat }}>{children}</ChatsContext.Provider>;
};

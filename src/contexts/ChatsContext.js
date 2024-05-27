'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, doc, getDocs, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { useFB } from './FBContext';
import { useAuth } from './AuthContext';

export const ChatsContext = createContext({
  chats: [],
  createChat: async () => {},
});

export const useChats = () => useContext(ChatsContext);

export const ChatsProvider = ({ children }) => {
  const { db } = useFB();
  const { user } = useAuth();

  const [chats, setChats] = useState([]);

  // Function to get and set chats
  const getAndSetChats = async (userId) => {
    try {
      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(chatsRef, where('userId', '==', userId));
      const chatsSnapshot = await getDocs(chatsQuery);

      const chats_ = [];
      chatsSnapshot.forEach((doc) => {
        chats_.push({ id: doc.id, ...doc.data() });
      });

      setChats([...chats_.sort((a, b) => a.chatNo - b.chatNo)]);
    } catch (error) {
      console.log('Got error fetching chats:', error);
    }
  };

  // Function to create a chat
  const createChat = async (threadId) => {
    if (user && user.userId) {
      try {
        // Get user ID
        const userId = user.userId;

        // Set chat number as the next integer and chat ID as random UUID v4
        const chatNo = chats.length + 1;
        const chatId = uuidv4();

        // Create the chat document
        const chatData = {
          title: `${user.name}'s Ad #${chatNo}`,
          threadId,
          userId,
          chatNo,
        };

        await setDoc(doc(db, 'chats', chatId), chatData);

        // Refresh chats
        await getAndSetChats(userId);

        // Return the chat no to the caller
        return chatNo;
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

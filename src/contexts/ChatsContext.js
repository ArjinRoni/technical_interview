'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  setDoc,
  orderBy,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { useFB } from './FBContext';
import { useAuth } from './AuthContext';

export const ChatsContext = createContext({
  chats: [],
  createChat: async () => {},
  updateChat: async () => {},
  getChatDetails: async () => {},
  renameChat: async () => {},
  deleteChat: async () => {},
  createMessage: async () => {},
  getMessages: async () => {},
  getAllUserMessages: async () => {},
  updateMessageRating: async () => {},
});

export const useChats = () => useContext(ChatsContext);

export const ChatsProvider = ({ children }) => {
  const { db } = useFB();
  const { user } = useAuth();

  const [chats, setChats] = useState(null);

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
        const chatNo = chats && chats.length > 0 ? Math.max(...chats.map((x) => x.chatNo)) + 1 : 1;
        const chatId = uuidv4();

        // Create the chat document
        const chatData = {
          title: `${user?.name?.split(' ')[0].trim()}'s Ad #${chatNo}`,
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

  // Function to update a chat
  const updateChat = async (chatId, updateData = {}) => {
    if (user && user.userId) {
      try {
        // Get the chat document reference
        const chatRef = doc(db, 'chats', chatId);

        // Update the chat document by appending the update data
        await updateDoc(chatRef, { ...updateData }, { merge: true });
      } catch (error) {
        console.log('Got error updating chat: ', error);
      }
    } else {
      console.log('Cannot update a chat without user credentials');
    }
  };

  // Function to retrieve chat details
  const getChatDetails = async (chatId) => {
    if (user && user.userId) {
      try {
        // Get the chat document reference
        const chatRef = doc(db, 'chats', chatId);

        // Get the chat document snapshot
        const chatSnapshot = await getDoc(chatRef);

        if (chatSnapshot.exists()) {
          // Extract the chat data from the snapshot
          const chatData = chatSnapshot.data();

          // Return the chat data
          return chatData;
        } else {
          console.log('Chat document does not exist');
          return null;
        }
      } catch (error) {
        console.log('Got error getting chat details: ', error);
        return null;
      }
    } else {
      console.log('Cannot get chat details without user credentials');
      return null;
    }
  };

  // Function to append a message to the chat
  const createMessage = async ({ message, chatId }) => {
    if (user && user.userId) {
      try {
        // Create a reference to the specific message document within the messages subcollection
        const messageRef = doc(db, 'chats', chatId, 'messages', message.id);

        // Create the message document
        const messageData = {
          role: message.role,
          text: message.text,
          images: message.images || [],
          rating: message.rating || 0,
          step: message.step || null,
          createdAt: new Date(),
        };

        // Set the message document with the specified ID
        await setDoc(messageRef, messageData);

        // Optionally, you can refresh the chats after adding the message
        // await getAndSetChats(user.userId);
      } catch (error) {
        console.log('Got error creating message: ', error);
      }
    } else {
      console.log('Cannot create a message without user credentials');
    }
  };

  // Function to retrieve messages for the current chat (sorted by created date)
  const getMessages = async (chatId) => {
    try {
      // Create a reference to the messages subcollection within the chat document
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      // Create a query to retrieve messages ordered by createdAt field
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

      // Execute the query and get the snapshot of the messages
      const messagesSnapshot = await getDocs(messagesQuery);

      // Extract the message data from the snapshot
      const messages = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return messages;
    } catch (error) {
      console.log('Got error retrieving messages: ', error);
      return [];
    }
  };

  // Function to update the rating of a message
  const updateMessageRating = async ({ chatId, messageId, rating }) => {
    if (user && user.userId) {
      try {
        // Create a reference to the specific message document
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);

        // Update the rating field of the message document
        await updateDoc(messageRef, { rating });
      } catch (error) {
        console.log('Got error updating message rating: ', error);
      }
    } else {
      console.log('Cannot update message rating without user credentials');
    }
  };

  // Function to delete a chat
  const deleteChat = async (chatId) => {
    if (user && user.userId) {
      try {
        // Delete the chat document
        await deleteDoc(doc(db, 'chats', chatId));

        // Delete all messages within the chat
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        const deletionPromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletionPromises);

        // Refresh chats
        await getAndSetChats(user.userId);
      } catch (error) {
        console.log('Got error deleting chat: ', error);
      }
    } else {
      console.log('Cannot delete a chat without user credentials');
    }
  };

  // Function to rename a chat
  const renameChat = async ({ chatId, title }) => {
    if (user && user.userId) {
      try {
        // Create a reference to the chat document
        const chatRef = doc(db, 'chats', chatId);

        // Update the title field of the chat document
        await updateDoc(chatRef, { title });

        // Refresh chats
        await getAndSetChats(user.userId);
      } catch (error) {
        console.log('Got error renaming chat: ', error);
      }
    } else {
      console.log('Cannot rename a chat without user credentials');
    }
  };

  // Function to retrieve all messages sent by the user across all chats
  const getAllUserMessages = async () => {
    if (user && user.userId) {
      try {
        const userMessages = [];

        // Get all chats for the user
        const chatsRef = collection(db, 'chats');
        const chatsQuery = query(chatsRef, where('userId', '==', user.userId));
        const chatsSnapshot = await getDocs(chatsQuery);

        // Iterate over each chat
        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.id;

          // Create a reference to the messages subcollection within the chat document
          const messagesRef = collection(db, 'chats', chatId, 'messages');

          // Create a query to retrieve messages sent by the user ordered by createdAt field
          const messagesQuery = query(
            messagesRef,
            where('role', '==', 'user'),
            orderBy('createdAt', 'asc'),
          );

          // Execute the query and get the snapshot of the messages
          const messagesSnapshot = await getDocs(messagesQuery);

          // Extract the message data from the snapshot
          const messages = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Add the messages to the userMessages array
          userMessages.push(...messages);
        }

        return userMessages;
      } catch (error) {
        console.log('Got error retrieving user messages: ', error);
        return [];
      }
    } else {
      console.log('Cannot retrieve user messages without user credentials');
      return [];
    }
  };

  // Hook to retrieve and set chats for the user
  useEffect(() => {
    if (user && user.userId) {
      getAndSetChats(user.userId);
    }
  }, [user]);

  return (
    <ChatsContext.Provider
      value={{
        chats,
        createChat,
        updateChat,
        getChatDetails,
        renameChat,
        deleteChat,
        createMessage,
        getMessages,
        getAllUserMessages,
        updateMessageRating,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';

import { Modal, Spinner, MultilineInput, Button } from '@/components';

import { checkError } from '@/utils/ErrorHandler';

import { useAuth } from './AuthContext';
import { useFB } from './FBContext';
import { useFont } from './FontContext';

export const UIContext = createContext({
  isSidebarOpen: true,
  setIsSidebarOpen: () => {},
  isLoading: false,
  setIsLoading: () => {},
  setShowFeedbackForm: () => {},
  setLoadingMessage: () => {},
});

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const { primaryFont } = useFont();
  const { user } = useAuth();
  const { db } = useFB();

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Clean up the loading message when loading state ends
  useEffect(() => {
    !isLoading && setLoadingMessage(null);
  }, [isLoading]);

  // Function to submit feedback
  const submitFeedback = async () => {
    const hasError = checkError([
      {
        condition: !feedback || feedback.trim().length === 0,
        message: 'Please type your feedback.',
      },
    ]);
    if (hasError) return;

    if (user && user.userId) {
      try {
        const feedbackData = {
          userId: user.userId,
          userName: user.name,
          userEmail: user.email,
          createdAt: new Date(),
          feedbackText: feedback,
        };

        const feedbackRef = collection(db, 'feedbacks');
        await addDoc(feedbackRef, feedbackData);
      } catch (error) {
        console.log('Got error submitting feedback: ', error);
      }
    } else {
      console.log('Cannot submit feedback without user credentials');
    }

    setShowFeedbackForm(false);
    setFeedback('');
    toast.success('Feedback submitted - thanks 🙏');
  };

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isLoading,
        setIsLoading,
        setShowFeedbackForm,
        setLoadingMessage,
      }}
    >
      {isLoading && (
        <Modal>
          {loadingMessage && loadingMessage.length > 0 && (
            <p style={{ fontFamily: primaryFont.style.fontFamily }}>{loadingMessage}</p>
          )}
          <Spinner />
        </Modal>
      )}
      {showFeedbackForm && (
        <Modal>
          <p style={{ fontSize: 24, fontFamily: primaryFont.style.fontFamily }}>
            Give us feedback 💜
          </p>
          <p style={{ fontSize: 14 }}>
            We value your thoughts and suggestions as they help us improve and grow. Please take a
            moment to share your experience with us.
          </p>
          <MultilineInput value={feedback} setValue={setFeedback} />
          <Button text="Submit" onClick={submitFeedback} alignSelf="center" />
          <button
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
            onClick={() => {
              setShowFeedbackForm(false);
              setFeedback('');
            }}
          >
            <img style={{ width: 36, height: 36 }} src="/discard_button_with_bg.png" />
          </button>
        </Modal>
      )}
      {children}
    </UIContext.Provider>
  );
};

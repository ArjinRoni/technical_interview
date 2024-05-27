'use client';
import { createContext, useContext, useState, useEffect } from 'react';

import { Modal, Spinner } from '@/components';

import { useFont } from './FontContext';

export const UIContext = createContext({
  isSidebarOpen: true,
  setIsSidebarOpen: () => {},
  isLoading: false,
  setIsLoading: () => {},
  setLoadingMessage: () => {},
});

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const { primaryFont } = useFont();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Clean up the loading message when loading state ends
  useEffect(() => {
    !isLoading && setLoadingMessage(null);
  }, [isLoading]);

  return (
    <UIContext.Provider
      value={{ isSidebarOpen, setIsSidebarOpen, isLoading, setIsLoading, setLoadingMessage }}
    >
      {isLoading && (
        <Modal>
          {loadingMessage && loadingMessage.length > 0 && (
            <p style={{ fontFamily: primaryFont.style.fontFamily }}>{loadingMessage}</p>
          )}
          <Spinner />
        </Modal>
      )}
      {children}
    </UIContext.Provider>
  );
};

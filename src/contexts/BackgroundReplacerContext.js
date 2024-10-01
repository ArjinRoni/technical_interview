'use client';
import { createContext, useContext, useState } from 'react';
import { backgroundReplacerService } from '@/services/backgroundReplacerService';

export const BackgroundReplacerContext = createContext({
  processProductInfo: async () => {},
  isProcessing: false,
  backgroundImage: null,
  originalPrompts: null,
  error: null,
});

export const useBackgroundReplacer = () => useContext(BackgroundReplacerContext);

export const BackgroundReplacerProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [originalPrompts, setOriginalPrompts] = useState(null);
  const [error, setError] = useState(null);

  const processProductInfo = async (productInfo) => {
    setIsProcessing(true);
    try {
      const result = await backgroundReplacerService.processProductInfo(productInfo);
      setIsProcessing(false);
      if (result.success) {
        setBackgroundImage(result.replacedImageBase64);
        setOriginalPrompts(result.originalPrompts);
        return result;
      } else {
        throw new Error(result.error || 'Background replacement failed');
      }
    } catch (error) {
      setIsProcessing(false);
      console.error('Error processing product information:', error);
      throw error;
    }
  };

  return (
    <BackgroundReplacerContext.Provider
      value={{
        processProductInfo,
        isProcessing,
        backgroundImage,
        originalPrompts,
        error,
      }}
    >
      {children}
    </BackgroundReplacerContext.Provider>
  );
};
// Function to remove loading messages
export const removeLoading = (messages) => {
  return messages.filter((message) => !message.isLoading);
};

// Dictionary that maps message identifiers to message objects
export const MESSAGES = {
  IMAGE_UPLOAD: { isImageUpload: true },
  LOADING: { role: 'assistant', isLoading: true },
  USER_LOADING: { role: 'user', isLoading: true },
  STREAMING: { role: 'assistant', isStreaming: true, text: '', isLoading: true },
  SKELETON: { role: 'assistant', isSkeleton: true },
};

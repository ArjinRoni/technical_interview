import { STEPS } from './StepUtil';

// Dictionary that maps message identifiers to message objects
export const MESSAGES = {
  IMAGE_UPLOAD: { isImageUpload: true },
  LOADING: { role: 'assistant', isLoading: true },
  USER_LOADING: { role: 'user', isLoading: true },
  STREAMING: { role: 'assistant', isStreaming: true, text: '', isLoading: true },
  SKELETON: { role: 'assistant', isSkeleton: true },
  STYLE_AND_SETTING: { role: 'user', isStyleAndSetting: true },
  CLASSIFICATION_TOKEN: { role: 'user', isClassificationToken: true },
};

// Function to remove loading messages
export const removeLoading = (messages) => {
  return messages.filter((message) => !message.isLoading && !message.isSkeleton);
};

// Function to remove user input form messages
export const removeFormInput = (messages) => {
  return messages.filter((message) => !message.isStyleAndSetting && !message.isClassificationToken);
};

// Returns true if the current message is considered to be loading
export const isMessageLoading = (message) => {
  return message.isLoading === true || message.isSkeleton === true;
};

export const isHideUserInput = (x, isStep = true) => {
  if (isStep) {
    return (
      x === STEPS.IMAGE_UPLOAD ||
      x === STEPS.MOODBOARD ||
      x === STEPS.STYLE_AND_SETTING ||
      x === STEPS.CLASSIFICATION_TOKEN
    );
  }

  return (
    x.isImageUpload === true ||
    x.isMoodboard === true ||
    x.isStyleAndSetting === true ||
    x.isClassificationToken === true
  );
};

import { STEPS } from './StepUtil';

// Dictionary that maps message identifiers to message objects
export const MESSAGES = {
  IMAGE_UPLOAD: { isImageUpload: true },
  LOADING: { role: 'assistant', isLoading: true },
  USER_LOADING: { role: 'user', isLoading: true },
  STREAMING: { role: 'assistant', isStreaming: true, text: '', isLoading: true },
  SKELETON: { role: 'assistant', step: STEPS.INFERENCE, isSkeleton: true },
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

// Function to convert prompts and images into shots dictionary
export function transformToShots(prompts, images) {
  const shotsPerGroup = 1;
  const result = {};

  for (let i = 0; i < prompts.length; i++) {
    const groupIndex = Math.floor(i / shotsPerGroup) + 1;
    const prompt = prompts[i];
    const image = images[i];

    if (!result[groupIndex]) {
      result[groupIndex] = [];
    }

    result[groupIndex].push({ [prompt]: image });
  }

  return result;
}

export const isHideUserInput = (x, isStep = true) => {
  if (isStep) {
    return (
      x === STEPS.CLASSIFICATION_TOKEN ||
      x === STEPS.IMAGE_UPLOAD ||
      x === STEPS.MOODBOARD ||
      x === STEPS.STYLE_AND_SETTING ||
      x === STEPS.INFERENCE ||
      x === STEPS.STORYBOARD ||
      x === STEPS.VIDEOS
    );
  }

  return (
    x.isImageUpload === true ||
    x.isMoodboard === true ||
    x.isStyleAndSetting === true ||
    x.isClassificationToken === true
  );
};

// Text identifier to signal that the agent is in inference mode
export const finalStepsIdentifierText = 'the final steps';

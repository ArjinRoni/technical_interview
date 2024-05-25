import { toast } from 'react-hot-toast';

// Function that takes a list of conditions and messages (format: [{ condition, message }]) and returns true if error found and false otherwise
export const checkError = (conditionsAndMessages) => {
  for (const conditionAndMessage of conditionsAndMessages) {
    const { condition, message } = conditionAndMessage;

    if (condition) {
      toast.error(message, 'center');
      return true;
    }
  }

  return false;
};

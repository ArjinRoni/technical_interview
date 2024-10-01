import axios from 'axios';

export const backgroundReplacerService = {
  processProductInfo: async (productInfo) => {
    try {
      const response = await axios.post('/api/background-replacer', productInfo);
      
      console.log("Full API response:", response);

      if (response.data.success) {
        console.log("Successful response:", response.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.error || 'Background replacement failed');
      }
    } catch (error) {
      console.error('Error in background replacer service:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
};

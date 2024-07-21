import { ref, getDownloadURL } from 'firebase/storage';

// Function to generate signed URLs for images
export const generateSignedUrls = async ({
  images = [],
  storage = null,
  setUploading = () => {},
  setImages = () => {},
}) => {
  setUploading && setUploading(true);
  let signedUrls = [];

  for (const image of images) {
    try {
      let storageFilepath = null;

      // There are two cases: (1) Starts with HTTPS, this is the FB signed URL OR (2) Starts with `users/`, this is the path in FB Storage
      if (image.startsWith('http') && image.includes('?') && image.includes('o/')) {
        storageFilepath = image.replaceAll('%2F', '/').split('://')[1]; // To remove the https:// part
        storageFilepath = storageFilepath.split('/').slice(2).join('/'); // To remove the bucket name
        storageFilepath = storageFilepath.split('?')[0].split('o/').slice(-1)[0]; // To remove the ? query and the o/ prefix
      } else if (image.startsWith('http')) {
        storageFilepath = image.split('://')[1]; // To remove the https:// part
        storageFilepath = storageFilepath.split('/').slice(2).join('/'); // To remove the bucket name
      } else {
        storageFilepath = image;
      }

      const signedUrl = await getDownloadURL(ref(storage, storageFilepath)); // Get the signed URL
      signedUrls.push(signedUrl);
    } catch (error) {
      console.log('Got error getting signed url for: ', image, error);
    }
  }

  setImages && setImages(signedUrls);
  setUploading && setTimeout(() => setUploading(false), 500);

  return signedUrls;
};

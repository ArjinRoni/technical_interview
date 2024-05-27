import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFB } from '@/contexts/FBContext';

const ImageUpload = ({ onUpload }) => {
  const { storage } = useFB();
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    });

    const urls = await Promise.all(uploadPromises);
    setUploadedImages((prevImages) => [...prevImages, ...urls]);
    onUpload(urls);
    setUploading(false);
  };

  return (
    <form>
      <input type="file" accept="image/*" multiple onChange={handleUpload} />
      {uploading && <p>Uploading...</p>}
      {uploadedImages.length > 0 && (
        <div>
          <p>Uploaded Images:</p>
          {uploadedImages.map((url, index) => (
            <img key={index} src={url} alt={`Uploaded ${index}`} />
          ))}
        </div>
      )}
    </form>
  );
};

export default ImageUpload;
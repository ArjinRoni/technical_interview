'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

import './image_upload.css';

import Button from '../button/Button';

import { useAuth } from '@/contexts/AuthContext';
import { useFB } from '@/contexts/FBContext';

const ImageUpload = ({ isAI = false, isActive = true, chatId, imagesInit = [], onSubmit }) => {
  const { user } = useAuth();
  const { storage } = useFB();

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [uploadedImages, setUploadedImages] = useState(isAI ? [] : imagesInit);

  useEffect(() => {
    const generateSignedUrls = async (images) => {
      let signedUrls = [];
      for (const image of images) {
        let storageFilepath = image.split('://')[1]; // To remove the https:// part
        storageFilepath = storageFilepath.split('/').slice(2).join('/'); // To remove the bucket name

        const signedUrl = await getDownloadURL(ref(storage, storageFilepath)); // Get the signed URL
        signedUrls.push(signedUrl);
      }

      setUploadedImages(signedUrls);
    };

    if (isAI && imagesInit && imagesInit.length > 0) {
      generateSignedUrls(imagesInit);
    }
  }, [imagesInit]);

  // TODO: Don't have to cloud write to show images to the user
  const handleUpload = async (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(storage, `users/${user.userId}/${chatId}/inputs/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    });

    const urls = await Promise.all(uploadPromises);
    setUploadedImages((prevImages) => [...prevImages, ...urls]);
    setUploading(false);
  };

  // Function to handle form submit
  const onSubmit_ = () => {
    if (!uploadedImages || uploadedImages.length === 0) {
      toast('Please upload images of your product to proceed 📷');
      return;
    }

    onSubmit([...new Set(uploadedImages)]);
  };

  // Function to pop-up file picker
  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  // Function to handle discarding images
  const handleDiscardImage = (index) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return (
    <div className="image-upload-form">
      <div>
        <p style={{ color: isActive && !isAI ? '#757575' : '#FFFFFF' }}>
          {isAI
            ? `Thank you for your patience, ${user?.name?.split(' ')[0].trim()}! Here are your ads 🚀 Please let me know if you have any feedback or thoughts.`
            : `Here are my beautiful product images ${randChoice(['💜', '🤩', '🚀', '😍', '🥰', '😸'])}`}
        </p>
        <div className="upload-square">
          {isActive && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          )}
          <div className="uploaded-images-div">
            {isActive && (
              <div className="upload-image-box" onClick={handleClickUpload}>
                <img style={{ height: 32, width: 32 }} src="/upload.png" />
              </div>
            )}
            {uploadedImages.length > 0 &&
              uploadedImages.map((url, index) => (
                <div
                  key={index}
                  className="uploaded-image-wrapper"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Image
                    className="uploaded-image"
                    alt={`Image ${index}`}
                    key={index}
                    width={64}
                    height={64}
                    src={url}
                  />
                  {hoveredIndex === index && isActive && (
                    <img
                      className="remove-image-button"
                      src="/discard_button_with_bg.png"
                      onClick={() => handleDiscardImage(index)}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
        {isActive && uploadedImages && uploadedImages.length > 0 && (
          <div className="image-upload-button-div">
            <Button
              text="Next"
              type="button"
              width={64}
              fontSize={16}
              alignSelf="flex-end"
              borderRadius={8}
              marginTop={24}
              onClick={() => onSubmit_()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

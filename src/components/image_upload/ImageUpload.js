'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

import './image_upload.css';

import Button from '../button/Button';
import Spinner from '../spinner/Spinner';
import Checkbox from '../checkbox/Checkbox';
import Image from '../image/Image';

import { useAuth } from '@/contexts/AuthContext';
import { useFB } from '@/contexts/FBContext';

import { generateSignedUrls } from '@/utils/MediaUtils';

const ImageUpload = ({
  isAI = false,
  isActive = true,
  chatId = null,
  imagesInit = [],
  isMoodboard = false,
  selectedImagesInit = [],
  onSubmit = () => {},
  onSubmitMoodboard = () => {},
}) => {
  const { user } = useAuth();
  const { storage } = useFB();

  const fileInputRef = useRef(null);
  const buttonRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [uploadedImages, setUploadedImages] = useState(isAI ? [] : imagesInit);
  const [loadedImages, setLoadedImages] = useState({});
  const [selectedImages, setSelectedImages] = useState(isMoodboard ? selectedImagesInit : null); // Selected images for the moodboard
  const [showMoodboardSubmit, setShowMoodboardSubmit] = useState(isMoodboard && isActive);

  // Set which images to use for displaying to the user
  const usedImages = isActive || !isMoodboard ? uploadedImages : selectedImages;

  // Limit for image upload
  const MIN_IMAGES_REQUIRED = 3;

  useEffect(() => {
    if (isAI && imagesInit && imagesInit.length > 0) {
      generateSignedUrls({
        images: imagesInit,
        storage: storage,
        setImages: isActive || !isMoodboard ? setUploadedImages : setSelectedImages,
        setUploading: setUploading,
      });
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
    setTimeout(() => setUploading(false), 500);
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

    // Trigger the bouncy animation
    buttonRef.current.style.transform = 'scale(0.8)';
    setTimeout(() => {
      buttonRef.current.style.transform = 'scale(1)';
    }, 100);
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

  // Function to submit moodboard images
  const onSubmitMoodboard_ = () => {
    setShowMoodboardSubmit(false);
    onSubmitMoodboard([...new Set(selectedImages)]);
  };

  return (
    <div className="image-upload-form">
      <div>
        <p
          style={{
            color: isActive && !isAI ? '#757575' : isMoodboard ? '#FFFFFF' : '#FFFFFF',
            fontWeight: isMoodboard ? 550 : 400,
            marginBottom: isMoodboard ? 24 : undefined,
          }}
        >
          {isAI
            ? isMoodboard
              ? showMoodboardSubmit
                ? `Here is your moodboard, ${user?.name?.split(' ')[0].trim()}! Please select the images you like.`
                : 'Thank you for your selection!'
              : `Thank you for your patience, ${user?.name?.split(' ')[0].trim()}! Here are your ads 🚀 Please let me know if you have any feedback or thoughts.`
            : `Here are my beautiful product images ${randChoice(['💜', '🤩', '🚀', '😍', '🥰', '😸'])}`}
        </p>
        <div className="upload-square">
          {isActive && !isAI && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          )}
          <div className="uploaded-images-div" style={{ maxWidth: 728 }}>
            {isActive &&
              !isAI &&
              (uploading ? (
                <Spinner
                  size={32}
                  marginTop={34}
                  extraStyle={{ marginLeft: 34, marginRight: 34, marginBottom: 34 }}
                  isDark={true}
                />
              ) : (
                <div ref={buttonRef} className="upload-image-box" onClick={handleClickUpload}>
                  <img style={{ height: 56, width: 56 }} src="/upload.png" />
                </div>
              ))}
            {!uploading &&
              usedImages &&
              usedImages.length > 0 &&
              usedImages.map((url, index) => (
                <div
                  key={index}
                  className="uploaded-image-wrapper"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  {isActive && isMoodboard && loadedImages[url] && (
                    <Checkbox
                      isSelectedInit={selectedImagesInit?.includes(url)}
                      onPress={() => setSelectedImages((prev) => [...prev, url])}
                    />
                  )}
                  <Image
                    className="uploaded-image"
                    alt={`Image ${index}`}
                    width={0}
                    height={0}
                    key={index}
                    sizes="100vw"
                    style={{ width: 'auto', height: isMoodboard ? 256 * 0.885 : 164 }} // optional
                    src={url}
                    onLoad={() => setLoadedImages((prev) => ({ ...prev, [url]: true }))}
                  />
                  {hoveredIndex === index && isActive && !isAI && (
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
        {!isMoodboard &&
          isActive &&
          !isAI &&
          !uploading &&
          uploadedImages &&
          uploadedImages.length >= MIN_IMAGES_REQUIRED && (
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
        {showMoodboardSubmit && isMoodboard && selectedImages?.length > 0 && (
          <div className="image-upload-button-div">
            <Button
              text="Next"
              type="button"
              width={64}
              fontSize={16}
              alignSelf="flex-end"
              borderRadius={8}
              marginTop={24}
              onClick={() => onSubmitMoodboard_()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

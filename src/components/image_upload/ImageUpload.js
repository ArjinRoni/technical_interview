'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

import './image_upload.css';

import Button from '../button/Button';
import Spinner from '../spinner/Spinner';
import Checkbox from '../checkbox/Checkbox';
import Image from '../image/Image';

import { useAuth } from '@/contexts/AuthContext';
import { useFB } from '@/contexts/FBContext';
import { useUI } from '@/contexts/UIContext';

import { generateSignedUrls } from '@/utils/MediaUtils';

const MAX_SIZE = 1024;

// Function to convert images to PNG
const convertToPNG = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          resolve(
            new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.png', {
              type: 'image/png',
              lastModified: Date.now(),
            }),
          );
        }, 'image/png');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const resizeImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(
            new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.png', {
              type: 'image/png',
              lastModified: Date.now(),
            }),
          );
        }, 'image/png');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

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
  const { isSidebarOpen } = useUI();

  const [containerWidth, setContainerWidth] = useState(0);
  const [imageSize, setImageSize] = useState(0);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const buttonRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [uploadedImages, setUploadedImages] = useState(isAI ? [] : imagesInit);
  const [localImages, setLocalImages] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [selectedImages, setSelectedImages] = useState(isMoodboard ? selectedImagesInit : null); // Selected images for the moodboard
  const [showMoodboardSubmit, setShowMoodboardSubmit] = useState(isMoodboard && isActive);

  // Set which images to use for displaying to the user
  const usedImages =
    isActive || !isMoodboard
      ? isActive && !isMoodboard
        ? localImages
        : uploadedImages
      : selectedImages;

  // Limit for image upload
  const MIN_IMAGES_REQUIRED = 5;
  const MAX_IMAGES_ALLOWED = 8;

  // Set min and max sizes
  const maxSize = isMoodboard ? 400 : 300;

  // Hook for handling resizing
  const calculateImageSize = useCallback(() => {
    return containerWidth * 0.33 - (isMoodboard ? 84 : 12);
  }, [containerWidth, isMoodboard]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        let newWidth;
        if (isMoodboard) {
          newWidth = (window.innerWidth - (isSidebarOpen ? 192 : 0)) * 0.85;
          newWidth = newWidth > 1256 ? 1256 : newWidth;
        } else {
          newWidth = containerRef.current.offsetWidth;
          newWidth = newWidth > 1028 ? 1028 : newWidth;
        }

        newWidth = newWidth < 500 ? 500 : newWidth;
        setContainerWidth(newWidth);
      }
    };

    // Initial size calculation
    updateSize();

    // Set up resize observer and window resize listener
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);

    // Clean up
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [isMoodboard, isSidebarOpen]);

  useEffect(() => {
    setImageSize(calculateImageSize());
  }, [containerWidth, calculateImageSize]);

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

  // Function to upload a file to the cloud
  const uploadToCloud = async (file) => {
    const pngFile = await convertToPNG(file);
    const resizedFile = await resizeImage(pngFile);
    const storageRef = ref(storage, `users/${user.userId}/${chatId}/inputs/${resizedFile.name}`);
    await uploadBytes(storageRef, resizedFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // Function to handle the upload
  const handleUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newLocalImages = await Promise.all(
      files.map(async (file) => {
        const pngFile = await convertToPNG(file);
        return URL.createObjectURL(pngFile);
      }),
    );
    setLocalImages((prevImages) => [...prevImages, ...newLocalImages]);

    const uploadPromises = files.map(async (file) => {
      try {
        const url = await uploadToCloud(file);
        setUploadedImages((prevImages) => [...prevImages, url]);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image. Please try again.');
      }
    });

    Promise.all(uploadPromises).then(() => {
      setUploading(false);
    });
  };

  // Function to handle form submit
  const onSubmit_ = async () => {
    if (localImages.length === 0) {
      toast('Please upload images of your product to proceed 📷');
      return;
    } else if (localImages.length < MIN_IMAGES_REQUIRED) {
      toast(`You need to upload a minimum of ${MIN_IMAGES_REQUIRED} product images 📷`);
      return;
    } else if (localImages.length > MAX_IMAGES_ALLOWED) {
      toast(`Please upload a maximum of ${MAX_IMAGES_ALLOWED} product images 📷`);
      return;
    }

    setUploading(true);
    while (uploadedImages.length < localImages.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setUploading(false);

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
    setLocalImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
            : `Here are my beautiful product images ${randChoice(['💜', '🤩', '🚀', '😍', '🥰', '😸', '🦆', '🦄'])}`}
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
          <div
            ref={containerRef}
            className="uploaded-images-div"
            style={{
              maxWidth: isMoodboard ? 1256 : 1028,
              minWidth: 500,
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
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
                <div
                  ref={buttonRef}
                  className="upload-image-box"
                  onClick={handleClickUpload}
                  style={{
                    width: `${imageSize}px`,
                    height: `${imageSize}px`,
                    maxWidth: maxSize,
                    maxHeight: maxSize,
                    flexShrink: 0,
                  }}
                >
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
                  style={{
                    width: `${imageSize}px`,
                    height: `${imageSize}px`,
                    maxWidth: maxSize,
                    maxHeight: maxSize,
                    flexShrink: 0,
                  }}
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
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
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
          uploadedImages.length > 0 && (
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

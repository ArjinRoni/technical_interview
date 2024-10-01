'use client';
import React, { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import styles from './BackgroundReplacer.module.css';
import { useBackgroundReplacer } from '@/contexts/BackgroundReplacerContext';
import { useFB } from '@/contexts/FBContext';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // for generating unique filenames
import Image from 'next/image';

const BackgroundReplacer = () => {
  const [url, setUrl] = useState('');
  const [productInfo, setProductInfo] = useState(null);
  const [additionalInput, setAdditionalInput] = useState('');
  const [error, setError] = useState(null);
  const [replacedImage, setReplacedImage] = useState(null);
  const [signedUrl, setSignedUrl] = useState(null);
  const [originalPrompts, setOriginalPrompts] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);

  const { processProductInfo, enhanceImage, isProcessing: isProcessingFromContext, backgroundImage } = useBackgroundReplacer();
  const { storage } = useFB();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProductInfo(null);
    setAdditionalInput('');
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.success) {
        setProductInfo(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error scraping URL:', error);
      setError('An error occurred while scraping the URL');
    }
  };

  const handleGenerate = async () => {
    if (!productInfo) {
      setError('Please fetch product information first');
      return;
    }
    const enhancedProductInfo = {
      ...productInfo,
      additionalUserNote: additionalInput
    };
    try {
      const result = await processProductInfo(enhancedProductInfo);
      console.log("Result from processProductInfo:", result);
      if (result.success && result.data && result.data.image) {
        setReplacedImage(result.data.image);
        console.log("Replaced image (first 100 chars):", result.data.image.substring(0, 100));
        setOriginalPrompts(result.data.formattedRequest);
        setError(null);
      } else {
        setError(result.error || 'Failed to generate replaced image');
      }
    } catch (error) {
      console.error("Error in handleGenerate:", error);
      setError(error.message || 'An error occurred during image generation');
    }
  };

  const handleEnhance = async () => {
    try {
      setError(null);
      const result = await enhanceImage(replacedImage);
      if (result.success) {
        setReplacedImage(result.data.upscaledImage);
        setIsEnhanced(true);
      } else {
        throw new Error(result.error || 'Image enhancement failed');
      }
    } catch (error) {
      console.error('Error enhancing image:', error);
      setError('An error occurred while enhancing the image');
    }
  };

  const uploadToFirebaseAndGetSignedUrl = async (base64Image) => {
    try {
      console.log("Uploading to Firebase, base64Image length:", base64Image.length);
      // Generate a unique filename
      const filename = `background-replaced-${uuidv4()}.png`;
      
      // Create a reference to the file location
      const imageRef = ref(storage, `background-replaced-images/${filename}`);
      
      // Upload the base64 string
      await uploadString(imageRef, base64Image, 'data_url');
      
      // Get the download URL (signed URL)
      const url = await getDownloadURL(imageRef);
      
      console.log("Got signed URL:", url);
      setSignedUrl(url);
    } catch (error) {
      console.error("Error uploading image to Firebase:", error);
      setError("Failed to upload image to storage");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />
      <div className={styles.contentContainer}>
        <div className={styles.leftColumn}>
          <div className={styles.urlInputContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter Pazarama URL"
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Fetch
              </button>
            </form>
          </div>
          <div className={styles.fetchedImageContainer}>
            {productInfo && productInfo.imageUrl ? (
              <img src={productInfo.imageUrl} alt={productInfo.productName} className={styles.fetchedImage} />
            ) : (
              <p>Fetched image will appear here</p>
            )}
          </div>
          {productInfo && (
            <div className={styles.rectangle}>
              <h3>Product Details</h3>
              <p><strong>Name:</strong> {productInfo.productName}</p>
              <p><strong>Original Price:</strong> {productInfo.originalPrice}</p>
              <p><strong>Current Price:</strong> {productInfo.currentPrice}</p>
              <p><strong>Color:</strong> {productInfo.color}</p>
              <h4>Category</h4>
              <p>{productInfo.category}</p>
              <h4>Description</h4>
              <p className={styles.description}>{productInfo.description}</p>
              <h4>Features</h4>
              <ul className={styles.featuresList}>
                {productInfo.features.map((feature, index) => (
                  <li key={index}><strong>{feature.name}:</strong> {feature.value}</li>
                ))}
              </ul>
            </div>
          )}
          {productInfo && (
            <div className={styles.additionalInputContainer}>
              <textarea
                value={additionalInput}
                onChange={(e) => setAdditionalInput(e.target.value)}
                placeholder="Add additional notes for prompt generation..."
                className={styles.additionalInput}
              />
              <button onClick={handleGenerate} className={styles.generateButton}>
                Generate
              </button>
            </div>
          )}
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.generatedImageContainer}>
            {isProcessing ? (
              <div className={styles.processingOverlay}>
                <div className={styles.spinner}></div>
                <p>Enhancing image...</p>
              </div>
            ) : null}
            {replacedImage ? (
              <>
                <img 
                  src={`data:image/png;base64,${replacedImage}`}
                  alt="Generated Image" 
                  className={styles.generatedImage}
                />
                {!isEnhanced && (
                  <button 
                    onClick={handleEnhance}
                    className={styles.enhanceButton}
                    disabled={isProcessing}
                  >
                    Enhance
                  </button>
                )}
                {isEnhanced && (
                  <div className={styles.enhancedLabel}>Enhanced</div>
                )}
              </>
            ) : (
              <div className={styles.generatedImage}>No image generated yet</div>
            )}
          </div>
          {originalPrompts && (
            <div className={styles.promptsContainer}>
              <h4>Generated Prompts</h4>
              <p><strong>Style:</strong> {originalPrompts.prompt_style}</p>
              <p><strong>Main:</strong> {originalPrompts.prompt_main}</p>
              <p><strong>Classification:</strong> {originalPrompts.classification_token}</p>
            </div>
          )}
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default BackgroundReplacer;
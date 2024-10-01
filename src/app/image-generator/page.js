'use client';
import React, { useState } from 'react';
import { Sidebar, Spinner } from '@/components';
import styles from './ImageGenerator.module.css';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);

  const aspectRatios = ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4'];

  const handleGenerate = () => {
    setIsGenerating(true);
    // TODO: Implement actual image generation logic
    setTimeout(() => setIsGenerating(false), 5000); // Simulate generation for 5 seconds
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.promptSpace}>
          <div className={styles.logo}>
            <h1 className={styles.title}>New Frame</h1>
            <h2 className={styles.subtitle}>Creative Space</h2>
          </div>
          <div className={styles.promptInputContainer}>
            <div className={styles.promptHeader}>
              <img src="/bulb-icon.svg" alt="Prompt" className={styles.promptIcon} />
              <span>Prompt</span>
            </div>
            <textarea
              className={styles.promptInput}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Anime manga style, light watercolor, a beautiful fairy in a gorgeous dress, clear facial features, mythology, soft colors."
            />
            <div className={styles.promptFooter}>
              <span className={styles.charCount}>{prompt.length} / 2500</span>
              <button className={styles.copyButton}>📋</button>
            </div>
          </div>
          <div className={styles.settingsContainer}>
            <div className={styles.settingHeader}>
              <img src="/aspect-ratio-icon.svg" alt="Aspect Ratio" className={styles.settingIcon} />
              <span>Aspect Ratio</span>
            </div>
            <div className={styles.aspectRatios}>
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  className={`${styles.ratioButton} ${selectedRatio === ratio ? styles.selected : ''}`}
                  onClick={() => setSelectedRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
          <button 
            className={styles.generateButton} 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <div className={styles.imageArea}>
          {isGenerating ? (
            <div className={styles.generatingContainer}>
              <Spinner />
              <p className={styles.generatingText}>Generating...</p>
            </div>
          ) : (
            <p className={styles.placeholderText}>
              Unlock your creative potential and experience the magic of KLING AI right now!
            </p>
          )}
        </div>
      </div>
      <div className={styles.footer}>
        <p>The generated contents do not represent the views, positions or attitudes of KLING AI. Please use them responsibly and kindly.</p>
      </div>
    </div>
  );
};

export default ImageGenerator;

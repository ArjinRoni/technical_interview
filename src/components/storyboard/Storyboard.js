'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import './storyboard.css';

import Button from '../button/Button';
import Spinner from '../spinner/Spinner';

import { useFont } from '@/contexts/FontContext';
import { useFB } from '@/contexts/FBContext';

import { generateSignedUrls } from '@/utils/MediaUtils';

const PropmtInput = ({ placeholder, value, setValue }) => {
  const { secondaryFont } = useFont();
  const textareaRef = useRef(null);

  const width = 256 * 1.3;

  // Function to adjust the height of the textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Adjust height on mount and when value changes
  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Adjust height when placeholder changes (in case it's longer than the value)
  useEffect(() => {
    adjustHeight();
  }, [placeholder]);

  return (
    <textarea
      ref={textareaRef}
      className="storyboard-prompt-input"
      placeholder={'Type your prompt...'}
      style={{
        width,
        minHeight: '40px', // Set a minimum height
        resize: 'none', // Prevent manual resizing
        overflow: 'hidden', // Hide scrollbar
        fontFamily: secondaryFont.style.fontFamily,
      }}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        adjustHeight();
      }}
      onInput={adjustHeight} // Adjust height on any input (e.g., pasting)
    />
  );
};

const Shot = ({ shotNumber, promptImagePairs, setLoadedImages, onRefresh }) => {
  const { primaryFont } = useFont();
  const [currentPairIndex, setCurrentPairIndex] = useState(promptImagePairs.length - 1);
  const [[prompt, image]] = Object.entries(promptImagePairs[currentPairIndex]);
  const [value, setValue] = useState(prompt);

  useEffect(() => {
    const [[currentPrompt]] = Object.entries(promptImagePairs[currentPairIndex]);
    setValue(currentPrompt);
  }, [currentPairIndex, promptImagePairs]);

  return (
    <div className="storyboard-image-div">
      <div className="storyboard-image-header" style={{ fontFamily: primaryFont.style.fontFamily }}>
        <p>Shot {shotNumber}</p>
        <div>
          <Button
            width={76}
            text="Refresh"
            type="button"
            fontSize={14}
            alignSelf="flex-end"
            borderRadius={8}
            marginTop={0}
            onClick={() => onRefresh({ prompt: value, shotNumber })}
          />
        </div>
      </div>
      <div className="storyboard-image-inner-div">
        {image ? (
          <Image
            className="storyboard-image"
            alt={`Image ${shotNumber}`}
            width={0}
            height={0}
            key={`${shotNumber}-${currentPairIndex}`}
            sizes="100vw"
            style={{ width: 256 * 1.3, height: 256 * 1.3 * (9 / 16) }} // TODO: Set height to 'auto' later
            src={image}
            onLoad={() => setLoadedImages((prev) => ({ ...prev, [image]: true }))}
          />
        ) : (
          <SkeletonTheme
            baseColor="#202020"
            highlightColor="#444444"
            width={256 * 1.3}
            height={256 * 1.3 * (9 / 16) - 2}
          >
            <Skeleton count={1} style={{ marginBottom: 6 }} />
          </SkeletonTheme>
        )}
        <div className="storyboard-image-buttons-div">
          {currentPairIndex > 0 && (
            <img
              style={{ borderRadius: 300 }}
              width={32}
              height={32}
              src="/back-gradient.png"
              onClick={() => setCurrentPairIndex((prev) => prev - 1)}
              alt="Previous"
            />
          )}
          {currentPairIndex < promptImagePairs.length - 1 && (
            <img
              style={{ borderRadius: 300, marginLeft: 'auto' }}
              width={32}
              height={32}
              src="/forward-gradient.png"
              onClick={() => setCurrentPairIndex((prev) => prev + 1)}
              alt="Next"
            />
          )}
        </div>
      </div>
      <PropmtInput placeholder={prompt} value={value} setValue={setValue} />
    </div>
  );
};
const Storyboard = ({ isActive = false, chatId = null, shotsInit = {}, onSubmit = () => {} }) => {
  const { storage } = useFB();

  const [loading, setLoading] = useState(false);
  const [shots, setShots] = useState({});
  const [loadedImages, setLoadedImages] = useState({});

  // Hook to download the generated shot images and display to the user
  useEffect(() => {
    if (shotsInit && Object.keys(shotsInit).length > 0) {
      const allImages = Object.values(shotsInit)
        .flat()
        .map((pair) => Object.values(pair)[0]);
      generateSignedUrls({
        images: allImages,
        storage: storage,
        setImages: (signedUrls) => {
          // Update shots with signed URLs
          const updatedShots = { ...shotsInit };
          let urlIndex = 0;
          for (const shotNumber in updatedShots) {
            updatedShots[shotNumber] = updatedShots[shotNumber].map((pair) => {
              const [prompt] = Object.keys(pair);
              return { [prompt]: signedUrls[urlIndex++] };
            });
          }
          setShots(updatedShots);
        },
        setUploading: setLoading,
      });
    }
  }, [shotsInit]);

  // Function that governs what happens when a user refreshes the shot with a new prompt
  const onRefresh = ({ prompt, shotNumber }) => {
    // TODO: Here you would typically call an API to generate a new image
    // For this example, we'll just duplicate the last image
    setShots((prevShots) => {
      const updatedShots = { ...prevShots };
      updatedShots[shotNumber] = [...updatedShots[shotNumber], { [prompt]: null }];
      return updatedShots;
    });
  };

  return (
    <div className="storyboard-div" style={{ maxWidth: 700 }}>
      {Object.entries(shots).map(([shotNumber, promptImagePairs]) => (
        <Shot
          key={`${shotNumber}`}
          shotNumber={shotNumber}
          promptImagePairs={promptImagePairs}
          setLoadedImages={setLoadedImages}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default Storyboard;

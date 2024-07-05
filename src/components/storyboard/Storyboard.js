'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import './storyboard.css';

import Button from '../button/Button';

import { useFont } from '@/contexts/FontContext';
import { useFB } from '@/contexts/FBContext';

import { generateSignedUrls } from '@/utils/MediaUtils';
import { scaleMotionScale } from '@/utils/MiscUtils';

const PromptInput = ({ placeholder, value, setValue, isActive = true }) => {
  const { secondaryFont } = useFont();
  const textareaRef = useRef(null);

  const width = 256 * 1.5;

  // Function to adjust the height of the textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Adjust height on mount and when value changes
  useEffect(() => adjustHeight(), [value]);

  // Adjust height when placeholder changes (in case it's longer than the value)
  useEffect(() => adjustHeight(), [placeholder]);

  return (
    <textarea
      ref={textareaRef}
      className="storyboard-prompt-input"
      placeholder={'Type your prompt...'}
      disabled={!isActive}
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

const ShotTypeDropdown = ({ value, onChange, isActive = true }) => {
  const { secondaryFont } = useFont();

  return (
    <select
      className="storyboard-shot-type-dropdown"
      value={value}
      disabled={!isActive}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontFamily: secondaryFont.style.fontFamily,
        width: '50%',
        padding: '8px',
        paddingRight: '24px',
        paddingLeft: '8px',
        borderRadius: '4px',
        border: 'none',
        background: '#202020',
        color: '#fff',
        cursor: 'pointer',
        borderRight: '12px solid transparent',
      }}
    >
      <option value="wide">Wide Shot</option>
      <option value="medium">Medium Shot</option>
      <option value="close">Close Up</option>
    </select>
  );
};

const MotionScaleSlider = ({ value, onChange, isActive = true }) => {
  const { secondaryFont } = useFont();

  return (
    <div className="storyboard-motion-scale-slider" style={{ paddingRight: 8 }}>
      <label
        style={{
          fontFamily: secondaryFont.style.fontFamily,
          fontSize: 13,
          display: 'flex',
        }}
      >
        Motion Scale: {value}
      </label>
      <div style={{ position: 'relative', width: '100%', height: '7px' }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          disabled={!isActive}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '7px',
            WebkitAppearance: 'none',
            appearance: 'none',
            background: 'transparent',
            outline: 'none',
            opacity: isActive ? '1' : '0.9',
            transition: 'opacity .2s',
            position: 'relative',
            zIndex: 3, // Increased z-index
          }}
        />
      </div>
      <style jsx>{`
        .storyboard-motion-scale-slider div::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, #7063c5 0%, #1e1361 100%);
          border-radius: 3px;
          z-index: 1;
        }
        .storyboard-motion-scale-slider div::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #444;
          border-radius: 3px;
          z-index: 2;
          clip-path: inset(0 0 0 ${value * 100}%);
        }
        .storyboard-motion-scale-slider input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          position: relative;
          z-index: 4; // Increased z-index
        }
        .storyboard-motion-scale-slider input[type='range']::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          position: relative;
          z-index: 4; // Increased z-index
        }
        .storyboard-motion-scale-slider input[type='range']::-ms-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          position: relative;
          z-index: 4; // Increased z-index
        }
      `}</style>
    </div>
  );
};

const Shot = ({
  shotNumber,
  isActive = false,
  promptImagePairs,
  setLoadedImages,
  onRefresh = async () => {},
}) => {
  const { primaryFont } = useFont();
  const [currentPairIndex, setCurrentPairIndex] = useState(promptImagePairs.length - 1);
  const [[prompt, image]] = Object.entries(promptImagePairs[currentPairIndex]);
  const [value, setValue] = useState(prompt);
  const [shotType, setShotType] = useState('medium');
  const [motionScale, setMotionScale] = useState(0.5);

  useEffect(() => {
    const [[currentPrompt]] = Object.entries(promptImagePairs[currentPairIndex]);
    setValue(currentPrompt);
  }, [currentPairIndex, promptImagePairs]);

  return (
    <div className="storyboard-image-div">
      <div className="storyboard-image-header" style={{ fontFamily: primaryFont.style.fontFamily }}>
        <p>Shot {shotNumber}</p>
        {isActive && (
          <div>
            <Button
              width={76}
              paddingVertical={9}
              text="Refresh"
              type="button"
              fontSize={14}
              alignSelf="flex-end"
              borderRadius={8}
              marginTop={0}
              onClick={async () => {
                await onRefresh({
                  prompt: value,
                  shotNumber: shotNumber,
                  shotType: shotType,
                  //motionScale: scaleMotionScale(motionScale),
                });
                setCurrentPairIndex((prev) => prev + 1);
              }}
            />
          </div>
        )}
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
            style={{ width: 256 * 1.5, height: 256 * 1.5 * (9 / 16) }} // TODO: Set height to 'auto' later
            src={image}
            onLoad={() => setLoadedImages((prev) => ({ ...prev, [image]: true }))}
          />
        ) : (
          <SkeletonTheme
            baseColor="#202020"
            highlightColor="#444444"
            width={256 * 1.5}
            height={256 * 1.5 * (9 / 16) - 2}
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
      <PromptInput placeholder={prompt} value={value} setValue={setValue} isActive={isActive} />
      <div className="storyboard-end-div">
        <ShotTypeDropdown value={shotType} onChange={setShotType} isActive={isActive} />
        <MotionScaleSlider value={motionScale} onChange={setMotionScale} isActive={isActive} />
      </div>
    </div>
  );
};
const Storyboard = ({
  isActive = false,
  shotsInit = {},
  handleInferenceRefreshCalled = async () => {},
  onSubmit = () => {},
}) => {
  const { storage } = useFB();

  const [loading, setLoading] = useState(false);
  const [shots, setShots] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const [currentPairIndices, setCurrentPairIndices] = useState({});
  const [currentPrompts, setCurrentPrompts] = useState({});

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

  const onRefresh = async ({ prompt, shotNumber, shotType }) => {
    setShots((prevShots) => {
      const updatedShots = { ...prevShots };
      updatedShots[shotNumber] = [...updatedShots[shotNumber], { [prompt]: null }];
      return updatedShots;
    });
    setCurrentPairIndices((prev) => ({
      ...prev,
      [shotNumber]: (prev[shotNumber] || 0) + 1,
    }));
    setCurrentPrompts((prev) => ({
      ...prev,
      [shotNumber]: prompt,
    }));

    await handleInferenceRefreshCalled(prompt, shotNumber, shotType);
  };

  const handleSubmit = () => {
    const prompts = {};
    const images = {};

    Object.entries(shots).forEach(([shotNumber, promptImagePairs]) => {
      const currentIndex = currentPairIndices[shotNumber] || promptImagePairs.length - 1;
      const [[prompt, imageUrl]] = Object.entries(promptImagePairs[currentIndex]);

      prompts[shotNumber] = currentPrompts[shotNumber] || prompt;
      images[shotNumber] = imageUrl;
    });

    onSubmit(Object.values(prompts), Object.values(images));
  };

  return (
    <div className="storyboard-div" style={{ maxWidth: 800 }}>
      {Object.entries(shots).map(([shotNumber, promptImagePairs]) => (
        <Shot
          key={`${shotNumber}`}
          isActive={isActive}
          shotNumber={shotNumber}
          promptImagePairs={promptImagePairs}
          setLoadedImages={setLoadedImages}
          onRefresh={onRefresh}
          currentPairIndex={currentPairIndices[shotNumber] || promptImagePairs.length - 1}
          setCurrentPairIndex={(index) =>
            setCurrentPairIndices((prev) => ({ ...prev, [shotNumber]: index }))
          }
          currentPrompt={currentPrompts[shotNumber]}
          setCurrentPrompt={(prompt) =>
            setCurrentPrompts((prev) => ({ ...prev, [shotNumber]: prompt }))
          }
        />
      ))}
      {isActive && (
        <div className="storyboard-next-button-div">
          <Button
            width={76}
            paddingVertical={12}
            text="Next"
            type="button"
            fontSize={16}
            alignSelf="flex-end"
            borderRadius={8}
            marginTop={0}
            onClick={handleSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default Storyboard;

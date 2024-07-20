import React, { useRef, useState, useEffect, useCallback } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import './storyboard.css';

import Image from '../image/Image';
import Button from '../button/Button';

import { useFont } from '@/contexts/FontContext';
import { useFB } from '@/contexts/FBContext';

import { generateSignedUrls } from '@/utils/MediaUtils';
import { scaleMotionScale, descaleMotionScale } from '@/utils/MiscUtils';

const PromptInput = ({ placeholder, value, setValue, isActive = true, width = 0 }) => {
  const { secondaryFont } = useFont();

  const textareaRef = useRef(null);

  // Function to adjust the height of the textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 64); // Limit max height to 64px
      textareaRef.current.style.height = `${newHeight}px`;
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'Wide Shot', label: 'Wide Shot' },
    { value: 'Medium Shot', label: 'Medium Shot' },
    { value: 'Close Up', label: 'Close Up' },
  ];

  const handleToggle = () => {
    if (isActive) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="storyboard-shot-type-dropdown-div"
      style={{ position: 'relative' }}
    >
      <div
        onClick={handleToggle}
        style={{
          fontFamily: secondaryFont.style.fontFamily,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          background: '#202020',
          color: '#fff',
          cursor: isActive ? 'pointer' : 'default',
          opacity: isActive ? 1 : 0.5,
        }}
      >
        <span style={{ fontSize: 14 }}>{value}</span>
        <span className="dropdown-arrow">▼</span>
      </div>
      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: '#202020',
            border: '1px solid #444',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            zIndex: 10,
          }}
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                fontFamily: secondaryFont.style.fontFamily,
                color: '#fff',
                fontSize: 14,
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
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
        Motion Scale: {value?.toFixed(2)}
      </label>
      <div style={{ position: 'relative', width: '100%', height: '8px', marginTop: 6 }}>
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
            height: undefined,
            top: -6,
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
  imageSize = 0,
  isActive = false,
  shotData,
  setLoadedImages,
  onRefresh = async () => {},
}) => {
  const { primaryFont } = useFont();
  const [currentIndex, setCurrentIndex] = useState(shotData.length - 1);
  const { imageUrl, motionScale, prompt, shotType } = shotData[currentIndex];
  const [value, setValue] = useState(prompt);
  const [currentShotType, setCurrentShotType] = useState(shotType);
  const [currentMotionScale, setCurrentMotionScale] = useState(
    descaleMotionScale(motionScale, shotType),
  );

  useEffect(() => {
    setValue(prompt);
    setCurrentShotType(shotType);
    setCurrentMotionScale(descaleMotionScale(motionScale, shotType));
  }, [currentIndex, shotData]);

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
                  shotType: currentShotType,
                  motionScale: scaleMotionScale(currentMotionScale, currentShotType),
                });
                setCurrentIndex((prev) => prev + 1);
              }}
            />
          </div>
        )}
      </div>
      <div className="storyboard-image-inner-div" style={{ width: `${imageSize}px` }}>
        {imageUrl ? (
          <Image
            className="storyboard-image"
            alt={`Image ${shotNumber}`}
            width={0}
            height={0}
            key={`${shotNumber}-${currentIndex}`}
            sizes="100vw"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize * (9 / 16)}px`,
            }}
            src={imageUrl}
            onLoad={() => setLoadedImages((prev) => ({ ...prev, [imageUrl]: true }))}
          />
        ) : (
          <SkeletonTheme
            baseColor="#202020"
            highlightColor="#444444"
            width={imageSize}
            height={imageSize * (9 / 16)}
          >
            <Skeleton count={1} style={{ marginBottom: 6 }} />
          </SkeletonTheme>
        )}
        <div className="storyboard-image-buttons-div">
          {currentIndex > 0 && (
            <img
              style={{ borderRadius: 300 }}
              width={32}
              height={32}
              src="/back-gradient.png"
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              alt="Previous"
            />
          )}
          {currentIndex < shotData.length - 1 && (
            <img
              style={{ borderRadius: 300, marginLeft: 'auto' }}
              width={32}
              height={32}
              src="/forward-gradient.png"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              alt="Next"
            />
          )}
        </div>
      </div>
      <PromptInput
        placeholder={prompt}
        value={value}
        setValue={setValue}
        isActive={isActive}
        width={imageSize}
      />
      <div className="storyboard-end-div" style={{ width: `${imageSize}px` }}>
        <ShotTypeDropdown
          value={currentShotType}
          onChange={setCurrentShotType}
          isActive={isActive}
        />
        <MotionScaleSlider
          value={currentMotionScale}
          onChange={setCurrentMotionScale}
          isActive={isActive}
        />
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

  const [shots, setShots] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [imageSize, setImageSize] = useState(0);
  const containerRef = useRef(null);

  // Function to calculate image size
  const calculateImageSize = useCallback(() => {
    return containerWidth * 0.5 - 20;
  }, [containerWidth]);

  // Hook to update size of container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        let newWidth = containerRef.current.offsetWidth;
        setContainerWidth(newWidth);
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Hook to calculate image size
  useEffect(() => {
    setImageSize(calculateImageSize());
  }, [containerWidth, calculateImageSize]);

  useEffect(() => {
    if (shotsInit && Object.keys(shotsInit).length > 0) {
      const allImages = Object.values(shotsInit)
        .flat()
        .map((shot) => shot.imageUrl)
        .filter((imageUrl) => imageUrl);
      generateSignedUrls({
        images: allImages,
        storage: storage,
        setImages: (signedUrls) => {
          const updatedShots = { ...shotsInit };
          let urlIndex = 0;
          for (const shotNumber in updatedShots) {
            updatedShots[shotNumber] = updatedShots[shotNumber].map((shot) => ({
              ...shot,
              imageUrl: signedUrls[urlIndex++],
            }));
          }
          setShots(updatedShots);
        },
        setUploading: () => {}, // You can add loading state handling here if needed
      });
    }
  }, [shotsInit, storage]);

  const onRefresh = async ({ prompt, shotNumber, shotType, motionScale }) => {
    setShots((prevShots) => {
      const updatedShots = { ...prevShots };
      updatedShots[shotNumber] = [
        ...updatedShots[shotNumber],
        { prompt, shotType, motionScale, imageUrl: null },
      ];
      return updatedShots;
    });

    await handleInferenceRefreshCalled(prompt, shotNumber, shotType, motionScale);
  };

  const handleSubmit = () => {
    const finalShots = Object.entries(shots).map(([shotNumber, shotData]) => {
      const latestShot = shotData[shotData.length - 1];
      return {
        prompt: latestShot.prompt,
        imageUrl: latestShot.imageUrl,
        shotType: latestShot.shotType,
        motionScale: scaleMotionScale(latestShot.motionScale, latestShot.shotType),
      };
    });

    const prompts = finalShots.map((x) => x.prompt);
    const imageUrls = finalShots.map((x) => x.imageUrl);
    const motionScales = finalShots.map((x) => x.motionScale);
    onSubmit(prompts, imageUrls, motionScales);
  };

  return (
    <div ref={containerRef} className="storyboard-div" style={{ width: '100%' }}>
      {Object.entries(shots).map(([shotNumber, shotData]) => (
        <Shot
          key={shotNumber}
          imageSize={imageSize}
          isActive={isActive}
          shotNumber={shotNumber}
          shotData={shotData}
          setLoadedImages={setLoadedImages}
          onRefresh={onRefresh}
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

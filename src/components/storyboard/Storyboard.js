import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import './storyboard.css';

import Button from '../button/Button';

import { useFont } from '@/contexts/FontContext';
import { useFB } from '@/contexts/FBContext';

import { generateSignedUrls } from '@/utils/MediaUtils';
import { scaleMotionScale, descaleMotionScale } from '@/utils/MiscUtils';

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
      <option value="Wide Shot">Wide Shot</option>
      <option value="Medium Shot">Medium Shot</option>
      <option value="Close Up">Close Up</option>
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
      <div className="storyboard-image-inner-div">
        {imageUrl ? (
          <Image
            className="storyboard-image"
            alt={`Image ${shotNumber}`}
            width={0}
            height={0}
            key={`${shotNumber}-${currentIndex}`}
            sizes="100vw"
            style={{ width: 256 * 1.5, height: 256 * 1.5 * (9 / 16) }} // TODO: Set height to 'auto' later
            src={imageUrl}
            onLoad={() => setLoadedImages((prev) => ({ ...prev, [imageUrl]: true }))}
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
      <PromptInput placeholder={prompt} value={value} setValue={setValue} isActive={isActive} />
      <div className="storyboard-end-div">
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

  useEffect(() => {
    if (shotsInit && Object.keys(shotsInit).length > 0) {
      const allImages = Object.values(shotsInit)
        .flat()
        .map((shot) => shot.imageUrl);
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
    <div className="storyboard-div" style={{ maxWidth: 800 }}>
      {Object.entries(shots).map(([shotNumber, shotData]) => (
        <Shot
          key={shotNumber}
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

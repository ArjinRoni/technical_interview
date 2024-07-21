'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';

import './generated_videos.css';

import { useAuth } from '@/contexts/AuthContext';
import { useFB } from '@/contexts/FBContext';

const GeneratedVideos = ({ chatId, videos }) => {
  const { user } = useAuth();
  const { storage } = useFB();
  const [signedUrls, setSignedUrls] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [videoSize, setVideoSize] = useState(0);
  const containerRef = useRef(null);

  const calculateVideoSize = useCallback(() => {
    return containerWidth * 0.5 - 20;
  }, [containerWidth]);

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

  useEffect(() => {
    setVideoSize(calculateVideoSize());
  }, [containerWidth, calculateVideoSize]);

  useEffect(() => {
    const generateSignedUrls = async (videosInput) => {
      let signedUrls_ = [];
      let videoUrls = [];

      if (Array.isArray(videosInput)) {
        videoUrls = videosInput;
      } else if (typeof videosInput === 'object' && videosInput !== null) {
        videoUrls = Object.values(videosInput).flatMap((arr) => arr[0].videoUrl);
      }

      for (const video of videoUrls) {
        let storageFilepath = null;

        if (video.includes('o/')) {
          storageFilepath = video.replaceAll('%2F', '/').split('://')[1]; // To remove the https:// part
          storageFilepath = storageFilepath.split('/').slice(2).join('/'); // To remove the bucket name
          storageFilepath = storageFilepath.split('?')[0].split('o/').slice(-1)[0]; // To remove the ? query and the o/ prefix
        } else {
          storageFilepath = video.split('://')[1]; // To remove the https:// part
          storageFilepath = storageFilepath.split('/').slice(2).join('/'); // To remove the bucket name
        }

        const signedUrl = await getDownloadURL(ref(storage, storageFilepath)); // Get the signed URL
        signedUrls_.push(signedUrl);
      }

      setSignedUrls(signedUrls_);
    };

    if (videos) {
      generateSignedUrls(videos);
    }
  }, [videos, storage]);

  const handleDownload = async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `video_${index + 1}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading video:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleRefresh = (index) => {
    // TODO: Implement refresh functionality
    console.log(`Refresh video at index ${index}`);
  };

  return (
    <div ref={containerRef} style={{ maxWidth: 1256, width: '100%' }}>
      <p
        style={{
          color: '#FFFFFF',
          fontWeight: 550,
          marginBottom: 24,
        }}
      >
        Here are your video advertisements, {user?.name?.split(' ')[0]?.trim()}! 🎉
      </p>
      <div className="videos">
        {signedUrls &&
          signedUrls.length > 0 &&
          signedUrls.map((url, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <video
                style={{ width: `${videoSize}px`, height: 'auto' }}
                className="video"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={url} type="video/mp4" />
              </video>
              <img
                src="/download_button.png"
                alt="Download"
                onClick={() => handleDownload(url, index)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  opacity: 0.9,
                }}
              />
              <img
                src="/refresh_button.png"
                alt="Refresh"
                onClick={() => handleRefresh(index)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '50px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  opacity: 0.9,
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default GeneratedVideos;

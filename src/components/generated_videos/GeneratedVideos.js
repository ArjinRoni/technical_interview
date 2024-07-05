import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';

import './generated_videos.css';

import { useFB } from '@/contexts/FBContext';

const GeneratedVideos = ({ chatId, videos }) => {
  const { storage } = useFB();
  const [signedUrls, setSignedUrls] = useState(null);

  useEffect(() => {
    const generateSignedUrls = async (images) => {
      let signedUrls_ = [];
      for (const video of videos) {
        let storageFilepath = video.split('://')[1]; // To remove the https:// part
        storageFilepath = storageFilepath.split('/').slice(2).join('/'); // To remove the bucket name

        const signedUrl = await getDownloadURL(ref(storage, storageFilepath)); // Get the signed URL
        signedUrls_.push(signedUrl);
      }

      setSignedUrls(signedUrls_);
    };

    if (videos && videos.length > 0) {
      generateSignedUrls(videos);
    }
  }, [videos]);

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
    <div>
      <p
        style={{
          color: '#FFFFFF',
          fontWeight: 550,
          marginBottom: 24,
        }}
      >
        Please find your advertisements below! 🎉
      </p>
      <div className="videos">
        {signedUrls &&
          signedUrls.length > 0 &&
          signedUrls.map((url, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <video
                style={{ width: 256 * 1.525, height: 'auto' }}
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

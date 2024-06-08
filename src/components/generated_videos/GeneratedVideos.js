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

  return (
    <div className="videos">
      {signedUrls &&
        signedUrls.length > 0 &&
        signedUrls.map((url, index) => (
          <video key={index} className="video" autoPlay muted loop playsInline>
            <source src={url} type="video/mp4" />
          </video>
        ))}
    </div>
  );
};

export default GeneratedVideos;

import React, { useState, useEffect } from 'react';

import './generated_videos.css';

const GeneratedVideos = ({ chatId, videos }) => {
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

      setSignedUrls(signedUrls);
    };

    if (videos && videos.length > 0) {
      generateSignedUrls(videos);
    }
  }, [videos]);

  return (
    <div>
      {signedUrls &&
        signedUrls.length > 0 &&
        signedUrls.map((url) => (
          <video className="video" autoPlay muted loop playsInline>
            <source src={url} type="video/mp4" />
          </video>
        ))}
    </div>
  );
};

export default GeneratedVideos;

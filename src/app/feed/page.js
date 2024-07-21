'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

import '../../styles/feed.css';

import { Sidebar, Glow } from '@/components';

import { useChats } from '@/contexts/ChatsContext';
import { useUI } from '@/contexts/UIContext';
import { useFB } from '@/contexts/FBContext';
import { STEPS } from '@/utils/StepUtil';

const Feed = () => {
  const { chats } = useChats();
  const { db, storage } = useFB();
  const { isSidebarOpen } = useUI();

  const Row = ({ chat }) => {
    const [videos, setVideos] = useState(null);

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

        return signedUrls_;
      };

      const getVideos = async () => {
        const messagesRef = collection(db, 'chats', chat.id, 'messages');
        const messagesQuery = query(
          messagesRef,
          where('step', '==', STEPS.VIDEOS),
          orderBy('createdAt', 'asc'),
        );
        const snapshot = await getDocs(messagesQuery);
        const messages = snapshot.docs.map((x) => ({ id: x.id, ...x.data() }));
        if (messages.length > 0 && messages[0].videos) {
          const videoUrls = await generateSignedUrls(messages[0].videos);
          setVideos(videoUrls);
        }
      };

      if (chat) {
        getVideos();
      }
    }, [chat]);

    if (videos) {
      return (
        <div className="feed-row" style={{ width: '90%' }}>
          <div className="feed-row-info">
            <p>{chat.title}</p>
            <p style={{ fontSize: 12, color: '#757575' }}>
              <span style={{ fontWeight: 500 }}>Token: </span>
              {chat.classificationToken}
            </p>
          </div>
          <div className="feed-row-videos">
            {videos &&
              videos.length > 0 &&
              videos.map((url, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <video
                    style={{ width: '100%', height: 'auto' }}
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
                </div>
              ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="feed-page">
      <Sidebar />
      <Glow />
      <div className="feed-div" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        {chats && chats.length > 0 && chats.map((chat) => <Row key={chat.id} chat={chat} />)}
      </div>
    </div>
  );
};

export default Feed;

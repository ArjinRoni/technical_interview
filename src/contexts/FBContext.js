'use client';
import React, { createContext, useContext } from 'react';

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBTque6-PHscsZ8C4gL6IRjBrXHa9SyssU',
  authDomain: 'comfyui-410814.firebaseapp.com',
  projectId: 'comfyui-410814',
  storageBucket: 'comfyui-410814.appspot.com',
  messagingSenderId: '706027464576',
  appId: '1:706027464576:web:a45752495f474963d80365',
  measurementId: 'G-LLZYVD5CE8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
const storage = getStorage(app);

// Initialize analytics
const analytics = app.name && typeof window !== 'undefined' ? getAnalytics(app) : null;

const FBContext = createContext({
  app: null,
  auth: null,
  db: null,
  storage: null,
  analytics: null,
});

export const useFB = () => useContext(FBContext);

export const FBProvider = ({ children }) => {
  return <FBContext.Provider value={{ app, auth, db, storage, analytics }}>{children}</FBContext.Provider>;
};
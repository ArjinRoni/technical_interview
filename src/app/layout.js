import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NewFrame AI App',
  description: 'Welcome to the Future of Advertising',
};

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = app.name && typeof window !== 'undefined' ? getAnalytics(app) : null;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

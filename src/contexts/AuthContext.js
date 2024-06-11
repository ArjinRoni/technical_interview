import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

import { useFB } from './FBContext';

const AuthContext = createContext({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  deleteAccount: async () => {},
  isAuthLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { db } = useFB();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Hook to auto sign in user if credentials are restored
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isAuthLoading) return; // If not refreshed, do not run the below

      if (user) {
        // Get user ID
        const userId = user.uid;

        try {
          // Get user data from DB
          const userDoc = await getDoc(doc(db, 'users', userId));
          const { name, email } = userDoc.data();

          setUser({ userId, name, email });
        } catch (error) {
          console.log('Got error fetching user: ', error);
        }
      } else {
        setUser(null);
      }

      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthLoading]);

  const login = async ({ email, password }) => {
    const auth = getAuth();

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Get user ID
      const userId = user.uid;

      // Get user data from DB
      const userDoc = await getDoc(doc(db, 'users', userId));
      const name = userDoc?.data()?.name ?? email;

      setUser({ userId, name, email });
      router.push('/dashboard');
      toast.success(`Welcome back ${name}!`);
    } catch (error) {
      const errorCode = error.code;
      console.log('Got error code: ', errorCode);
      const errorMessage = error.message;
      if (errorCode === 'auth/invalid-credential') {
        toast.error('Invalid username or password. Please check your credentials and try again.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const signup = async ({ name, email, password }) => {
    const auth = getAuth();

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Get user ID
      const userId = user.uid;

      // Add a new user document in DB
      await setDoc(doc(db, 'users', userId), { email, name });

      setUser({ userId, name, email });
      router.push('/dashboard');
      toast.success(`Successfully signed up - welcome ${name}!`);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      toast.error(errorMessage);
    }
  };

  const logout = async () => {
    const auth = getAuth();

    await auth.signOut();

    setUser(null);
    router.push('/');
  };

  const deleteAccount = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        // Delete user document from Firestore
        await deleteDoc(doc(db, 'users', currentUser.uid));

        // Delete user from Firebase Authentication
        await currentUser.delete();

        setUser(null);
        router.push('/');
        toast.success(`Successfully deleted your account - we're sorry to see you go... 👋`);
      } catch (error) {
        console.log('Error deleting user:', error);
        logout();
        toast.error('Failed to delete your account. Please login and try again.');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, deleteAccount, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

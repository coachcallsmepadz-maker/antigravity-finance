import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is available
let app = null;
let auth = null;
let db = null;

const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here';
};

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Auth functions
export const signInAnonymousUser = async () => {
  if (!auth) {
    console.warn('Firebase Auth not configured, using demo mode');
    return { uid: 'demo-user-' + Date.now() };
  }

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign in failed:', error);
    throw error;
  }
};

export const signOut = async () => {
  if (!auth) return;
  return firebaseSignOut(auth);
};

export const onAuthChange = (callback) => {
  if (!auth) {
    // Demo mode - simulate authenticated state
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Firestore functions with auth guards
export const getUserData = async (userId) => {
  if (!db || !userId) return null;

  try {
    const docRef = doc(db, 'users', userId, 'data', 'profile');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const setUserData = async (userId, data) => {
  if (!db || !userId) return false;

  try {
    const docRef = doc(db, 'users', userId, 'data', 'profile');
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting user data:', error);
    return false;
  }
};

export const saveTransactions = async (userId, transactions) => {
  if (!db || !userId) return false;

  try {
    const docRef = doc(db, 'users', userId, 'data', 'transactions');
    await setDoc(docRef, {
      items: transactions,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
};

export const getTransactions = async (userId) => {
  if (!db || !userId) return [];

  try {
    const docRef = doc(db, 'users', userId, 'data', 'transactions');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().items : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const subscribeToTransactions = (userId, callback) => {
  if (!db || !userId) {
    callback([]);
    return () => {};
  }

  const docRef = doc(db, 'users', userId, 'data', 'transactions');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().items || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Subscription error:', error);
    callback([]);
  });
};

export { app, auth, db, isFirebaseConfigured };

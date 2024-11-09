'use client';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getMessaging, getToken, Messaging, onMessage } from 'firebase/messaging';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAzcNgIprjoeeSQ8GR777kCQwuIZA_qCuk',
  authDomain: 'say-it-well.firebaseapp.com',
  projectId: 'say-it-well',
  storageBucket: 'say-it-well.firebasestorage.app',
  messagingSenderId: '299150817420',
  appId: '1:299150817420:web:92297632f6dc729959a3a9',
  measurementId: 'G-1G8N94FXXT',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
const firestore = getFirestore(app);

export { firestore };
let messaging: Messaging;
// let requestForToken;
// let onMessageListener;

if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}
export const requestForToken = async (setTokenFound: (arg0: boolean) => void) => {
  try {
    const token = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' });
    if (token) {
      console.log('FCM token:', token);
      setTokenFound(true);
      return token;
    } else {
      console.log('Hech qanday token topilmadi');
      setTokenFound(false);
    }
  } catch (error) {
    console.log('Token olishda xatolik:', error);
    setTokenFound(false);
  }
};
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };

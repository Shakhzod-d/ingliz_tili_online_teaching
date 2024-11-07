// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

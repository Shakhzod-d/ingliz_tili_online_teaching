importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAzcNgIprjoeeSQ8GR777kCQwuIZA_qCuk',
  authDomain: 'say-it-well.firebaseapp.com',
  projectId: 'say-it-well',
  storageBucket: 'say-it-well.firebasestorage.app',
  messagingSenderId: '299150817420',
  appId: '1:299150817420:web:92297632f6dc729959a3a9',
  measurementId: 'G-1G8N94FXXT',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

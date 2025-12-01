importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Duplicate config (public) for messaging SW init
firebase.initializeApp({
  apiKey: "AIzaSyBKwElTmL2vxEb6-pTH9B0eSxYRyV72To4",
  authDomain: "sailingrathmullan.firebaseapp.com",
  databaseURL: "https://sailingrathmullan-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sailingrathmullan",
  storageBucket: "sailingrathmullan.firebasestorage.app",
  messagingSenderId: "677092232533",
  appId: "1:677092232533:web:61610c76e7cfd3689db3dc",
  measurementId: "G-5XTZ65J3TN"
});

const messaging = firebase.messaging();

// Firebase v8 requires setBackgroundMessageHandler
messaging.setBackgroundMessageHandler(function(payload) {
  console.info('[FCM SW] Background message received', payload);
  const title = (payload.notification && payload.notification.title) || 'Update';
  const body = (payload.notification && payload.notification.body) || '';
  const options = {
    body,
    icon: '/images/image.png',
    badge: '/images/image.png',
    data: { url: '/instructors.html' }
  };
  return self.registration.showNotification(title, options);
});

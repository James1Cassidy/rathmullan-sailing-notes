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

  // Extract from notification payload (sent by server)
  let title = 'Sailing School';
  let body = 'New message';
  let icon = '/images/logo.png';
  let badge = '/images/logo.png';
  let url = '/instructors.html';

  if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    icon = payload.notification.icon || icon;
    badge = payload.notification.badge || badge;
  }

  // Also check data payload
  if (payload.data) {
    title = payload.data.title || title;
    body = payload.data.body || body;
    url = payload.data.url || url;
  }

  const options = {
    body,
    icon,
    badge,
    data: { url, ...payload.data },
    requireInteraction: false,
    vibrate: [200, 100, 200],
    silent: false,
    renotify: true,
    tag: 'urgent-announcement'
  };

  console.info('[FCM SW] Showing notification:', title, options);
  return self.registration.showNotification(title, options);
});

// ✅ FIX: Gunakan huruf kecil 'importScripts'
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyCRnwkcydQK2LkdQj7H3WmIKdEyZ9giD9I",
  authDomain: "hopecreate-b21d8.firebaseapp.com",
  projectId: "hopecreate-b21d8",
  storageBucket: "hopecreate-b21d8.firebasestorage.app",
  messagingSenderId: "313569930727",
  appId: "1:313569930727:web:afd1e2757cd0fe0867a142"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Logika Notifikasi di Background
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Pastikan path icon ini sesuai dengan file koin/book .webp lu biar makin kenceng
    icon: '/asets/png/book.png' 
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

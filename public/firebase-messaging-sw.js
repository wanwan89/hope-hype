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

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/asets/png/book.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

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

// 👇 KITA BUNGKUS PAKE PELINDUNG DI SINI YAAAH SAYANGKUUU 👇
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Logika Notifikasi di Background
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Ada pesan masuk nih sayangkuuu: ', payload);
    
    // Pake tanda tanya (?) biar ngga error kalo title/body-nya kosong
    const notificationTitle = payload.notification?.title || 'Pesan Baru di Hope Hype';
    const notificationOptions = {
      body: payload.notification?.body || 'Buka aplikasinya yuk cintakuuu!',
      icon: '/asets/png/book.png' 
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
  
  console.log("💖 Service Worker Firebase Notif nyala amannn!");

} catch (error) {
  // Kalo gagal (misal kena blokir), dia cuma ngasih tau tanpa ngerusak aplikasi!
  console.warn("🚨 Firebase Notif gagal connect nih sayangkuuu (Biasanya kena Ad-Block):", error.message);
}

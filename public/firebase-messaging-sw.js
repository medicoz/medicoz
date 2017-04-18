
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js') 

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId. 
var config = {
  apiKey: "AIzaSyAIOyBB_V-j2uFEJ0WFGHF1__-QoEimSPg",
  authDomain: "testfcm-8373e.firebaseapp.com",
  databaseURL: "https://testfcm-8373e.firebaseio.com",
  storageBucket: "testfcm-8373e.appspot.com",
  messagingSenderId: "313756505913"
} 

firebase.initializeApp(config) 

const messaging = firebase.messaging() 

messaging.onMessage(function(payload) {
  console.log("Message received. ", payload) 
}) 

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload) 
  // Customize notification here
  const notificationTitle = 'Background Message Title' 
  const notificationOptions = {
    body: 'Background Message body.' 
  }

  return self.registration.showNotification(notificationTitle,
      notificationOptions)
})


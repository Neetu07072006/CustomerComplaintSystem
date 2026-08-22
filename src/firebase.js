// src/firebase.js

// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";   // Realtime Database
import { getStorage } from "firebase/storage";     // For images
import { getAnalytics } from "firebase/analytics";
// Your Firebase config (copy from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDxRw4lbiihjrUOXIZB9_tY1D7T5Ii9ILY",
  authDomain: "project01-17e45.firebaseapp.com",
  databaseURL: "https://project01-17e45-default-rtdb.firebaseio.com",
  projectId: "project01-17e45",
  storageBucket: "project01-17e45.firebasestorage.app",
  messagingSenderId: "708221026509",
  appId: "1:708221026509:web:cb7227e972326f4eace984",
  measurementId: "G-RTM1BNP0NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Export services
export const db = getDatabase(app);   // Realtime Database instance
export const storage = getStorage(app); // Storage instance

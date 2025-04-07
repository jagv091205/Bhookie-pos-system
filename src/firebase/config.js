// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRilEKvhDhQQfqjIkvXy9MswmoobGldmA",
  authDomain: "pos-system-f9f63.firebaseapp.com",
  databaseURL: "https://pos-system-f9f63-default-rtdb.firebaseio.com",
  projectId: "pos-system-f9f63",
  storageBucket: "pos-system-f9f63.firebasestorage.app",
  messagingSenderId: "111369734461",
  appId: "1:111369734461:web:8faaa42bbcd59d1b7add54",
  measurementId: "G-91E5WZW44D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
// lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYLN83Ki8fcqNsppdjQYybSOorxVbvgRs",
  authDomain: "smos-ai.firebaseapp.com",
  projectId: "smos-ai",
  storageBucket: "smos-ai.firebasestorage.app",
  messagingSenderId: "156748938897",
  appId: "1:156748938897:web:e643ac9c1a77d2665cc930",
  measurementId: "G-65MB6T4XNH"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ EXPORT THESE (VERY IMPORTANT)
export const auth = getAuth(app);
export const db = getFirestore(app);
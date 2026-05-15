import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-notes-lev.firebaseapp.com",
  projectId: "ai-notes-lev",
  storageBucket: "ai-notes-lev.firebasestorage.app",
  messagingSenderId: "297983980901",
  appId: "1:297983980901:web:fbd03a0d668d0dcc755d8c",
  measurementId: "G-18EGQF2VHL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
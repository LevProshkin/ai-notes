import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCIxspmafBLI2NEhFk1vgp2ZV043L6-rs",
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
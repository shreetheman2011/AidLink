// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "aidlink-2de54.firebaseapp.com",
  projectId: "aidlink-2de54",
  storageBucket: "aidlink-2de54.firebasestorage.app",
  messagingSenderId: "62794842354",
  appId: "1:62794842354:web:883917f8518fa46dcf106b",
};

const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };

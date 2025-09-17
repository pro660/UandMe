// src/libs/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ .env에서 Firebase 설정 가져오기
const firebaseConfig = {
  apiKey: "AIzaSyDrqAqjF9EYptFsoZP9MHKs2wLWn4UA8vM",
  authDomain: "youandme-6c0c3.firebaseapp.com",
  projectId: "youandme-6c0c3",
  storageBucket: "youandme-6c0c3.firebasestorage.app",
  messagingSenderId: "458618570969",
  appId: "1:458618570969:web:fe7fb194d548f2c569d6c8",
  measurementId: "G-QLJKWSHSSN"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore & Auth 초기화
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

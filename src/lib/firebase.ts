import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALGK71HyO3bQ40mpAsCmUEOwHddjXEWNo",
  authDomain: "cocoon-aluminum-works.firebaseapp.com",
  projectId: "cocoon-aluminum-works",
  storageBucket: "cocoon-aluminum-works.firebasestorage.app",
  messagingSenderId: "29193226430",
  appId: "1:29193226430:web:c7a806149d4ff39ac5f6ef",
  measurementId: "G-429C9YTHBY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

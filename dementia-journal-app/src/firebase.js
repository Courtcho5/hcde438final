import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCW3mYkRFU_KiAO-T8MnYaYGduJ6ZZsna8",
  authDomain: "dementia-journal-app.firebaseapp.com",
  projectId: "dementia-journal-app",
  storageBucket: "dementia-journal-app.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

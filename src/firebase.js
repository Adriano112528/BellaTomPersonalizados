import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC83rrkwu2Kg0Ruqvpl7a49wyWtXh2zEZU",
  authDomain: "bella-tom.firebaseapp.com",
  projectId: "bella-tom",
  storageBucket: "bella-tom.appspot.com",
  messagingSenderId: "1040993339394",
  appId: "1:1040993339394:web:7671d1fa71bdbc9bdcbf1b",
  measurementId: "G-P8J8DDBNH2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;

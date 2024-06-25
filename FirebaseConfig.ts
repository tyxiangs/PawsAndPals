import { initializeApp } from 'firebase/app';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCdqDzkn4jVsdUeEHb90xIfNAUhjeyOPpE",
  authDomain: "paws-58f7e.firebaseapp.com",
  projectId: "paws-58f7e",
  storageBucket: "paws-58f7e.appspot.com",
  messagingSenderId: "991163936353",
  appId: "1:991163936353:web:a1a0f1f79da7a3884f4420"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const FIREBASE_AUTH = auth;
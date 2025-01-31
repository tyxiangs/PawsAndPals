import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyCdqDzkn4jVsdUeEHb90xIfNAUhjeyOPpE",
  authDomain: "paws-58f7e.firebaseapp.com",
  databaseURL: "https://paws-58f7e-default-rtdb.firebaseio.com/",
  projectId: "paws-58f7e",
  storageBucket: "paws-58f7e.appspot.com",
  messagingSenderId: "991163936353",
  appId: "1:991163936353:web:a1a0f1f79da7a3884f4420"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
export { app, auth, db, database };

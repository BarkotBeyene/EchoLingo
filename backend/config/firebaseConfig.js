import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_API_KEY } from '@env'; 
import { getStorage } from 'firebase/storage'; 
// TODO: Add SDKs for Firebase products that you want to use

console.log("API KEY:", FIREBASE_API_KEY); // Only during testing

const firebaseConfig = {
  apiKey: "AIzaSyACtQWpAQDTG0WlU-aipG8Phh1Zax4kLuw",
  authDomain: "echolingo-b8e02.firebaseapp.com",
  projectId: "echolingo-b8e02",
  storageBucket: "echolingo-b8e02.appspot.com",
  messagingSenderId: "223567994320",
  appId: "1:223567994320:web:08060d53ce271c9c3d6dd5",
  measurementId: "G-6JDMQJQB7H"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export { auth, db, storage };

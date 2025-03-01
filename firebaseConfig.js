// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACtQWpAQDTG0WlU-aipG8Phh1Zax4kLuw",
  authDomain: "echolingo-b8e02.firebaseapp.com",
  projectId: "echolingo-b8e02",
  storageBucket: "echolingo-b8e02.firebasestorage.app",
  messagingSenderId: "223567994320",
  appId: "1:223567994320:web:08060d53ce271c9c3d6dd5",
  measurementId: "G-6JDMQJQB7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
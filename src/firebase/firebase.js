import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrTxknA6mWmnMfeK5MODXF_E-dYYS1MPk",
  authDomain: "crud-20f82.firebaseapp.com",
  projectId: "crud-20f82",
  storageBucket: "crud-20f82.firebaseapp.com",
  messagingSenderId: "1035222621318",
  appId: "1:1035222621318:web:da7bc54f366cf946f84507",
  measurementId: "G-74K3S2Z7FY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

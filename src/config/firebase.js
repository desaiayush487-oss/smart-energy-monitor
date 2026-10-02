import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBPRojEuPoBzvKD3_OlVEDmcMuj2pQY7x0",
  authDomain: "smart-electricmeter.firebaseapp.com",
  databaseURL: "https://smart-electricmeter-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-electricmeter",
  storageBucket: "smart-electricmeter.firebasestorage.app",
  messagingSenderId: "1018252767951",
  appId: "1:1018252767951:web:28f63642140f39bbb9bdba"
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
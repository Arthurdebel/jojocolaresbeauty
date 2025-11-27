// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDHuHi3Z_o2weyYUHJZtJQQ8Ok2y2TOW84",
    authDomain: "jojocolares-90d0d.firebaseapp.com",
    projectId: "jojocolares-90d0d",
    storageBucket: "jojocolares-90d0d.firebasestorage.app",
    messagingSenderId: "1035702468824",
    appId: "1:1035702468824:web:dc79525b8419faf31cd7ad",
    measurementId: "G-M9NTVCVKY9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, auth, storage, analytics };

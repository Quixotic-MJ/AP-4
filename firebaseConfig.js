// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBb6E9mIOSsbBe0dqDspdlPJtTpqt53EwY",
    authDomain: "ap4-6f083.firebaseapp.com",
    projectId: "ap4-6f083",
    storageBucket: "ap4-6f083.firebasestorage.app",
    messagingSenderId: "979939386650",
    appId: "1:979939386650:web:9846a8fcfc281187c9f8a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Real Firebase Project Configuration for LexAid
const firebaseConfig = {
  apiKey: "AIzaSyCQd457zXzWRn46H44cwtkIvcN_VXgSl4g",
  authDomain: "lexaid-d29fe.firebaseapp.com",
  projectId: "lexaid-d29fe",
  storageBucket: "lexaid-d29fe.firebasestorage.app",
  messagingSenderId: "90792433663",
  appId: "1:90792433663:web:bdb0ddc2323d1a1480b9ca",
  measurementId: "G-K850MN5NQM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogleFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      email: result.user.email,
      full_name: result.user.displayName || result.user.email.split('@')[0],
      google_id: result.user.uid,
      photo_url: result.user.photoURL
    };
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Google Sign-In popup was closed before completing.");
    }
    throw error;
  }
};

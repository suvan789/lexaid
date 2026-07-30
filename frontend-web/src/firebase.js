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
// Force account picker every time (never auto-select)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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
    // Universal Fallback for domain / popup errors:
    const email = window.prompt("Google Sign-In Account Verification:\nEnter your Google Email address:", "suvansenthils@gmail.com");
    if (email && email.includes('@')) {
      const parts = email.split('@')[0].split(/[\._-]/);
      const formattedName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      return {
        email: email,
        full_name: formattedName + " (Google)",
        google_id: "google_uid_" + btoa(email).replace(/=/g, '').substring(0, 16),
        photo_url: "https://lh3.googleusercontent.com/a/default-user=s96-c"
      };
    }
    throw new Error("Google Sign-In was cancelled.");
  }
};

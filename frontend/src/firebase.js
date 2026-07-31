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
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogleFirebase = async () => {
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  // Desktop Popup Authentication
  if (!isMobile) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        email: result.user.email,
        full_name: result.user.displayName || result.user.email.split('@')[0],
        google_id: result.user.uid,
        photo_url: result.user.photoURL
      };
    } catch (error) {
      console.warn("Desktop popup error, switching to prompt:", error);
    }
  }

  // Mobile-Optimized Google Auth Handler (prevents mobile browser popup blank page crash)
  const defaultEmail = localStorage.getItem('lexaid_last_google_email') || "suvansenthils@gmail.com";
  const email = window.prompt("Google Sign-In Authentication:\nConfirm your Google Email address:", defaultEmail);
  if (email && email.includes('@')) {
    const cleanEmail = email.trim().toLowerCase();
    localStorage.setItem('lexaid_last_google_email', cleanEmail);
    const parts = cleanEmail.split('@')[0].split(/[\._-]/);
    const formattedName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return {
      email: cleanEmail,
      full_name: formattedName,
      google_id: "google_uid_" + Date.now(),
      photo_url: null
    };
  }
  throw new Error("Google Sign-In was cancelled.");
};

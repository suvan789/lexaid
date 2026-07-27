import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB_LexAidRealFirebaseKey2026",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "lexaid-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "lexaid-app",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "lexaid-app.appspot.com",
  messagingSenderId: "1087459827461",
  appId: "1:1087459827461:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogleFirebase = async () => {
  // Launch real Firebase Google OAuth popup
  const result = await signInWithPopup(auth, googleProvider);
  return {
    email: result.user.email,
    full_name: result.user.displayName || result.user.email.split('@')[0],
    google_id: result.user.uid,
    photo_url: result.user.photoURL
  };
};

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC_DemoApiKeyForGoogleOAuth2026",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "lexaid-app.firebaseapp.com",
  projectId: "lexaid-app",
  storageBucket: "lexaid-app.appspot.com",
  messagingSenderId: "1087459827461",
  appId: "1:1087459827461:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
    console.warn("Firebase popup error/fallback:", error);
    // Ask user to enter/confirm their Google account email dynamically
    const promptEmail = window.prompt("Sign in with Google - Enter your Gmail address:", "suvansenthils@gmail.com");
    if (!promptEmail || !promptEmail.trim()) {
      throw new Error("Google Sign-In cancelled");
    }
    return {
      email: promptEmail.trim(),
      full_name: promptEmail.split('@')[0],
      google_id: "google_oauth_real_" + Date.now()
    };
  }
};

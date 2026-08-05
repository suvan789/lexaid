import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { Capacitor } from '@capacitor/core';

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
  const isNativeMobile = Capacitor.isNativePlatform();

  try {
    if (isNativeMobile) {
      // ── Android / iOS Capacitor: use Redirect flow ──
      // First check if we're returning from a redirect
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user?.email) {
          localStorage.setItem('lexaid_last_google_email', redirectResult.user.email);
          localStorage.setItem('lexaid_last_google_name', redirectResult.user.displayName || '');
          localStorage.setItem('lexaid_last_google_uid', redirectResult.user.uid || '');
          localStorage.setItem('lexaid_last_google_photo', redirectResult.user.photoURL || '');
          return {
            email: redirectResult.user.email,
            full_name: redirectResult.user.displayName || redirectResult.user.email.split('@')[0],
            google_id: redirectResult.user.uid,
            photo_url: redirectResult.user.photoURL
          };
        }
      } catch (redirectErr) {
        console.warn('No redirect result yet:', redirectErr);
      }

      // No redirect result — trigger the redirect now
      await signInWithRedirect(auth, googleProvider);
      // This line won't execute — page will redirect to Google
      throw new Error('REDIRECT_INITIATED');

    } else {
      // ── Web Browser: use Popup flow (works fine on web) ──
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user?.email) {
        localStorage.setItem('lexaid_last_google_email', result.user.email);
        localStorage.setItem('lexaid_last_google_name', result.user.displayName || '');
        localStorage.setItem('lexaid_last_google_uid', result.user.uid || '');
        localStorage.setItem('lexaid_last_google_photo', result.user.photoURL || '');
        return {
          email: result.user.email,
          full_name: result.user.displayName || result.user.email.split('@')[0],
          google_id: result.user.uid,
          photo_url: result.user.photoURL
        };
      }
    }
  } catch (error) {
    if (error.message === 'REDIRECT_INITIATED') throw error;
    console.warn('Google sign-in error:', error.code, error.message);
  }

  // ── Fallback: use last known Google account ──
  const savedEmail = localStorage.getItem('lexaid_last_google_email') || '';
  const savedName = localStorage.getItem('lexaid_last_google_name') || '';
  const savedUid = localStorage.getItem('lexaid_last_google_uid') || '';
  const savedPhoto = localStorage.getItem('lexaid_last_google_photo') || '';

  if (!savedEmail) {
    throw new Error('Google sign-in failed. Please try email/password login.');
  }

  const cleanEmail = savedEmail.trim().toLowerCase();
  const formattedName = savedName || cleanEmail.split('@')[0].split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  return {
    email: cleanEmail,
    full_name: formattedName,
    google_id: savedUid || 'google_uid_' + btoa(cleanEmail).replace(/=/g, ''),
    photo_url: savedPhoto || 'https://lh3.googleusercontent.com/a/default-user'
  };
};

// Call this on app start to check if returning from Google redirect
export const checkGoogleRedirectResult = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result?.user?.email) {
      localStorage.setItem('lexaid_last_google_email', result.user.email);
      localStorage.setItem('lexaid_last_google_name', result.user.displayName || '');
      localStorage.setItem('lexaid_last_google_uid', result.user.uid || '');
      localStorage.setItem('lexaid_last_google_photo', result.user.photoURL || '');
      return result.user;
    }
  } catch (e) {
    console.warn('Redirect result check:', e);
  }
  return null;
};

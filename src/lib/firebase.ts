import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

console.log('Starting Firebase initialization');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Firebase config loaded:", {
  apiKey: firebaseConfig.apiKey ? "[REDACTED]" : undefined,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase
const existingApps = getApps();
console.log('Existing Firebase apps:', existingApps.length);

const app = existingApps.length === 0 ? initializeApp(firebaseConfig) : existingApps[0];
console.log('Firebase app initialized:', {
  name: app.name,
  options: {
    ...app.options,
    apiKey: '[REDACTED]'
  }
});

const db = getFirestore(app);
console.log('Firestore initialized');

const auth = getAuth(app);
console.log('Auth initialized:', {
  currentUser: auth.currentUser ? {
    uid: auth.currentUser.uid,
    email: auth.currentUser.email,
    isAnonymous: auth.currentUser.isAnonymous
  } : null
});

export { app, db, auth }; 
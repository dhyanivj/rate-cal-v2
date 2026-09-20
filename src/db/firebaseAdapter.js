/**
 * Firebase Firestore & Auth Adapter (Stub / Bridge)
 * When you are ready to switch from local dummy DB to Firebase:
 * 1. Install Firebase: npm install firebase
 * 2. Fill in your firebaseConfig below
 * 3. Change storage export in src/db/index.js to export FirebaseAdapter
 */

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export class FirebaseAdapter {
  constructor() {
    this.isConfigured = false;
  }

  async init() {
    console.info("Firebase adapter initialized. Ready to connect to Firestore & Firebase Auth.");
  }

  async getUsers() {
    // collection(db, "users")
    throw new Error("Firebase not yet connected. Using local storage dummy DB.");
  }

  async authenticate(id, password) {
    // signInWithEmailAndPassword or custom phone auth
    throw new Error("Firebase not yet connected. Using local storage dummy DB.");
  }
}

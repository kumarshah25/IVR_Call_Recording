import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import firebaseConfig from './config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

export const signUpWithEmailPassword = async (email, password, data) => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  await db.collection('users').doc(user.uid).set(data);
  return user;
};

export const signInWithEmailPassword = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};

export const sendPasswordReset = (email) => {
  return auth.sendPasswordResetEmail(email);
};

export const signOut = () => {
  return auth.signOut();
};

export const uploadFile = (file, path) => {
  const storageRef = storage.ref();
  const fileRef = storageRef.child(path);
  return fileRef.put(file);
};
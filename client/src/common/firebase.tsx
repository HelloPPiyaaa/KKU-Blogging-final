import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2xu2Gk8jCEmyVxT9QVJda4YbxpuvItEs",
  authDomain: "kku-blogging.firebaseapp.com",
  projectId: "kku-blogging",
  storageBucket: "kku-blogging.appspot.com",
  messagingSenderId: "1049515511189",
  appId: "1:1049515511189:web:128d03a138874966c63a9c",
  measurementId: "G-SJNFTSNPGW"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async (): Promise<UserCredential | null> => {
  let user: UserCredential | null = null;
  try {
    const result = await signInWithPopup(auth, provider);
    user = result;
  } catch (err) {
    console.log(err);
  }
  return user;
};

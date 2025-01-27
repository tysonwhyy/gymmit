import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  Auth,
} from "firebase/auth";

// Initialize Firebase auth
const auth: Auth = getAuth();

export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<any> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (
  email: string,
  password: string
): Promise<any> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign in with Google handles both registration and sign-in
export const doSignInWithGoogle = async (): Promise<any> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const doSignOut = (): Promise<void> => {
  return signOut(auth);
};

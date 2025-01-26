import { useState } from "react";
import styles from "./login.module.css";
import { doSignInWithGoogle } from "../firebase/auth";

export default function Login({ props }) {
  const { setUserId } = props;
  const handleSignIn = async () => {
    try {
      const result = await doSignInWithGoogle();
      setUserId(result.user.uid); // Assuming `doSignInWithGoogle` returns the user object
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcomeContainer}>
        <h1>Welcome to Gymmit</h1>
        <p>The Reddit for Gymgoers</p>
        <button className={styles.signInButton} onClick={handleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

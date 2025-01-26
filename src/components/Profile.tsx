import { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "./profile.module.css";
import { debounce } from "lodash";

export default function Profile({ props }) {
  const { profilePicture, db, user, userId } = props;
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [lastValidUsername, setLastValidUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBackToHome = async () => {
    if (!isUsernameValid) {
      try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, { username: lastValidUsername });
        setUsername(lastValidUsername);
      } catch (error) {
        console.error("Error reverting username:", error);
      }
    }
    navigate("/home");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "");
          setLastValidUsername(userData.username || "");
          setBio(userData.bio || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [db, userId]);

  const validateUsername = async (newUsername) => {
    if (!newUsername.trim()) return false;
    const usersCollectionRef = collection(db, "users");
    const usernameQuery = query(
      usersCollectionRef,
      where("username", "==", newUsername.toLowerCase())
    );
    const querySnapshot = await getDocs(usernameQuery);
    return (
      querySnapshot.docs.length === 0 || querySnapshot.docs[0]?.id === userId
    );
  };

  const debouncedValidate = debounce(async (newUsername) => {
    setIsUpdating(true);
    const isValid = await validateUsername(newUsername);
    setIsUsernameValid(isValid);
    if (isValid) {
      try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, { username: newUsername });
        setLastValidUsername(newUsername);
      } catch (error) {
        console.error("Error updating username:", error);
      }
    }
    setIsUpdating(false);
  }, 500);

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value.replace(/\s/g, "");
    setUsername(newUsername);
    debouncedValidate(newUsername);
  };

  const handleBioChange = async (e) => {
    const newBio = e.target.value;
    setBio(newBio);
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { bio: newBio });
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={handleBackToHome} className={styles.backButton}>
        Back to Home
      </button>
      <div className={styles.profileCard}>
        <img
          src={profilePicture}
          alt="Profile"
          className={styles.profilePicture}
        />
        <div className={styles.details}>
          <label className={styles.label}>Username:</label>
          <input
            value={username}
            type="text"
            onChange={handleUsernameChange}
            className={`${styles.input} ${
              isUsernameValid ? "" : styles.invalidInput
            }`}
          />
          {!isUsernameValid && (
            <p className={styles.errorMessage}>
              Username is already taken. Please choose another one.
            </p>
          )}
          {isUpdating && <p className={styles.loadingMessage}>Updating...</p>}
          <label className={styles.label}>Email:</label>
          <p className={styles.email}>{user.email}</p>
          <label className={styles.label}>Bio:</label>
          <textarea
            value={bio}
            onChange={handleBioChange}
            className={styles.textarea}
          />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, Firestore } from "firebase/firestore";

import { auth, db } from "./firebase/firebase";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import TopicPage from "./components/TopicPage";

interface Props {
  user: User | null;
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  profilePicture: string | null;
  db: Firestore;
}

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const props: Props = {
    user: auth.currentUser,
    userId,
    setUserId,
    profilePicture,
    db,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userObj) => {
      if (userObj) {
        setProfilePicture(auth.currentUser?.photoURL ?? null);
        setUserId(auth.currentUser?.uid ?? null);
        handleUserLogin(userObj, db);
      } else {
        setUserId(null);
        setProfilePicture(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUserLogin = async (user: User, db: Firestore) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "New User",
          username: "",
          bio: "",
          createdAt: new Date().toISOString(),
        });
        console.log("New user added");
      } else {
        console.log("User already exists");
      }
    } catch (error) {
      console.error("Error adding user to Firestore: ", error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            userId ? <Navigate to="/home" replace /> : <Login props={props} />
          }
        />
        <Route
          path="/home"
          element={
            userId ? <Home props={props} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/profile"
          element={
            userId ? <Profile props={props} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/topic/:id"
          element={
            userId ? (
              <TopicPage props={{ db, userId }} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

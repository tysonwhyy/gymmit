import { useState, useEffect } from "react";
import "./App.css";
import { auth, db } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";

import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import TopicPage from "./components/TopicPage"; // Import the new TopicPage component

function App() {
  const [userId, setUserId] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const props = {
    user: auth.currentUser,
    userId: userId,
    setUserId: setUserId,
    profilePicture: profilePicture,
    db: db,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userObj) => {
      if (userObj) {
        setProfilePicture(auth.currentUser.photoURL);
        setUserId(auth.currentUser.uid);
        handleUserLogin(userObj, db);
      } else {
        setUserId(null);
        setProfilePicture(null);
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleUserLogin(user, db) {
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
  }

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
        {/* New route for topic pages */}
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

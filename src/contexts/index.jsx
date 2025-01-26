import { auth } from "../../firebase/firebase";
import { useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext(); // creates context

export function useAuth() {
  // custom hook. allows easy access to AuthContext's (created above) value
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  // useEffect is necessary here because we want it to create a
  // listener every MOUNT, not every RENDER
  useEffect(() => {
    // sets up an onAuthStateChanged listener when this component mounts
    const unsubscribe = onAuthStateChanged(auth, initializeUser); // if auth changes, call initialize user
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });
      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
    return unsubscribe;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userLoggedIn,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

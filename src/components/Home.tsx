import { useState, useEffect, useRef } from "react";
import styles from "./home.module.css";
import { doSignInWithGoogle, doSignOut } from "../auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface Topic {
  id: string;
  title: string;
}

interface Props {
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  profilePicture: string | null;
  db: any; // Assuming db is Firestore instance, so we can use 'any' or 'Firestore' from firebase/firestore
}

export default function Home({ props }: { props: Props }) {
  const { userId, setUserId, profilePicture, db } = props;
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [topics, setTopics] = useState<Topic[]>([]); // State to store topics
  const [newTopic, setNewTopic] = useState<string>(""); // State for new topic input
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
  const [errorMessage, setErrorMessage] = useState<string>(""); // State for error message
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profilePicRef = useRef<HTMLDivElement | null>(null);

  // Fetch topics from Firestore
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "topics"));
        const topicsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(topicsList as Topic[]);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [db]);

  const handleSignOut = async () => {
    try {
      await doSignOut();
      setUserId(null);
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const handleSwitchAccount = () => {
    console.log("Switching account...");
    doSignInWithGoogle();
  };

  const handleViewProfile = () => {
    console.log("Going to profile");
    navigate("/profile");
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownVisible((prev) => !prev);
  };

  const handleAddTopic = async () => {
    if (newTopic.trim() === "") return;

    // Check if the topic already exists
    const topicsQuery = query(
      collection(db, "topics"),
      where("title", "==", newTopic.trim())
    );
    const querySnapshot = await getDocs(topicsQuery);

    if (!querySnapshot.empty) {
      setErrorMessage("A topic with this title already exists.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "topics"), {
        title: newTopic,
        createdAt: new Date(),
      });
      setTopics((prev) => [...prev, { id: docRef.id, title: newTopic }]);
      setNewTopic("");
      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const handleNavigateToTopic = (topicId: string) => {
    navigate(`/topic/${topicId}`);
  };

  // Filter topics based on the search query
  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profilePicRef.current &&
        !profilePicRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownVisible]);

  return (
    <div className={styles.container}>
      <div className={styles.profileContainer}>
        {profilePicture ? (
          <img
            ref={profilePicRef}
            src={profilePicture}
            alt="Profile"
            className={styles.profilePicture}
            onClick={toggleDropdown}
          />
        ) : (
          <div
            ref={profilePicRef}
            className={styles.defaultProfile}
            onClick={toggleDropdown}
          >
            No Image
          </div>
        )}
        {isDropdownVisible && (
          <div ref={dropdownRef} className={styles.dropdown}>
            <button onClick={handleSwitchAccount}>
              Sign in with a different account
            </button>
            <button onClick={handleSignOut}>Log out</button>
            <button onClick={handleViewProfile}>View Profile</button>
          </div>
        )}
      </div>

      <div className={styles.mainContent}>
        <h1>Topics</h1>

        {/* Search input */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.topicList}>
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={styles.topicItem}
              onClick={() => handleNavigateToTopic(topic.id)}
            >
              {topic.title}
            </div>
          ))}
        </div>

        {/* Error message if topic already exists */}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.addTopicContainer}>
          <input
            type="text"
            placeholder="Add a new topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleAddTopic} className={styles.addButton}>
            Add Topic
          </button>
        </div>
      </div>
    </div>
  );
}

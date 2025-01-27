import { useState, useEffect, useRef } from "react";
import styles from "./home.module.css";
import { doSignInWithGoogle, doSignOut } from "../firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface Topic {
  id: string;
  title: string;
}

interface Props {
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  profilePicture: string | null;
  db: any;
}

export default function Home({ props }: { props: Props }) {
  const { userId, setUserId, profilePicture, db } = props;
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profilePicRef = useRef<HTMLImageElement | null>(null);

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

  const handleAddTopic = async () => {
    if (newTopic.trim() === "") return;

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
      setErrorMessage("");
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const handleNavigateToTopic = (topicId: string) => {
    navigate(`/topic/${topicId}`);
  };

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          />
        ) : (
          <div
            ref={dropdownRef}
            className={styles.defaultProfile}
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          >
            No Image
          </div>
        )}
        {isDropdownVisible && (
          <div ref={dropdownRef} className={styles.dropdown}>
            <button onClick={handleSignOut}>Log out</button>
          </div>
        )}
      </div>

      <div className={styles.mainContent}>
        <h1>Topics</h1>

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

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import styles from "./topicpage.module.css";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  username: string;
}

interface Topic {
  id: string;
  title: string;
}

interface Props {
  db: any;
  userId: string | null;
}

export default function TopicPage({ props }: { props: Props }) {
  const { db, userId } = props;
  const { id } = useParams<{ id: string }>(); // Get the topic ID from the URL
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [commentUsername, setCommentUsername] = useState<string>("Anonymous");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch topic details
        const topicDoc = await getDoc(doc(db, "topics", id));
        if (topicDoc.exists()) {
          setTopic({ id: topicDoc.id, ...topicDoc.data() });
        } else {
          console.error("Topic not found.");
          return;
        }

        // Fetch comments in ascending order (oldest first)
        const commentsRef = collection(db, "topics", id, "comments");
        const commentsQuery = query(commentsRef, orderBy("createdAt", "asc")); // Ascending order
        const commentsSnapshot = await getDocs(commentsQuery);

        const commentsList = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsList);

        // Fetch username if user is logged in
        if (userId) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            setCommentUsername(userDoc.data().username || "Anonymous");
          }
        }
      } catch (error) {
        console.error("Error fetching topic or comments:", error);
      }
    };

    fetchData();
  }, [db, id, userId]);

  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      console.error("Cannot add an empty comment.");
      return;
    }

    try {
      // Reference the comments subcollection under the current topic
      const commentsRef = collection(db, "topics", id, "comments");

      const newCommentDoc = {
        text: newComment,
        createdAt: new Date().toISOString(),
        username: commentUsername,
      };

      const docRef = await addDoc(commentsRef, newCommentDoc);

      // Update local state with the new comment at the end
      setComments((prev) => [...prev, { id: docRef.id, ...newCommentDoc }]);
      setNewComment(""); // Clear input field
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleBack = () => {
    navigate("/"); // Navigates back to the homepage
  };

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backButton}>
        Back to Homepage
      </button>
      {topic && (
        <div className={styles.topicHeader}>
          <h1>{topic.title}</h1>
        </div>
      )}
      <div className={styles.comments}>
        {comments.map((comment) => (
          <div key={comment.id} className={styles.comment}>
            <div>
              <strong>{comment.username || "Anonymous"}</strong>: {comment.text}
            </div>
            <small className={styles.timestamp}>
              {comment.createdAt
                ? formatTimestamp(comment.createdAt)
                : "Unknown time"}
            </small>
          </div>
        ))}
      </div>
      <div className={styles.addComment}>
        <input
          type="text"
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleAddComment} className={styles.addButton}>
          Add Comment
        </button>
      </div>
    </div>
  );
}

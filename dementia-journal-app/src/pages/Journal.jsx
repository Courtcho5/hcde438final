import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "./Journal.css";


function Journal() {
  const [user, setUser] = useState(null);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!entry.trim()) return;

    try {
      await addDoc(collection(db, "journalEntries"), {
        text: entry,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      setEntry("");
      alert("Entry saved!");
    } catch (err) {
      console.error("Error saving entry:", err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className = "journal-container">

      
        <div className="journal-title">
          <h2>Take a moment to reflect, {user.email}</h2>
          <p>Your entry will help generate memory questions to strengthen recall and preserve your story.</p>
        </div>
//add date selection
        <div className="journal-textbox">
          <textarea
            className="journal-text"
            placeholder="What did you do today? Who did you see? What made you laugh, think, or pause?"
            rows="6"
            cols="50"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          ></textarea>
        </div>

        <div>
          <button onClick={handleSave} className="journal-button">Save Journal Entry</button>
        </div>
      </div>
    </div>
  );
}

export default Journal;

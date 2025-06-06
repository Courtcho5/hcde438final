import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, Timestamp, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "./Journal.css";

function Journal() {
  const [user, setUser] = useState(null);
  const [entry, setEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!entry.trim()) return;
    // adds timestamp to entry in database and saves entry
    try {
      await addDoc(collection(db, "journalEntries"), {
        text: entry,
        userId: user.uid,
        createdAt: selectedDate
          ? Timestamp.fromDate(new Date(selectedDate))
          : serverTimestamp(),
      });   
      setEntry("");
      setSelectedDate("");
      alert("Entry saved!");
    } catch (err) {
      console.error("Error saving entry:", err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="journal-container">
        <div className="journal-title">
          <h2>Take a moment to reflect, {user.email}</h2>
          <p className="journal-subtext">
            Your entry will help generate memory questions to strengthen recall and preserve your story.
          </p>
        </div>

        <div className="journal-date-picker">
          <label htmlFor="entry-date">Choose Entry Date: </label>
          <input
            id="entry-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="journal-textbox">
          <textarea
            className="journal-text"
            placeholder="Write about your day: What did you do today? Who did you see? What made you laugh, think, or pause?"
            rows="6"
            cols="50"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          ></textarea>
        </div>

        <div>
          <button onClick={handleSave} className="journal-button">
            Save Journal Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default Journal;

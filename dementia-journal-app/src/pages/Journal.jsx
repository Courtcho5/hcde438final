import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";

function Journal() {
  const [user, setUser] = useState(null);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

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
      <Navbar/>
      <div style = {styles.container}>
        <div style = {styles.title}>
          <h2>Take a moment to reflect, {user.email}</h2>
          </div>
        <div style = {styles.sub}>
          <p>Your entry will help generate memory questions to strengthen recall and preserve your story.</p>
        </div>
        <div>
          <textarea style = {styles.textBox}
          placeholder="What did you do today? Who did you see? What made you laugh, think, or pause?"
          rows="6"
          cols="50"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        ></textarea>
        </div>
        <div style = {styles.button}>
          <button onClick={handleSave}>Save Journal Entry</button>
        </div>
      </div>      
    </div>
  );
}

const styles = {
  container: {
    padding: "10px",
    paddingBottom: "0px",
    display: "block",
    textAlign: "center",
  },

  title: {
    padding: "10px",
    fontSize: "25pt",

  },

  sub: {
    fontSize: "16pt",
    margin: "0px",
  },

  textBox: {
    width: "800px",
    textAlign: "center",
    fontSize: "13pt",
    borderRadius: "10px",
  },

  button: {
    marginTop: "10px",
    backgroundColor: "#343a40",
  }
}

export default Journal;

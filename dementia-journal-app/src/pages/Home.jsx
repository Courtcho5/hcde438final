import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [hasTakenQuizToday, setHasTakenQuizToday] = useState(false);
  const navigate = useNavigate();

    useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);

      if (currUser) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Checks if journal is done
        const entriesRef = collection(db, "journalEntries");
        const journalQuery = query(entriesRef, where("userId", "==", currUser.uid));
        const journalSnap = await getDocs(journalQuery);
        const journaledToday = journalSnap.docs.some(doc => {
          const date = doc.data().createdAt?.toDate?.();
          return date && date >= today;
        });
        setHasJournaledToday(journaledToday);

        // checks if quiz is done
        const quizRef = collection(db, "quizAttempts");
        const quizQuery = query(quizRef, where("userId", "==", currUser.uid));
        const quizSnap = await getDocs(quizQuery);
        const quizToday = quizSnap.docs.some(doc => {
          const date = doc.data().createdAt?.toDate?.();
          return date && date >= today;
        });
        setHasTakenQuizToday(quizToday);
      }
    });
    return () => unsub();
  }, []);


  const progressPercent = (Number(hasJournaledToday) + Number(hasTakenQuizToday)) * 50;
  if (!user) return <p>Loading...</p>;

  return (
    <div> 
      <Navbar />

      <div className="home-container-name">
        <h2>Welcome, {user.email}</h2>
        <p>Ready to reconnect with your day?</p>
      </div>
      <div className="home-progress-bar-container">
        <p>Today's Progress: {progressPercent}%</p>
        <div className = "home-progress-bar">
          <div
            className="home-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>


      <div className="home-container-middle">
        <button onClick={() => navigate("/journal")}>Write New Entry</button>
        <br /><br />
        <button onClick={() => navigate("/quiz")}>Start Quiz</button>
      </div>
    </div>

      
    
  );
}

export default Home;

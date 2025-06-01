import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
    });
    return () => unsub();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />

      <div className="home-container-name">
        <h2>Welcome, {user.email}</h2>
        <p>Ready to reconnect with your day?</p>
      </div>

      <div className="home-container-dual">
        <div className="home-container-left">
          {/* Optional: Add content here */}
        </div>

        <div className="home-container-right">
          <div className="home-right-action">
            <button onClick={() => navigate("/journal")}>Write New Entry</button>
            <br /><br />
            <button onClick={() => navigate("/quiz")}>Start Quiz</button>
          </div>

          <div className="home-right-progress-bar"></div>
          <div className="home-right-statistics"></div>
        </div>
      </div>
    </div>
  );
}

export default Home;

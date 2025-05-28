import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Navbar from "../components/Navbar";


function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!user) return <p>Loading...</p>;

  return (
    
    <div>
        <Navbar />
        <div style = {styles.container}>
          <div style = {styles.card1}>
            <div style = {styles.header}>
              <h2>Welcome, {user.email}</h2>
              <p>Ready to remember?</p>
            </div>
            <div style = {styles.card2}>
              <button onClick={() => navigate("/journal")}>Write New Entry</button>
              <br /><br />
              <button onClick={() => navigate("/quiz")}>Start Quiz</button>
              </div>
          </div>

    </div>
    </div>
  );
}


const styles = {
  container: {
    display: "block",
    flexDirection: "row",
    padding: "10px",
    boxSizing: "border-box",
  },
  card1: {
    backgroundColor: "#343a40",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    height: "100%",
    width: "100%",
    display: "block",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    color: "white",
    width: "100%",
  },
  card2: {
    backgroundColor: "rgba(60, 61, 129, 0.9)",
    display: "block",
    flexDirection: "row",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    
    textAlign: "center",
  },
  title: {
    marginBottom: "1rem",
    color: "white",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
};


export default Home;

import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Navbar() {
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

  return (
    <nav style={styles.nav}>
      <h2 style={styles.title}>Rewind</h2>
      <div style={styles.links}>
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => navigate("/journal")}>Journal</button>
        <button onClick={() => navigate("/quiz")}>Quiz</button>
        {user && <span style={styles.user}>{user.email}</span>}
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#343a40",
    color: "white",
    boxSizing: "border-box",
  },
  title: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  user: {
    color: "#ccc",
    fontSize: "0.9rem",
    marginRight: "1rem",
  },
};

export default Navbar;

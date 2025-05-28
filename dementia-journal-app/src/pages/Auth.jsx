import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div style = {styles.container}>
        <div style = {styles.card}>
          <h2 style = {styles.title}> {isSignUp ? "Sign Up" : "Sign In"}</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={handleAuth} styles = {styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            /><br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            /><br />
            <button type="submit" styles = {styles.button}>{isSignUp ? "Create Account" : "Login"}</button>
          </form>

          <br />
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
          </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "500px",
    backgroundColor: "#f9f9f9",
  },
  card: {
    backgroundColor: "rgba(60, 61, 129, 0.9)",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
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


export default Auth;

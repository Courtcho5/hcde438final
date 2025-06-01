import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

import "./Auth.css";


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
  <div className="auth-container">
    <div className="auth-image" />

    <div className="auth-card">
      <div className = "auth-logo-line">
        <img src = "src\pages\logo.png" alt = "Logo" className = "auth-logo"/>
        <h2 className = "auth-brand-name">Recollective</h2>

      </div>
      
      <h2 className="auth-title">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h2>
      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleAuth} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="auth-button-go">
          {isSignUp ? "Create Account" : "Login"}
        </button>
      </form>

      <br />

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="auth-button"
      >
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  </div>
);
}

export default Auth;

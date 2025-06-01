import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {useLocation} from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hideNavItems = location.pathname === "/" || location.pathname === "/auth";
  const getButtonClass = (path) => {
    return location.pathname === path ? "nav-button active" : "nav-button";
  }

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
    <nav className="nav">
      <h2 className="nav-title">Rewind</h2>
      {!hideNavItems && (
        <div className="nav-links">
          <button className={getButtonClass("/home")} onClick={() => navigate("/home")}>Home</button>
          <button className={getButtonClass("/journal")} onClick={() => navigate("/journal")}>Journal</button>
          <button className={getButtonClass("/quiz")} onClick={() => navigate("/quiz")}>Quiz</button>
          {user && <span className="nav-user">{user.email}</span>}
          <button onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </nav>
  );
}




export default Navbar;

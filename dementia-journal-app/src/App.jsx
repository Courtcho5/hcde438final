import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Journal from "./pages/Journal";
import Quiz from "./pages/Quiz";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;


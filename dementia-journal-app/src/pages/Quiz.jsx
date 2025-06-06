import { useEffect, useState } from "react";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { addDoc,  serverTimestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "./Quiz.css";

function Quiz() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [quizStarted, setQuizStarted] = useState(false);

  //creates API linkage
  const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
    });
    return () => unsub();
  }, []);
  // Takes Gemeni output and organizes it into question, answer, and explaination; aligns correct answer to index
  const parseQuestions = (rawText) => {
    const blocks = rawText.split("Q: ").slice(1);
    return blocks.map((block) => {
      const [questionLine, ...rest] = block.split("\n");
      const options = rest
        .filter((line) => line.startsWith("-"))
        .map((opt) => opt.trim().slice(2));
      const correctLine = rest.find((line) => line.startsWith("Correct:")) || "";
      const sourceLine = rest.find((line) => line.startsWith("Source:")) || "";

      const correctIndex = "ABCD".indexOf(correctLine.replace("Correct:", "").trim());

      return {
        question: questionLine.trim(),
        options,
        correctIndex,
        explanation: sourceLine.replace("Source:", "").trim(),
      };
    });
  };

  const handleGenerateQuiz = async () => {
    if (!user) return;
    setLoading(true);
    // Ensures that userId of user aligns with database 
    try {
      const entriesRef = collection(db, "journalEntries");
      const q = query(entriesRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      // Time since entry, difficulty generator
      const now = new Date();
      let cutoff;
      if (difficulty === "easy") {
        cutoff = new Date(now.setHours(0, 0, 0, 0));
      } else if (difficulty === "medium") {
        cutoff = new Date(now.setDate(now.getDate() - 7));
      } else {
        cutoff = new Date(now.setDate(now.getDate() - 30));
      }
      // Makes sure entries that are behind cutoff are exlcuded
      const filteredDocs = snapshot.docs.filter((doc) => {
        const entryDate = doc.data().createdAt?.toDate?.();
        return entryDate && entryDate >= cutoff;
      });
      // Summarizes text to be sent to Gemini
      const allText = filteredDocs.map((doc) => doc.data().text).join("\n");

      if (!allText.trim()) {
        alert("No journal entries found. Please write one first!");
        setLoading(false);
        return;
      }
      //Gemini prompt
      const prompt = `
You're a memory recall assistant. Based on the journal entries below, generate 3 multiple-choice recall questions. Each question should:

1. Be based only on content explicitly written in the journal. Do not use the language "journal writer" instead use "you
2. Have exactly 4 answer options:
   - One correct answer
   - Three plausible but incorrect answers
3. Use this format exactly:
   Q: [Question]
   A:
   - [Option A]
   - [Option B]
   - [Option C]
   - [Option D]
   Correct: [Letter]
   Source: [Copy the exact sentence from the journal that supports the correct answer.]

Journal Entries:
"${allText}"
`;
      //Gemini formating requirement
      const body = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      //Checks each retunred string for values and returns null if not, and does not start quiz
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = parseQuestions(rawText);
      setQuestions(parsed);
      setUserAnswers(Array(parsed.length).fill(null));
      setCurrentQuestion(0);
      setQuizComplete(false);
      setQuizStarted(true);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setQuestions([{ question: "Failed to generate questions." }]);
    } finally {
      setLoading(false);
    }
  };
  //Answer selection by user is evaluated by index
  const handleAnswerSelect = (index) => {
    const updated = [...userAnswers];
    updated[currentQuestion] = index;
    setUserAnswers(updated);
  };
//Pushes to next question and resets to current
  const handleNext = async () => {
  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
  } else {
    setQuizComplete(true);
    
    try {
      await addDoc(collection(db, "quizAttempts"), {
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to log quiz attempt:", error);
    }
  }
};


  if (!user) return <p>Loading user...</p>;

  return (
    <div className="quiz-page">
      <Navbar />

      {!quizStarted && (
        <div className="quiz-container">
          <div className="quiz-title">
            <h2>Memory Quiz</h2>
          </div>
          <div className = "quiz-subtext">
            
              <p>
                After you write a short journal entry about your day, Rewind will ask you a few <strong>multiple choice questions</strong> based on what you wrote.
           
                You simply <strong>choose the answer that matches what you wrote</strong>. There’s no pressure, it’s just a fun and gentle way to help your brain practice remembering.
              
                Doing this each day helps keep your memory strong and your mind active its like a small brain workout, made just for you.
              </p>
              <p> Ready to start? </p>
              <p> Select a difficulty below and click " Begin Quiz "</p>
          </div>
          <div className="quiz-settings">
            <label htmlFor="difficulty">Choose Difficulty: </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy (Today)</option>
              <option value="medium">Medium (Past Week)</option>
              <option value="hard">Hard (Past Month)</option>
            </select>
          </div>

          <button
            onClick={handleGenerateQuiz}
            className="quiz-button"
            disabled={loading}
          >
            {loading ? "Generating..." : "Begin Quiz"}
          </button>
        </div>
      )}

      {quizStarted && !quizComplete && (
        <div className="actquiz-container">
          <div className = "actquiz-question-number-container">
             Question {currentQuestion + 1} of {questions.length}
          </div>
           
          
          <div className="actquiz-question">{questions[currentQuestion].question}</div>
          
            <div className="option-grid">
              {questions[currentQuestion].options.map((option, i) => (
                <div
                  key={i}
                  className={`option-box ${
                    userAnswers[currentQuestion] === i ? "selected" : ""
                  }`}
                  onClick={() => handleAnswerSelect(i)}
                >
                  {option}
                </div>
              ))}
            </div>

          
          <button onClick={handleNext} className="quiz-next">Next</button>
        </div>
      )}

      {quizComplete && (
  <>
    <div className="quiz-complete-title">
      <h3>Quiz Complete 🎉</h3>
    </div>
    <div className="quiz-complete-question">
      {questions.map((q, i) => (
        <div key={i} className="quiz-result">
          <strong>Q{i + 1}: {q.question}</strong>
          <ul>
            {q.options.map((opt, idx) => (
              <li key={idx}>
                {idx === q.correctIndex
                  ? "✅"
                  : idx === userAnswers[i]
                  ? "❌"
                  : "⬜"}{" "}
                {opt}
              </li>
            ))}
          </ul>
          <em>Journal Evidence: {q.explanation}</em>
        </div>
      ))}
    </div>
  </>
)}

    </div>
  );
}

export default Quiz;

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
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

  const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
    });
    return () => unsub();
  }, []);

  const parseQuestions = (rawText) => {
    const blocks = rawText.split("Q: ").slice(1);
    return blocks.map((block) => {
      const [questionLine, ...rest] = block.split("\n");
      const options = rest
        .filter((line) => line.startsWith("-"))
        .map((opt) => opt.trim().slice(2));
      const correctLine = rest.find((line) => line.startsWith("Correct:")) || "";
      const explanationLine =
        rest.find((line) => line.startsWith("Justification:")) || "";

      const correctIndex = "ABCD".indexOf(correctLine.replace("Correct:", "").trim());

      return {
        question: questionLine.trim(),
        options,
        correctIndex,
        explanation: explanationLine.replace("Justification:", "").trim(),
      };
    });
  };

  const handleGenerateQuiz = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const entriesRef = collection(db, "journalEntries");
      const q = query(entriesRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const allText = snapshot.docs.map((doc) => doc.data().text).join("\n");
      
      const daysMap = {
        easy: 0, medium: 7, hard: 30,
      };

      const daysAgo = daysMap[difficulty] ?? 0;
      const cutoff = new Date();
      cutoff.setHours(0,0,0,0)
      cutoff.setDate(cutoff.getDate()-daysAgo);

      if (!allText.trim()) {
        alert("No journal entries found. Please write one first!");
        setLoading(false);
        return;
      }

      const prompt = `
You're a memory recall assistant. Based on the journal entries below, generate 3 multiple-choice recall questions. Each question should:

1. Be based only on content explicitly written in the journal.
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

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = parseQuestions(rawText);
      setQuestions(parsed);
      setUserAnswers(Array(parsed.length).fill(null));
      setCurrentQuestion(0);
      setQuizComplete(false);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setQuestions([{ question: "Failed to generate questions." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    const updated = [...userAnswers];
    updated[currentQuestion] = index;
    setUserAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizComplete(true);
    }
  };

  if (!user) return <p>Loading user...</p>;

  return (
    <div>
      <Navbar />
      <div className = "quiz-container">
        <div className="journal-title">
          <h2>Memory Quiz</h2>
          <p>Based on your past journal entries, Recollective will created a short quiz to help reinforce your memories. 
            Each question is designed to test your recall of specific details from what you've written.
            Take your time — this is all about keeping your mind sharp and reflecting on the moments that matter.</p>
          <p>Choose your difficulty level</p>
        <div className = "quiz-difficulty-selector">
          <label>
            Difficulty:
            <select value = {difficulty} onChange = {(e) => setDifficulty(e.target.value)}>
              <option value = "easy">Easy</option>
              <option value = "medium">Medium</option>
              <option value = "hard">Hard</option>
            </select>
          </label>
        </div>
        </div>
      
      <div className = "quiz-button-container">
        {!questions.length && (
          <button onClick={handleGenerateQuiz} className = "quiz-generate-button" disabled={loading}>
            {loading ? "Generating..." : "Generate Quiz from My Entries"}
          </button>
        )}
      </div>
    </div>

      {questions.length > 0 && !quizComplete && (
        <div>
          <h3>
            Question {currentQuestion + 1} of {questions.length}
          </h3>
          <p>{questions[currentQuestion].question}</p>
          <ul>
            {questions[currentQuestion].options.map((option, i) => (
              <li key={i}>
                <label>
                  <input
                    type="radio"
                    name="answer"
                    value={i}
                    checked={userAnswers[currentQuestion] === i}
                    onChange={() => handleAnswerSelect(i)}
                  />
                  {option}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleNext}>Next</button>
        </div>
      )}

      {quizComplete && (
        <div>
          <h3>Quiz Complete 🎉</h3>
          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom: "1rem" }}>
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
              <em>Explanation: {q.explanation}</em>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Quiz;

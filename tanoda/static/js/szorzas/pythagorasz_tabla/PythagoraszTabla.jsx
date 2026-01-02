import React, { useState, useEffect } from "react";
import '../../../css/szorzas/Pythagorasz_tabla/pythagorasz_tabla.css';

const N = 10;

// Helper function to get CSRF token
function getCSRFToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Helper function to calculate the digital root
function calculateDigitalRoot(n) {
  while (n > 9) {
    let sum = 0;
    String(n).split('').forEach(digit => {
      sum += parseInt(digit, 10);
    });
    n = sum;
  }
  return n;
}

function getColor(i, j) {
  if (i === j) return "diag";
  if ((i === 1 && j > 1) || (j === 1 && i > 1)) return "highlight";
  return "";
}

export default function PythagoraszTabla() {
  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStatus, setQuizStatus] = useState({ total_points: 0, efficiency: 0, current_difficulty: 2 });
  const [loading, setLoading] = useState(true);
  const [answerState, setAnswerState] = useState(null); // 'correct', 'incorrect', null
  const [selectedCell, setSelectedCell] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Table state
  const [highlight, setHighlight] = useState({ row: null, col: null });
  const [displayMode, setDisplayMode] = useState('product');

  // Load quiz questions and status on mount
  useEffect(() => {
    Promise.all([
      fetch('/egesz_szamok/api/pythagoras-quiz/questions/?count=10')
        .then(res => res.json()),
      fetch('/egesz_szamok/api/pythagoras-quiz/status/')
        .then(res => res.json())
    ]).then(([questionsData, statusData]) => {
      setQuestions(questionsData.questions);
      setQuizStatus(statusData);
      setLoading(false);
      setQuestionStartTime(Date.now());
    }).catch(error => {
      console.error('Hiba a quiz betöltésekor:', error);
      setLoading(false);
    });
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const handleCellClick = async (rowIndex, colIndex) => {
    if (!currentQuestion || answerState !== null) return;

    const product = (rowIndex + 1) * (colIndex + 1);
    const responseTime = (Date.now() - questionStartTime) / 1000;

    setSelectedCell({ row: rowIndex + 1, col: colIndex + 1 });

    try {
      const response = await fetch('/egesz_szamok/api/pythagoras-quiz/check-answer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
          szorzo: currentQuestion.szorzo,
          szorzando: currentQuestion.szorzando,
          answer: product,
          response_time: responseTime,
          difficulty: quizStatus.current_difficulty
        })
      });

      const data = await response.json();

      if (data.correct) {
        setAnswerState('correct');
        setFeedback({
          message: `Helyes! +${data.points_earned} pont`,
          details: data.explanation
        });
        setQuizStatus({
          total_points: data.total_points,
          efficiency: data.efficiency,
          current_difficulty: data.new_difficulty
        });
      } else {
        setAnswerState('incorrect');
        setFeedback({
          message: `Helytelen! A helyes válasz: ${data.correct_answer}`,
          details: data.explanation
        });
        setQuizStatus(prev => ({
          ...prev,
          current_difficulty: data.new_difficulty
        }));
      }

      // Automatikus továbblépés 2 másodperc után
      setTimeout(() => {
        moveToNextQuestion();
      }, 2500);

    } catch (error) {
      console.error('Hiba a válasz ellenőrzésekor:', error);
      setAnswerState(null);
      setSelectedCell(null);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswerState(null);
      setSelectedCell(null);
      setFeedback(null);
      setQuestionStartTime(Date.now());
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setLoading(true);
    fetch('/egesz_szamok/api/pythagoras-quiz/questions/?count=10')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setAnswerState(null);
        setSelectedCell(null);
        setFeedback(null);
        setQuizCompleted(false);
        setQuestionStartTime(Date.now());
        setLoading(false);
      });
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prevMode => (prevMode === 'product' ? 'digitalRoot' : 'product'));
  };

  const renderCellContent = (rowIndex, colIndex) => {
    const product = (rowIndex + 1) * (colIndex + 1);
    if (displayMode === 'product') {
      return product;
    } else {
      return calculateDigitalRoot(product);
    }
  };

  const getCellClassName = (rowIndex, colIndex) => {
    let className = getColor(rowIndex + 1, colIndex + 1);

    // Highlight on hover
    if (highlight.row === rowIndex + 1 || highlight.col === colIndex + 1) {
      className += " active";
    }

    // Selected cell
    if (selectedCell && selectedCell.row === rowIndex + 1 && selectedCell.col === colIndex + 1) {
      if (answerState === 'correct') {
        className += " cell-correct";
      } else if (answerState === 'incorrect') {
        className += " cell-incorrect";
      }
    }

    // Highlight correct answer after incorrect response
    if (answerState === 'incorrect' && currentQuestion) {
      const product = (rowIndex + 1) * (colIndex + 1);
      if (product === currentQuestion.correct_answer) {
        className += " cell-correct-answer";
      }
    }

    return className;
  };

  if (loading) {
    return (
      <div className="pythagorasz-app-container">
        <div className="quiz-loading">
          <div className="spinner"></div>
          <p>Kérdések betöltése...</p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="pythagorasz-app-container">
        <div className="quiz-completed">
          <h2 className="quiz-title">🎉 Gratulálunk!</h2>
          <p className="quiz-subtitle">Befejezted a kvízt!</p>
          <div className="quiz-results">
            <div className="result-item">
              <span className="result-label">Összpontszám:</span>
              <span className="result-value">{quizStatus.total_points}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Hatékonyság:</span>
              <span className="result-value">{quizStatus.efficiency}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Jelenlegi szint:</span>
              <span className="result-value">{quizStatus.current_difficulty}</span>
            </div>
          </div>
          <button onClick={restartQuiz} className="quiz-restart-button">
            Új kvíz indítása
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pythagorasz-app-container">
      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-stats">
          <div className="stat-item">
            <span className="stat-label">Pontszám:</span>
            <span className="stat-value">{quizStatus.total_points}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Hatékonyság:</span>
            <span className="stat-value">{quizStatus.efficiency}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Szint:</span>
            <span className="stat-value">{quizStatus.current_difficulty}</span>
          </div>
        </div>
        <div className="quiz-progress">
          <span className="progress-text">
            Kérdés {currentQuestionIndex + 1} / {questions.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className={`quiz-question ${answerState ? 'answered' : ''}`}>
          <h3 className="question-text">{currentQuestion.question}</h3>
          <p className="question-instruction">Kattints a Pythagorasz táblán a helyes válaszra!</p>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`quiz-feedback ${answerState}`}>
          <p className="feedback-message">{feedback.message}</p>
          {feedback.details && (
            <p className="feedback-details">
              {typeof feedback.details === 'object' ? feedback.details.leiras : feedback.details}
            </p>
          )}
        </div>
      )}

      {/* Table Controls */}
      <button onClick={toggleDisplayMode} className="pythagorasz-toggle-button">
        {displayMode === 'product' ? 'Digitális gyökre váltás' : 'Szorzatokra váltás'}
      </button>

      {/* Pythagoras Table */}
      <div className="pythagorasz-table-responsive">
        <table className="pythagorasz-table">
          <thead>
            <tr>
              <th>×</th>
              {[...Array(N)].map((_, j) => (
                <th key={j+1}>{j+1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(N)].map((_, i) => (
              <tr key={i+1}>
                <th>{i+1}</th>
                {[...Array(N)].map((_, j) => {
                  return (
                    <td
                      key={j+1}
                      className={getCellClassName(i, j)}
                      tabIndex={0}
                      onClick={() => handleCellClick(i, j)}
                      onMouseEnter={() => setHighlight({ row: i+1, col: j+1 })}
                      onMouseLeave={() => setHighlight({ row: null, col: null })}
                      onFocus={() => setHighlight({ row: i+1, col: j+1 })}
                      onBlur={() => setHighlight({ row: null, col: null })}
                      style={{ cursor: answerState === null ? 'pointer' : 'default' }}
                    >
                      {renderCellContent(i, j)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

const CivilizationChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [xAxisType, setXAxisType] = useState('logarithmic');
  const [yAxisType, setYAxisType] = useState('logarithmic');
  const [showExplanation, setShowExplanation] = useState(false);

  // Data for the chart
  const xValues = [-250000000, -10000, 1750, 1800, 1850, 1900, 1950, 2000, 2020];
  const yValues = [1, 2, 3, 5, 10, 50, 200, 1000, 2000];
  
  // Quiz questions
  const quizQuestions = [
    {
      question: "Hányszorosára gyorsult fel a civilizációnk működése az ipari forradalom óta?",
      options: ["Kb. 200-szorosára", "Kb. 2000-szeresére", "Kb. 2 000 000-szorosára"],
      correctAnswer: 2,
      explanation: "Az elmélet szerint a természet által 250 millió év alatt elraktározott energia felszabadítása révén az emberiség olyan energiabőséghez jutott, ami kb. 2 milliószor gyorsabb fejlődést tett lehetővé."
    },
    {
      question: "Szerinted ez a felgyorsulás összességében:",
      options: ["Jó, mert elősegíti a fejlődést", "Rossz, mert veszélyezteti a környezetet", "Attól függ, hogyan kezeljük a következményeit"],
      correctAnswer: 2,
      explanation: "Ez egy összetett kérdés. A gyors fejlődés számos előnnyel jár, de jelentős kihívásokat is teremt, különösen környezeti és társadalmi szempontból. A kulcs a fenntartható fejlődés megvalósítása."
    },
    {
      question: "Melyik esemény jelzi az emberi civilizáció felgyorsulásának kezdetét a grafikonon?",
      options: ["A mezőgazdasági forradalom", "Az ipari forradalom", "Az információs forradalom"],
      correctAnswer: 1,
      explanation: "A grafikon az ipari forradalomtól (kb. 1750-től) mutat meredek emelkedést, ami jelzi a civilizáció működésének felgyorsulását."
    }
  ];

  // Initialize chart when component mounts
  useEffect(() => {
    createChart();
    
    // Clean up when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);
  
  // Update chart when axis type changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.options.scales.x.type = xAxisType;
      chartInstance.current.options.scales.y.type = yAxisType;
      chartInstance.current.update();
    }
  }, [xAxisType, yAxisType]);

  const createChart = () => {
    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: xValues.map(String),
        datasets: [{
          label: 'Civilizáció fejlődése',
          data: xValues.map((x, i) => ({ x, y: yValues[i] })),
          borderColor: '#4ecca3',
          backgroundColor: 'rgba(78, 204, 163, 0.3)',
          tension: 0.4,
          fill: false,
          pointRadius: 6,
          pointBackgroundColor: '#4ecca3',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Az emberi civilizáció fejlődésének felgyorsulása',
            color: '#e0e0e0',
            font: {
              size: 16
            }
          },
          legend: {
            labels: {
              color: '#e0e0e0',
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            type: xAxisType,
            title: {
              display: true,
              text: 'Idő (év)',
              color: '#39FF14'
            },
            ticks: {
              color: '#39FF14',
              callback: function(value, index, values) {
                if (xAxisType === 'logarithmic') {
                  if (value === -250000000) return '-250M';
                  if (value === -10000) return '-10K';
                  return value;
                }
                return value;
              }
            },
            grid: {
              color: '#4ecca3'
            }
          },
          y: {
            type: yAxisType,
            title: {
              display: true,
              text: 'Relatív fejlődési sebesség',
              color: '#39FF14'
            },
            ticks: {
              color: '#39FF14'
            },
            grid: {
              color: '#4ecca3'
            }
          }
        }
      }
    });
  };

  const updateAxisType = (axis, type) => {
    if (axis === 'x') {
      setXAxisType(type);
    } else {
      setYAxisType(type);
    }
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  // Check quiz answer for a specific question
  const checkQuizAnswer = (questionId, selectedOptionIndex) => {
    const question = quizQuestions[questionId];
    const isCorrect = selectedOptionIndex === question.correctAnswer;
    return {
      isCorrect,
      explanation: question.explanation
    };
  };

  return (
    <div className="container mt-4">
      <h3>Az emberi civilizáció felgyorsulása</h3>
      
      <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
        <canvas ref={chartRef}></canvas>
      </div>
      
      <div className="control-panel mt-3 row">
        <div className="col-md-6">
          <label htmlFor="xaxis-scale">X tengely skála:</label>
          <select 
            id="xaxis-scale" 
            className="form-select" 
            value={xAxisType}
            onChange={(e) => updateAxisType('x', e.target.value)}
          >
            <option value="logarithmic">Logaritmikus</option>
            <option value="linear">Lineáris</option>
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="yaxis-scale">Y tengely skála:</label>
          <select 
            id="yaxis-scale" 
            className="form-select"
            value={yAxisType}
            onChange={(e) => updateAxisType('y', e.target.value)}
          >
            <option value="logarithmic">Logaritmikus</option>
            <option value="linear">Lineáris</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={toggleExplanation} 
        className="btn btn-primary mt-3"
      >
        {showExplanation ? 'Magyarázat elrejtése' : 'Magyarázat megjelenítése'}
      </button>
      
      {showExplanation && (
        <div id="szenciklusExplanation" className="mt-3 p-3 border rounded bg-dark">
          <h3>Magyarázat</h3>
          <p>Ez a grafikon az emberi civilizáció fejlődésének felgyorsulását mutatja be, különös tekintettel az utóbbi 250 év ipari forradalmára.</p>
          <p>A görbe meredek emelkedése az ipari forradalom kezdetétől (kb. 1750) jól szemlélteti azt az elképzelést, hogy az emberiség fejlődése exponenciálisan felgyorsult a fosszilis energiahordozók intenzív használatával.</p>
          <p>Az elmélet szerint a természet által 250 millió év alatt elraktározott energia felszabadítása révén az emberiség olyan energiabőséghez jutott, ami kb. 2 milliószor gyorsabb fejlődést tett lehetővé.</p>
          <p>Ez a hirtelen gyorsulás számos területen megfigyelhető: technológiai fejlődés, népességnövekedés, gazdasági növekedés, de ugyanakkor a környezeti terhelés növekedése is.</p>
        </div>
      )}
      
      <div className="mt-5">
        <h4>Kvíz: Teszteld tudásod a civilizáció felgyorsulásáról!</h4>
        <div id="civilizationQuiz">
          {quizQuestions.map((q, index) => (
            <QuizQuestion 
              key={index} 
              questionId={index} 
              question={q.question} 
              options={q.options}
              checkAnswer={(optionIndex) => checkQuizAnswer(index, optionIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Quiz Question component
const QuizQuestion = ({ questionId, question, options, checkAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState({ shown: false, isCorrect: false, explanation: '' });
  
  const handleCheck = () => {
    if (selectedOption === null) {
      setFeedback({
        shown: true,
        isCorrect: false,
        explanation: 'Kérlek, válassz egy opciót!'
      });
      return;
    }
    
    const result = checkAnswer(selectedOption);
    setFeedback({
      shown: true,
      isCorrect: result.isCorrect,
      explanation: result.explanation
    });
  };
  
  return (
    <div className="quiz-question mb-4">
      <p className="font-weight-bold">{questionId + 1}. {question}</p>
      {options.map((option, i) => (
        <div className="form-check" key={i}>
          <input
            className="form-check-input"
            type="radio"
            name={`question${questionId}`}
            id={`q${questionId}o${i}`}
            checked={selectedOption === i}
            onChange={() => setSelectedOption(i)}
          />
          <label className="form-check-label" htmlFor={`q${questionId}o${i}`}>
            {option}
          </label>
        </div>
      ))}
      <button 
        className="btn btn-primary mt-2" 
        onClick={handleCheck}
      >
        Ellenőrzés
      </button>
      {feedback.shown && (
        <div className={`mt-2 alert ${feedback.isCorrect ? 'alert-success' : 'alert-danger'}`}>
          {feedback.isCorrect ? 'Helyes válasz!' : 'Sajnos nem helyes. Próbáld újra!'}
          <div className="mt-2">
            <strong>Magyarázat:</strong> {feedback.explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default CivilizationChart;
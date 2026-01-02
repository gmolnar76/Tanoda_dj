import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

const PopulationChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(2100);
  const [selectedYear, setSelectedYear] = useState(2020);
  const [queryType, setQueryType] = useState('total-growth');
  const [queryResult, setQueryResult] = useState('');
  const [feedback, setFeedback] = useState({ shown: false, message: '', type: '' });
  const [quizQuestion, setQuizQuestion] = useState({ question: '', answer: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState({ shown: false, message: '', correct: false });
  
  // Population data
  const populationData = [
    {
      name: 'Afrika',
      data: [
        { x: 1950, y: 0.23 }, { x: 1960, y: 0.28 }, { x: 1970, y: 0.36 }, 
        { x: 1980, y: 0.48 }, { x: 1990, y: 0.63 }, { x: 2000, y: 0.81 }, 
        { x: 2010, y: 1.04 }, { x: 2020, y: 1.34 }, { x: 2030, y: 1.69 }, 
        { x: 2040, y: 2.08 }, { x: 2050, y: 2.48 }, { x: 2060, y: 2.87 }, 
        { x: 2070, y: 3.25 }, { x: 2080, y: 3.58 }, { x: 2090, y: 3.86 }, 
        { x: 2100, y: 4.08 }
      ],
      color: 'rgba(78, 78, 78, 0.7)' // 70% átlátszó szürke
    },
    {
      name: 'Ázsia',
      data: [
        { x: 1950, y: 1.40 }, { x: 1960, y: 1.70 }, { x: 1970, y: 2.13 }, 
        { x: 1980, y: 2.63 }, { x: 1990, y: 3.21 }, { x: 2000, y: 3.71 }, 
        { x: 2010, y: 4.17 }, { x: 2020, y: 4.54 }, { x: 2030, y: 4.82 }, 
        { x: 2040, y: 5.01 }, { x: 2050, y: 5.11 }, { x: 2060, y: 5.13 }, 
        { x: 2070, y: 5.06 }, { x: 2080, y: 4.92 }, { x: 2090, y: 4.74 }, 
        { x: 2100, y: 4.54 }
      ],
      color: 'rgba(255, 215, 0, 0.7)' // 70% átlátszó arany
    },
    {
      name: 'Európa',
      data: [
        { x: 1950, y: 0.55 }, { x: 1960, y: 0.61 }, { x: 1970, y: 0.66 }, 
        { x: 1980, y: 0.69 }, { x: 1990, y: 0.72 }, { x: 2000, y: 0.73 }, 
        { x: 2010, y: 0.74 }, { x: 2020, y: 0.74 }, { x: 2030, y: 0.73 }, 
        { x: 2040, y: 0.72 }, { x: 2050, y: 0.71 }, { x: 2060, y: 0.69 }, 
        { x: 2070, y: 0.68 }, { x: 2080, y: 0.67 }, { x: 2090, y: 0.66 }, 
        { x: 2100, y: 0.65 }
      ],
      color: 'rgba(65, 105, 225, 0.7)' // kék
    },
    {
      name: 'Észak-Amerika',
      data: [
        { x: 1950, y: 0.17 }, { x: 1960, y: 0.20 }, { x: 1970, y: 0.23 }, 
        { x: 1980, y: 0.25 }, { x: 1990, y: 0.28 }, { x: 2000, y: 0.31 }, 
        { x: 2010, y: 0.34 }, { x: 2020, y: 0.37 }, { x: 2030, y: 0.39 }, 
        { x: 2040, y: 0.41 }, { x: 2050, y: 0.43 }, { x: 2060, y: 0.44 }, 
        { x: 2070, y: 0.45 }, { x: 2080, y: 0.46 }, { x: 2090, y: 0.47 }, 
        { x: 2100, y: 0.48 }
      ],
      color: 'rgba(220, 20, 60, 0.7)' // piros
    },
    {
      name: 'Dél- és Közép-Amerika',
      data: [
        { x: 1950, y: 0.17 }, { x: 1960, y: 0.22 }, { x: 1970, y: 0.29 }, 
        { x: 1980, y: 0.36 }, { x: 1990, y: 0.44 }, { x: 2000, y: 0.52 }, 
        { x: 2010, y: 0.59 }, { x: 2020, y: 0.65 }, { x: 2030, y: 0.70 }, 
        { x: 2040, y: 0.73 }, { x: 2050, y: 0.75 }, { x: 2060, y: 0.76 }, 
        { x: 2070, y: 0.76 }, { x: 2080, y: 0.75 }, { x: 2090, y: 0.73 }, 
        { x: 2100, y: 0.71 }
      ],
      color: 'rgba(50, 205, 50, 0.7)' // zöld
    },
    {
      name: 'Ausztrália és Óceánia',
      data: [
        { x: 1950, y: 0.01 }, { x: 1960, y: 0.02 }, { x: 1970, y: 0.02 }, 
        { x: 1980, y: 0.02 }, { x: 1990, y: 0.03 }, { x: 2000, y: 0.03 }, 
        { x: 2010, y: 0.04 }, { x: 2020, y: 0.04 }, { x: 2030, y: 0.05 }, 
        { x: 2040, y: 0.05 }, { x: 2050, y: 0.06 }, { x: 2060, y: 0.06 }, 
        { x: 2070, y: 0.06 }, { x: 2080, y: 0.07 }, { x: 2090, y: 0.07 }, 
        { x: 2100, y: 0.07 }
      ],
      color: 'rgba(139, 69, 19, 0.7)' // barna
    }
  ];

  useEffect(() => {
    // Create population chart when component mounts
    createChart();

    // Clean up when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  // Effect to update chart when year range changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.options.scales.x.min = startYear;
      chartInstance.current.options.scales.x.max = endYear;
      chartInstance.current.update();
    }
  }, [startYear, endYear]);

  const createChart = () => {
    const ctx = chartRef.current.getContext('2d');

    // Prepare datasets for Chart.js
    const datasets = populationData.map(region => ({
      label: region.name,
      data: region.data,
      backgroundColor: region.color,
      borderColor: region.color.replace('0.7', '1'),
      borderWidth: 1,
      fill: true,
      pointRadius: 0
    }));

    // Create Chart.js instance
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'A világ népessége régiók szerint 1950-2010 (tény) 2011-2100 (2010. évi ENSZ előreszámítás, közepes változat)',
            color: '#e0e0e0',
            font: { size: 14 }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' milliárd fő';
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#e0e0e0',
              boxWidth: 12,
              padding: 10
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            min: startYear,
            max: endYear,
            ticks: {
              stepSize: 10,
              color: '#39FF14'
            },
            grid: {
              color: '#4ecca3'
            },
            title: {
              display: true,
              text: 'Év',
              color: '#39FF14'
            }
          },
          y: {
            beginAtZero: true,
            max: 12,
            ticks: {
              color: '#39FF14'
            },
            grid: {
              color: '#4ecca3'
            },
            title: {
              display: true,
              text: 'Milliárd fő',
              color: '#39FF14'
            },
            stacked: true
          }
        },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const datasetIndex = elements[0].datasetIndex;
            const index = elements[0].index;
            const region = populationData[datasetIndex].name;
            const year = populationData[datasetIndex].data[index].x;
            const population = populationData[datasetIndex].data[index].y;
            updateQuizByRegionAndYear(region, year, population);
          }
        }
      }
    });
  };

  // Helper function to get data for a specific year
  const getDataForYear = (year) => {
    return populationData.map(region => {
      const dataPoint = region.data.find(point => point.x === year);
      return dataPoint ? dataPoint.y : 0;
    });
  };

  // Calculate total population for a year
  const getTotalPopulationForYear = (year) => {
    return getDataForYear(year).reduce((sum, value) => sum + value, 0);
  };

  // Update chart based on year range
  const updateChart = () => {
    if (chartInstance.current) {
      chartInstance.current.options.scales.x.min = startYear;
      chartInstance.current.options.scales.x.max = endYear;
      chartInstance.current.update();
    }
  };

  // Run query based on selected type
  const runQuery = () => {
    let result = 0;

    switch(queryType) {
      case 'total-growth':
        result = getTotalPopulationForYear(endYear) - getTotalPopulationForYear(startYear);
        setQueryResult(`Teljes növekedés: ${result.toFixed(2)} milliárd fő`);
        break;
      case 'average-growth-rate':
        const startPop = getTotalPopulationForYear(startYear);
        const endPop = getTotalPopulationForYear(endYear);
        const years = endYear - startYear;
        result = Math.pow(endPop / startPop, 1/years) - 1;
        setQueryResult(`Átlagos éves növekedési ráta: ${(result * 100).toFixed(2)}%`);
        break;
      case 'total-population':
        result = getTotalPopulationForYear(endYear);
        setQueryResult(`Népesség: ${result.toFixed(2)} milliárd fő`);
        break;
      case 'projected-population-2100':
        result = getTotalPopulationForYear(2100);
        setQueryResult(`Előrejelzett népesség 2100-ban: ${result.toFixed(2)} milliárd fő`);
        break;
    }
  };

  // Update chart by selected year (from slider)
  const updateChartByYear = (year) => {
    if (chartInstance.current) {
      chartInstance.current.options.scales.x.max = year;
      chartInstance.current.update();
    }
    setSelectedYear(year);
    updateQuizByYear(year);
  };

  // Update quiz based on region and year
  const updateQuizByRegionAndYear = (region, year, population) => {
    const question = `Mennyi volt ${region} népessége ${year}-ben?`;
    const answer = `${population.toFixed(2)} milliárd`;
    setQuizQuestion({ question, answer });
    setUserAnswer('');
    setQuizFeedback({ shown: false, message: '', correct: false });
  };

  // Update quiz based on year
  const updateQuizByYear = (year) => {
    const totalPopulation = getTotalPopulationForYear(year);
    const question = `Mennyi volt a világ össznépessége ${year}-ben?`;
    const answer = `${totalPopulation.toFixed(2)} milliárd`;
    setQuizQuestion({ question, answer });
    setUserAnswer('');
    setQuizFeedback({ shown: false, message: '', correct: false });
  };

  // Check quiz answer
  const checkQuizAnswer = () => {
    if (userAnswer.toLowerCase() === quizQuestion.answer.toLowerCase()) {
      setQuizFeedback({ 
        shown: true, 
        message: '<div class="alert alert-success">Helyes válasz!</div>', 
        correct: true 
      });
    } else {
      setQuizFeedback({ 
        shown: true, 
        message: `<div class="alert alert-danger">Sajnos nem helyes. A helyes válasz: ${quizQuestion.answer}</div>`, 
        correct: false 
      });
    }
  };

  // Handle user feedback (like/dislike)
  const handleFeedback = (isPositive) => {
    setFeedback({ 
      shown: true, 
      message: isPositive ? 
        'Köszönjük a pozitív visszajelzést!' : 
        'Köszönjük a visszajelzést! Igyekszünk javítani a grafikonon.',
      type: isPositive ? 'success' : 'warning'
    });
    
    setTimeout(() => {
      setFeedback({ shown: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="container-fluid mt-4 p-0">
      <h3 className="mb-4">A világ népessége régiók szerint 1950-2100</h3>
      
      <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
        <canvas ref={chartRef}></canvas>
      </div>
      
      <div className="mt-3">Forrás: ENSZ előreszámítás, közepes változat (2010)</div>
      
      <div className="mt-4">
        <label htmlFor="time-range-selector" className="form-label">Időszak kiválasztása: {selectedYear}</label>
        <input 
          type="range" 
          className="form-range" 
          id="time-range-selector" 
          min="1950" 
          max="2100" 
          step="10" 
          value={selectedYear}
          onChange={(e) => updateChartByYear(parseInt(e.target.value))}
        />
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div id="date-range-selector" className="d-flex align-items-center">
            <input 
              type="number" 
              min="1950" 
              max="2100" 
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              className="form-control"
            />
            <span className="mx-2">-</span>
            <input 
              type="number" 
              min="1950" 
              max="2100" 
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value))}
              className="form-control"
            />
            <button 
              className="btn btn-outline-primary ms-2" 
              title="Frissítés"
              onClick={updateChart}
            >
              <i className="bi bi-yin-yang"></i>
            </button>
          </div>
        </div>
        
        <div className="col-md-6">
          <h4>Lekérdezés</h4>
          <div className="query-container d-flex">
            <select 
              className="form-control"
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
            >
              <option value="total-growth">Teljes növekedés</option>
              <option value="average-growth-rate">Átlagos növekedési ráta</option>
              <option value="total-population">Teljes népesség</option>
              <option value="projected-population-2100">Előrejelzett népesség 2100-ban</option>
            </select>
            <button 
              className="btn btn-outline-primary ms-2" 
              title="Lekérdezés futtatása"
              onClick={runQuery}
            >
              <i className="bi bi-yin-yang"></i>
            </button>
          </div>
          {queryResult && <div className="mt-2">{queryResult}</div>}
        </div>
      </div>

      <div className="feedback-container mt-4">
        <h4>Mennyire volt könnyű vagy nehéz a grafikon leolvasása?</h4>
        <div className="feedback-icons">
          <i 
            className="bi bi-hand-thumbs-up" 
            title="Könnyű volt"
            onClick={() => handleFeedback(true)}
            style={{ fontSize: "24px", marginRight: "15px", cursor: "pointer" }}
          ></i>
          <i 
            className="bi bi-hand-thumbs-down" 
            title="Nehéz volt"
            onClick={() => handleFeedback(false)}
            style={{ fontSize: "24px", cursor: "pointer" }}
          ></i>
        </div>
        {feedback.shown && (
          <p className="mt-2 alert alert-{feedback.type}">{feedback.message}</p>
        )}
      </div>
      
      <div className="row mt-5">
        <div className="col-12">
          <h3>Népesség Kvíz</h3>
          <div className="mt-3">
            {quizQuestion.question && (
              <>
                <p><strong>Kérdés:</strong> {quizQuestion.question}</p>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Add meg a választ"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkQuizAnswer()}
                />
                <button 
                  onClick={checkQuizAnswer} 
                  className="btn btn-primary mt-2"
                >
                  Ellenőrzés
                </button>
                {quizFeedback.shown && (
                  <div 
                    className="mt-2" 
                    dangerouslySetInnerHTML={{ __html: quizFeedback.message }}
                  ></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopulationChart;
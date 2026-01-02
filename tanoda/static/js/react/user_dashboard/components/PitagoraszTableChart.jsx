import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

// Chart.js komponensek és plugin regisztrálása
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

// Pitagorasz tábla (szorzótábla) hőtérkép komponens
const PitagoraszTableChart = ({ size = 10 }) => {
  // Adatok előkészítése a szorzótáblához (1-10)
  const matrix = [];
  const xLabels = [];
  const yLabels = [];
  
  // Címkék generálása (1-től size-ig)
  for (let i = 1; i <= size; i++) {
    xLabels.push(i.toString());
    yLabels.push(i.toString());
  }
  
  // Szorzótábla mátrix létrehozása
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push((i + 1) * (j + 1)); // Szorzás értéke (1-indexelt)
    }
    matrix.push(row);
  }
  
  // Adatok előkészítése a Chart.js számára
  const datasets = [];
  const data = [];
  
  // Színskála a szorzástábla értékekhez
  const getColor = (value) => {
    // Maximum érték a mátrixban: size * size
    const maxValue = size * size;
    // Normalizált érték 0-1 között
    const normalizedValue = value / maxValue;
    
    // Színskála: kéktől (alacsony) narancson át pirosig (magas)
    let r, g, b;
    
    if (normalizedValue < 0.33) {
      // Kék -> zöld átmenet (0-0.33)
      const ratio = normalizedValue * 3;
      r = Math.round(0);
      g = Math.round(ratio * 255);
      b = Math.round(255 * (1 - ratio));
    } else if (normalizedValue < 0.66) {
      // Zöld -> sárga átmenet (0.33-0.66)
      const ratio = (normalizedValue - 0.33) * 3;
      r = Math.round(ratio * 255);
      g = Math.round(255);
      b = Math.round(0);
    } else {
      // Sárga -> piros átmenet (0.66-1.0)
      const ratio = (normalizedValue - 0.66) * 3;
      r = Math.round(255);
      g = Math.round(255 * (1 - ratio));
      b = Math.round(0);
    }
    
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };
  
  // Adatpontok generálása a szorzótáblához
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = matrix[y][x];
      const color = getColor(value);
      
      data.push({
        x: x,
        y: y,
        value: value,
        backgroundColor: color,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        pointRadius: 20, // Fix méretű pontok
        pointHoverRadius: 25, // Kicsit nagyobb hover állapotban
      });
    }
  }
  
  datasets.push({
    label: 'Szorzás eredmények',
    data: data,
    backgroundColor: data.map(item => item.backgroundColor),
    borderColor: data.map(item => item.borderColor),
    borderWidth: data.map(item => item.borderWidth),
    pointRadius: data.map(item => item.pointRadius),
    pointHoverRadius: data.map(item => item.pointHoverRadius),
  });
  
  // Chart.js konfiguráció
  const chartData = {
    datasets: datasets,
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const point = context[0];
            const xValue = parseInt(xLabels[point.parsed.x]);
            const yValue = parseInt(yLabels[point.parsed.y]);
            return `${yValue} × ${xValue}`;
          },
          label: function(context) {
            const value = context.raw.value;
            return `Eredmény: ${value}`;
          }
        },
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: -0.5,
        max: size - 0.5,
        ticks: {
          callback: function(value) {
            return value >= 0 && value < size ? xLabels[value] : '';
          },
          stepSize: 1,
          font: {
            weight: 'bold',
          },
        },
        title: {
          display: true,
          text: 'Szorzó',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)',
        }
      },
      y: {
        type: 'linear',
        min: -0.5,
        max: size - 0.5,
        reverse: true, // Fordított y tengely, hogy az (1,1) legyen a bal felső sarokban
        ticks: {
          callback: function(value) {
            return value >= 0 && value < size ? yLabels[value] : '';
          },
          stepSize: 1,
          font: {
            weight: 'bold',
          },
        },
        title: {
          display: true,
          text: 'Szorzandó',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)',
        }
      }
    }
  };
  
  return (
    <div>
      <div style={{ height: '450px', position: 'relative' }}>
        <Scatter data={chartData} options={options} />
      </div>
      <div className="mt-3 text-center">
        <h6 className="small text-muted">Színskála magyarázat</h6>
        <div className="d-flex justify-content-center">
          <div style={{ 
            width: '80%', 
            height: '20px', 
            background: 'linear-gradient(to right, blue, green, yellow, red)',
            borderRadius: '4px',
            marginBottom: '8px',
          }}></div>
        </div>
        <div className="d-flex justify-content-between" style={{ width: '80%', margin: '0 auto' }}>
          <span className="small">Kisebb érték</span>
          <span className="small">Nagyobb érték</span>
        </div>
        <p className="small text-muted mt-3">
          A Pitagorasz tábla (szorzótábla) vizuális megjelenítése hőtérképként.
          Kattints egy cellára a pontos szorzási művelet és eredmény megtekintéséhez!
        </p>
      </div>
    </div>
  );
};

export default PitagoraszTableChart;
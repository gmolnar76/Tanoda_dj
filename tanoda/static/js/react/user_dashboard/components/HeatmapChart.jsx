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

// Heatmap komponens a hibák megjelenítésére
const HeatmapChart = ({ matrix = [[]], xLabels = [], yLabels = [] }) => {
  // Adatok előkészítése
  const datasets = [];
  const colors = [
    'rgba(0, 255, 0, 0.1)',
    'rgba(255, 255, 0, 0.2)',
    'rgba(255, 128, 0, 0.4)',
    'rgba(255, 0, 0, 0.6)',
    'rgba(128, 0, 0, 0.8)'
  ];
  
  const data = [];
  
  // Adatok átalakítása scatter diagramhoz
  if (matrix.length > 0 && matrix[0].length > 0) {
    let maxValue = 0;
    
    // Maximális érték meghatározása a skálázáshoz
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] > maxValue) {
          maxValue = matrix[y][x];
        }
      }
    }
    
    // Pontok generálása
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const value = matrix[y][x];
        
        if (value > 0) {
          // Színintenzitás a hiba gyakorisága alapján
          const colorIndex = Math.min(colors.length - 1, Math.floor(value / maxValue * colors.length));
          
          data.push({
            x: x,
            y: y,
            value: value,
            backgroundColor: colors[colorIndex],
            pointRadius: 15 + (value / maxValue) * 20, // Buborékméret
          });
        }
      }
    }
  } else {
    // Ha nincs adat, csak egy placeholder pontot adunk hozzá
    data.push({
      x: 0,
      y: 0,
      value: 0,
      backgroundColor: colors[0],
      pointRadius: 15,
    });
  }

  datasets.push({
    label: 'Hibák száma',
    data: data,
    backgroundColor: data.map(item => item.backgroundColor),
    pointRadius: data.map(item => item.pointRadius),
    pointHoverRadius: data.map(item => item.pointRadius + 5),
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
            const xLabel = xLabels[point.parsed.x];
            const yLabel = yLabels[point.parsed.y];
            return `${yLabel} × ${xLabel}`;
          },
          label: function(context) {
            const value = context.raw.value;
            return `Hibák száma: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: -0.5,
        max: xLabels.length - 0.5,
        ticks: {
          callback: function(value) {
            return value >= 0 && value < xLabels.length ? xLabels[value] : '';
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Szorzó'
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)',
        }
      },
      y: {
        type: 'linear',
        min: -0.5,
        max: yLabels.length - 0.5,
        reverse: true, // Fordított y tengely, hogy a (0,0) legyen felül
        ticks: {
          callback: function(value) {
            return value >= 0 && value < yLabels.length ? yLabels[value] : '';
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Szorzandó'
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)',
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Scatter data={chartData} options={options} />
      <div className="mt-3 text-center">
        <h6 className="small text-muted">Jelmagyarázat</h6>
        <div className="d-flex justify-content-center">
          <div className="d-flex align-items-center mx-2">
            <div style={{ width: '15px', height: '15px', backgroundColor: 'rgba(0, 255, 0, 0.1)', borderRadius: '50%', marginRight: '5px' }}></div>
            <span className="small">Kevés hiba</span>
          </div>
          <div className="d-flex align-items-center mx-2">
            <div style={{ width: '15px', height: '15px', backgroundColor: 'rgba(255, 255, 0, 0.2)', borderRadius: '50%', marginRight: '5px' }}></div>
            <span className="small">Közepes gyakoriság</span>
          </div>
          <div className="d-flex align-items-center mx-2">
            <div style={{ width: '25px', height: '25px', backgroundColor: 'rgba(255, 0, 0, 0.6)', borderRadius: '50%', marginRight: '5px' }}></div>
            <span className="small">Sok hiba</span>
          </div>
        </div>
        <p className="small text-muted mt-2">
          A buborékok mérete és színe a hibák gyakoriságát jelzi.
          A nagyobb, pirosabb buborékok jelzik azokat a szorzásokat, ahol több hibát vétesz.
        </p>
      </div>
    </div>
  );
};

export default HeatmapChart;
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

// Heatmap komponens
const HeatmapChart = ({ matrix = [[]], xLabels = [], yLabels = [] }) => {
  // Adatok előkészítése
  const datasets = [];
  const colors = [
    'rgba(0, 0, 255, 0.1)', // kék - legalacsonyabb érték
    'rgba(0, 255, 255, 0.3)',
    'rgba(0, 255, 0, 0.5)',
    'rgba(255, 255, 0, 0.7)',
    'rgba(255, 0, 0, 0.9)', // piros - legmagasabb érték
  ];

  // Hőtérkép adatok előkészítése scatter plothoz
  const data = [];
  const maxValue = Math.max(...matrix.flat());

  // Ha vannak értékek a mátrixban
  if (maxValue > 0) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const value = matrix[y][x];
        if (value > 0) {
          // A színt a hiba gyakorisága alapján választjuk
          const colorIndex = Math.min(Math.floor((value / maxValue) * colors.length), colors.length - 1);
          
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
            return `${xLabel} × ${yLabel}`;
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
    </div>
  );
};

export default HeatmapChart;
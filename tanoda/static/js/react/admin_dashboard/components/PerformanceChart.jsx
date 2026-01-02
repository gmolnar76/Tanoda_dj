import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js komponensek regisztrálása
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceChart = ({ levels = [], values = [] }) => {
  // Ha nincsenek adatok, alapértelmezett értékek
  const chartLevels = levels.length > 0 ? levels : ['Nincs adat'];
  const chartValues = values.length > 0 ? values : [0];

  const data = {
    labels: chartLevels,
    datasets: [
      {
        label: 'Teljesítési arány (%)',
        data: chartValues,
        backgroundColor: 'rgba(26, 118, 255, 0.8)',
        borderColor: 'rgba(26, 118, 255, 1)',
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `Nehézségi szint: ${context[0].label}`;
          },
          label: function(context) {
            return `Teljesítési arány: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Nehézségi szint',
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Teljesítési arány (%)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default PerformanceChart;
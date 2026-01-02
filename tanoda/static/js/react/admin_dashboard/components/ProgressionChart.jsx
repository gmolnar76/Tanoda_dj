import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Chart.js komponensek regisztrálása
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressionChart = ({ dates = [], values = [] }) => {
  // Ha nincsenek adatok, alapértelmezett értékek
  const chartDates = dates.length > 0 ? dates : ['Nincs adat'];
  const chartValues = values.length > 0 ? values : [0];

  const data = {
    labels: chartDates,
    datasets: [
      {
        label: 'Fejlődési trend',
        data: chartValues,
        fill: true,
        backgroundColor: 'rgba(0, 177, 106, 0.2)',
        borderColor: 'rgb(0, 177, 106)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(0, 177, 106)',
        pointRadius: 4,
        pointHoverRadius: 6,
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
            return `Dátum: ${context[0].label}`;
          },
          label: function(context) {
            return `Teljesítmény: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Idő',
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
          text: 'Teljesítmény (%)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ProgressionChart;
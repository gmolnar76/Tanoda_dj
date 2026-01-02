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
} from 'chart.js';

// Chart.js komponensek regisztrálása
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ActivityChart = ({ dates = [], values = [] }) => {
  // Ha nincsenek adatok, alapértelmezett értékek
  const chartDates = dates.length > 0 ? dates : ['Nincs adat'];
  const chartValues = values.length > 0 ? values : [0];

  const data = {
    labels: chartDates,
    datasets: [
      {
        label: 'Napi aktivitás',
        data: chartValues,
        fill: false,
        backgroundColor: 'rgb(78, 204, 163)',
        borderColor: 'rgba(78, 204, 163, 0.7)',
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: 'rgb(78, 204, 163)',
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
            return `Aktivitások száma: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dátum',
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Aktivitások száma',
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

export default ActivityChart;
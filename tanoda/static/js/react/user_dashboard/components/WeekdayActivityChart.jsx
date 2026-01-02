import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.js komponensek regisztrálása
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const WeekdayActivityChart = ({ data = [0, 0, 0, 0, 0, 0, 0] }) => {
  // Adatok előkészítése
  const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  const backgroundColors = [
    'rgba(54, 162, 235, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(255, 99, 132, 0.7)',
    'rgba(255, 205, 86, 0.7)',
    'rgba(201, 203, 207, 0.7)'
  ];
  
  const borderColors = [
    'rgb(54, 162, 235)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(255, 99, 132)',
    'rgb(255, 205, 86)',
    'rgb(201, 203, 207)'
  ];

  const chartData = {
    labels: dayNames,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Top napok meghatározása
  const topDayIndex = data.indexOf(Math.max(...data));
  const topDay = dayNames[topDayIndex];
  const hasData = data.some(value => value > 0);

  return (
    <div style={{ height: '300px' }}>
      <Pie data={chartData} options={options} />
      {hasData ? (
        <p className="text-center mt-3 small text-muted">
          Legaktívabb napod: <strong>{topDay}</strong>
        </p>
      ) : (
        <p className="text-center mt-3 small text-muted">
          Még nincs elegendő adat az aktivitási minta meghatározásához.
        </p>
      )}
    </div>
  );
};

export default WeekdayActivityChart;
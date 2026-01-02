import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  BarElement
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

// Chart.js komponensek regisztrálása
ChartJS.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Title,
  annotationPlugin
);

// 2D koordináta grafikon komponens a téglalap felszínének ábrázolására
const ScatterChart2D = ({ data = [], title = '2D Koordináta Rendszer', xAxisLabel = 'Szélesség', yAxisLabel = 'Magasság' }) => {
  const chartRef = useRef(null);

  // Példa téglalapok alapértelmezetten
  const rectangles = [
    { width: 2, height: 3 },
    { width: 4, height: 2 },
    { width: 5, height: 5 },
    { width: 3, height: 6 },
    { width: 7, height: 3 }
  ];
  
  // Téglalapok adatainak generálása
  const generateRectData = () => {
    return rectangles.map(rect => ({
      x: rect.width / 2,  // A téglalap középpontja x-tengelyen
      y: rect.height / 2, // A téglalap középpontja y-tengelyen
      width: rect.width,  // A téglalap szélessége
      height: rect.height, // A téglalap magassága
      area: rect.width * rect.height // A téglalap területe
    }));
  };

  const rectData = data.length > 0 ? data : generateRectData();

  // Színek generálása
  const getColorForRectangle = (area, maxArea) => {
    const normalizedArea = area / maxArea;
    let r, g, b;
    
    if (normalizedArea < 0.33) {
      // Világoskék -> zöld átmenet
      r = Math.round(100 * (1 - normalizedArea * 3));
      g = Math.round(100 + normalizedArea * 3 * 155);
      b = Math.round(255 * (1 - normalizedArea * 2));
    } else if (normalizedArea < 0.66) {
      // Zöld -> sárga átmenet
      r = Math.round((normalizedArea - 0.33) * 3 * 255);
      g = Math.round(200);
      b = Math.round(50);
    } else {
      // Sárga -> piros átmenet
      r = Math.round(255);
      g = Math.round(200 * (1 - (normalizedArea - 0.66) * 3));
      b = Math.round(50 * (1 - (normalizedArea - 0.66) * 3));
    }
    
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    
    // Canvas kontextus megszerzése az annotációkhoz
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const scales = chart.scales;
    
    // Az eredeti rajzolási metódust elmentjük
    const originalDraw = chart.draw;
    
    // Felülírjuk a rajzolási metódust, hogy téglalapokat is rajzolhasson
    chart.draw = function() {
      originalDraw.apply(this, arguments);
      
      if (!chartArea) return;
      
      // A legnagyobb téglalap területe a színskálázáshoz
      const maxArea = Math.max(...rectData.map(rect => rect.area));
      
      // Téglalapok rajzolása
      rectData.forEach(rect => {
        const x = scales.x.getPixelForValue(rect.x - rect.width/2); // bal szél
        const y = scales.y.getPixelForValue(rect.y + rect.height/2); // felső szél
        const width = scales.x.getPixelForValue(rect.x + rect.width/2) - x; // szélesség pixelben
        const height = scales.y.getPixelForValue(rect.y - rect.height/2) - y; // magasság pixelben
        
        const color = getColorForRectangle(rect.area, maxArea);
        
        // Téglalap rajzolása
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // Terület értékének kiírása a téglalap közepére
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`T: ${rect.area}`, x + width/2, y + height/2);
        
        // A téglalap méretének kiírása
        ctx.font = '10px Arial';
        ctx.fillText(`${rect.width}×${rect.height}`, x + width/2, y + height/2 + 15);
        
        ctx.restore();
      });
    };
  }, [rectData]);

  // Adatok előkészítése a scatter plot számára (ez csak a pontokat jelöli, a téglalapokat külön rajzoljuk)
  const chartData = {
    datasets: [{
      label: 'Téglalap középpontok',
      data: rectData.map(rect => ({
        x: rect.x,
        y: rect.y,
      })),
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      pointRadius: 0, // Nem jelenítjük meg a pontokat
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Téglalapok/Négyzetek területe',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            const rect = rectData[index];
            return `Téglalap: ${rect.width} × ${rect.height}`;
          },
          label: function(context) {
            const index = context.dataIndex;
            const rect = rectData[index];
            return `Terület: ${rect.area} egység²`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: xAxisLabel,
          font: {
            weight: 'bold'
          }
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          font: {
            weight: 'bold'
          }
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
  };

  return (
    <div style={{ height: '500px', position: 'relative' }}>
      <Chart type="scatter" data={chartData} options={options} ref={chartRef} />
      <div className="mt-3 text-center">
        <h6 className="small text-muted">Színskála magyarázat</h6>
        <div className="d-flex justify-content-center">
          <div style={{ 
            width: '80%', 
            height: '20px', 
            background: 'linear-gradient(to right, rgba(100, 100, 255, 0.7), rgba(100, 255, 100, 0.7), rgba(255, 200, 50, 0.7), rgba(255, 50, 50, 0.7))',
            borderRadius: '4px',
            marginBottom: '8px',
          }}></div>
        </div>
        <div className="d-flex justify-content-between" style={{ width: '80%', margin: '0 auto' }}>
          <span className="small">Kisebb terület</span>
          <span className="small">Nagyobb terület</span>
        </div>
        <p className="text-muted small mt-3">
          A 2D koordináta rendszer téglalapok/négyzetek területét ábrázolja.
          A téglalapok színe a területük nagyságát jelzi: a világoskéktől (kis terület) a piroson át (nagy terület).
        </p>
      </div>
    </div>
  );
};

export default ScatterChart2D;
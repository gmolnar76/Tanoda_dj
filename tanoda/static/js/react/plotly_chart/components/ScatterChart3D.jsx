import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// 3D koordináta rendszer implementálása térbeli alakzatok ábrázolására
const ScatterChart3D = ({ data = [], title = '3D Koordináta Rendszer' }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  // Alapértelmezett térbeli alakzatok (téglatestetek/kockák)
  const defaultCuboids = [
    { width: 2, height: 3, depth: 4 },
    { width: 3, height: 3, depth: 3 },
    { width: 5, height: 2, depth: 2 },
    { width: 4, height: 4, depth: 2 },
    { width: 2, height: 5, depth: 3 }
  ];
  
  // Térbeli alakzatok adatainak generálása
  const generateCuboidData = () => {
    return defaultCuboids.map(cuboid => ({
      x: cuboid.width,
      y: cuboid.height,
      z: cuboid.depth,
      volume: cuboid.width * cuboid.height * cuboid.depth,
      isometric: generateIsometricPoints(cuboid)
    }));
  };
  
  // Izometrikus projekcióhoz pontok generálása
  const generateIsometricPoints = (cuboid) => {
    // Izometrikus pontok - egy téglatest 8 csúcsa
    const corners = [
      { x: 0, y: 0, z: 0 },
      { x: cuboid.width, y: 0, z: 0 },
      { x: cuboid.width, y: cuboid.height, z: 0 },
      { x: 0, y: cuboid.height, z: 0 },
      { x: 0, y: 0, z: cuboid.depth },
      { x: cuboid.width, y: 0, z: cuboid.depth },
      { x: cuboid.width, y: cuboid.height, z: cuboid.depth },
      { x: 0, y: cuboid.height, z: cuboid.depth }
    ];
    
    // Izometrikus vetítés
    // (izometrikus koordinátákra konvertálunk)
    const iso_scale = 0.5;  // Skálázási faktor
    const iso_corners = corners.map(point => {
      return {
        // Izometrikus konverzió: x-tengely és y-tengely 30 fokkal elforgatva
        iso_x: iso_scale * (point.x - point.z) * Math.cos(Math.PI / 6),
        iso_y: iso_scale * (point.y - (point.x + point.z) * Math.sin(Math.PI / 6)),
        point: point
      };
    });
    
    // Élek definíciója a kocka sarokpontjai között
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // alsó négyzet
      [4, 5], [5, 6], [6, 7], [7, 4], // felső négyzet
      [0, 4], [1, 5], [2, 6], [3, 7]  // oszlopok
    ];
    
    // Látható felületek (csak az elöl lévőket definiáljuk)
    const visible_faces = [
      [0, 1, 2, 3], // alap
      [0, 1, 5, 4], // elülső 
      [1, 2, 6, 5]  // jobb oldali
    ];
    
    return {
      corners: iso_corners,
      edges: edges,
      faces: visible_faces
    };
  };
  
  const cuboidData = data.length > 0 ? data : generateCuboidData();
  
  useEffect(() => {
    // Ha már van chart instance, akkor megsemmisítjük
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Z értékek tartománya a színskálához (térfogatok)
    const volumes = cuboidData.map(cuboid => cuboid.volume);
    const minVolume = Math.min(...volumes);
    const maxVolume = Math.max(...volumes);
    
    // Színskála funkció a térfogat értékekhez
    const getColor = (volume, alpha = 1) => {
      // Normalizált érték 0-1 között
      const normalizedVolume = (volume - minVolume) / (maxVolume - minVolume || 1);
      
      let r, g, b;
      
      if (normalizedVolume < 0.33) {
        // Kék -> zöld átmenet
        const ratio = normalizedVolume * 3;
        r = Math.round(50 * (1 - normalizedVolume * 3));
        g = Math.round(100 + ratio * 155);
        b = Math.round(200);
      } else if (normalizedVolume < 0.66) {
        // Zöld -> sárga átmenet
        const ratio = (normalizedVolume - 0.33) * 3;
        r = Math.round(ratio * 255);
        g = Math.round(200);
        b = Math.round(200 * (1 - ratio));
      } else {
        // Sárga -> piros átmenet
        const ratio = (normalizedVolume - 0.66) * 3;
        r = Math.round(255);
        g = Math.round(200 * (1 - ratio));
        b = Math.round(50);
      }
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Adatpontok előkészítése
    const datasets = [
      // Buborék adatkészlet a térfogatok megjelenítéséhez
      {
        label: 'Téglatest térfogatok',
        data: cuboidData.map(cuboid => ({
          x: cuboid.x,          // szélesség
          y: cuboid.y,          // magasság
          r: Math.pow(cuboid.volume, 1/3) * 4  // Buborék mérete (térfogat köbgyöke alapján)
        })),
        backgroundColor: cuboidData.map(cuboid => getColor(cuboid.volume, 0.6)),
        borderColor: cuboidData.map(cuboid => getColor(cuboid.volume, 0.8)),
        borderWidth: 1,
      }
    ];
    
    // Chart létrehozása
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Szélesség (a)',
              font: {
                weight: 'bold'
              }
            },
            min: 0,
            max: 8,
            ticks: {
              stepSize: 1
            }
          },
          y: {
            title: {
              display: true,
              text: 'Magasság (b)',
              font: {
                weight: 'bold'
              }
            },
            min: 0,
            max: 8,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: title || 'Téglatest térfogatok',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const index = context[0].dataIndex;
                const cuboid = cuboidData[index];
                return `Téglatest: ${cuboid.x} × ${cuboid.y} × ${cuboid.z}`;
              },
              label: function(context) {
                const index = context.dataIndex;
                const cuboid = cuboidData[index];
                return [
                  `Szélesség: ${cuboid.x} egység`,
                  `Magasság: ${cuboid.y} egység`,
                  `Mélység: ${cuboid.z} egység`,
                  `Térfogat: ${cuboid.volume} egység³`
                ];
              }
            }
          },
          subtitle: {
            display: true,
            text: 'A buborékok mérete a testek térfogatával arányos',
            position: 'bottom',
            font: {
              size: 12
            },
            padding: {
              bottom: 10
            }
          }
        }
      },
      plugins: [
        {
          id: 'cuboidDrawer',
          beforeDatasetDraw: function(chart) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            
            // Izometrikus téglatest rajzoló
            cuboidData.forEach(cuboid => {
              // Képernyő kordinátákra konvertáljuk az izometrikus pontokat
              const screenCorners = cuboid.isometric.corners.map(corner => {
                const x = xScale.getPixelForValue(cuboid.x / 2) + corner.iso_x * 30;
                const y = yScale.getPixelForValue(cuboid.y / 2) - corner.iso_y * 30;
                return { x, y, point: corner.point };
              });
              
              // Látható felületek rajzolása
              ctx.save();
              
              // Három látható felület rajzolása különböző árnyalatokkal
              const baseColor = getColor(cuboid.volume);
              const faceColors = [
                baseColor.replace(/[\d.]+\)$/g, '0.7)'),  // Felső felület
                baseColor.replace(/[\d.]+\)$/g, '0.5)'),  // Elülső felület
                baseColor.replace(/[\d.]+\)$/g, '0.3)')   // Oldalsó felület
              ];
              
              // Felületek rajzolása
              cuboid.isometric.faces.forEach((face, i) => {
                ctx.beginPath();
                ctx.fillStyle = faceColors[i];
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                
                face.forEach((cornerIdx, j) => {
                  const corner = screenCorners[cornerIdx];
                  if (j === 0) ctx.moveTo(corner.x, corner.y);
                  else ctx.lineTo(corner.x, corner.y);
                });
                
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              });
              
              // Térfogat kiírása a test közepére
              const centerX = xScale.getPixelForValue(cuboid.x / 2);
              const centerY = yScale.getPixelForValue(cuboid.y / 2) - 15;
              
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.font = 'bold 12px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`V: ${cuboid.volume}`, centerX, centerY);
              
              // Méretek kiírása
              ctx.font = '10px Arial';
              ctx.fillText(`${cuboid.x}×${cuboid.y}×${cuboid.z}`, centerX, centerY + 15);
              
              ctx.restore();
            });
          }
        }
      ]
    });
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [cuboidData, title]);

  return (
    <div style={{ height: '500px', position: 'relative' }}>
      <canvas ref={chartRef}></canvas>
      <div className="mt-4 text-center">
        <h6 className="small text-muted">Színskála magyarázat</h6>
        <div className="d-flex justify-content-center">
          <div style={{ 
            width: '80%', 
            height: '20px', 
            background: 'linear-gradient(to right, rgba(50, 100, 200, 0.7), rgba(100, 200, 100, 0.7), rgba(200, 200, 50, 0.7), rgba(255, 50, 50, 0.7))',
            borderRadius: '4px',
            marginBottom: '8px',
          }}></div>
        </div>
        <div className="d-flex justify-content-between" style={{ width: '80%', margin: '0 auto' }}>
          <span className="small">Kisebb térfogat</span>
          <span className="small">Nagyobb térfogat</span>
        </div>
        <p className="text-muted small mt-3">
          A 3D koordináta rendszer téglatestek/kockák térfogatát ábrázolja.
          A testek színe és mérete a térfogatuk nagyságát jelzi. Az ábra izometrikus vetítést használ
          a térbeli alakzatok megjelenítéséhez, ahol láthatók a méretek és a térfogat.
        </p>
      </div>
    </div>
  );
};

export default ScatterChart3D;
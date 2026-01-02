import React, { useState } from 'react';
import ScatterChart3D from './ScatterChart3D';
import TeruletSzorzasVizualizacio from './TeruletSzorzasVizualizacio';

// Koordináta rendszereket megjelenítő fő komponens
const KoordinataCharts = ({ chartData }) => {
  const [activeTab, setActiveTab] = useState('2d');

  // Tab váltás kezelése
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Adatok előkészítése a JSON stringből, ha van ilyen
  let parsedData = {};
  try {
    if (typeof chartData === 'string' && chartData) {
      parsedData = JSON.parse(chartData);
    } else if (chartData && typeof chartData === 'object') {
      parsedData = chartData;
    }
  } catch (error) {
    console.error('Hiba az adatok elemzése során:', error);
    parsedData = {};
  }

  return (
    <div className="koordinata-charts">
      {/* Tab navigáció */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === '2d' ? 'active' : ''}`} 
            onClick={() => handleTabChange('2d')}
          >
            Terület Vizualizáció
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === '3d' ? 'active' : ''}`}
            onClick={() => handleTabChange('3d')}
          >
            3D Koordináta Rendszer - Térfogat
          </button>
        </li>
      </ul>

      {/* Tab panelek */}
      <div className="tab-content">
        <div className={`tab-pane ${activeTab === '2d' ? 'active' : 'fade'}`}>
          <TeruletSzorzasVizualizacio />
        </div>
        <div className={`tab-pane ${activeTab === '3d' ? 'active' : 'fade'}`}>
          <ScatterChart3D 
            data={parsedData.data3d || []} 
            title="3D Koordináta Rendszer - Téglatestek/Kockák térfogata"
          />
        </div>
      </div>
    </div>
  );
};

export default KoordinataCharts;
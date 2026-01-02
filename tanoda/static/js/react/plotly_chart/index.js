import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import KoordinataCharts from './components/KoordinataCharts';
import PitagoraszTable from './components/PitagoraszTable';
import PopulationChart from './components/PopulationChart';
import CivilizationChart from './components/CivilizationChart';

// Tab-based React Application
const TabContent = ({ activeTab, data2D, data3D }) => {
  switch (activeTab) {
    case 'coord':
      return <KoordinataCharts data2D={data2D} data3D={data3D} />;
    case 'pitagorasz':
      return <PitagoraszTable />;
    case 'population':
      return <PopulationChart />;
    case 'civilization':
      return <CivilizationChart />;
    default:
      return <KoordinataCharts data2D={data2D} data3D={data3D} />;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Find all tab containers that need React components
  const reactContainers = document.querySelectorAll('[data-react-tab-content]');
  
  reactContainers.forEach(container => {
    // Parse data for the charts
    let chartData = {
      data2D: [],
      data3D: []
    };
    
    try {
      const dataAttribute = container.getAttribute('data-chart-data');
      if (dataAttribute) {
        chartData = JSON.parse(dataAttribute);
      }
    } catch (error) {
      console.error('Hiba a grafikon adatok beolvasásakor:', error);
    }

    // Get the initial active tab
    const initialActiveTab = container.getAttribute('data-active-tab') || 'coord';
    
    // Create React root and render TabContent component
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <TabContent 
          activeTab={initialActiveTab}
          data2D={chartData.data2D || []} 
          data3D={chartData.data3D || []}
        />
      </React.StrictMode>
    );
    
    // Add listeners to the tab buttons to update the React component
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
      button.addEventListener('shown.bs.tab', event => {
        const targetTab = event.target.getAttribute('data-bs-target').replace('#', '');
        
        // Re-render with new active tab
        root.render(
          <React.StrictMode>
            <TabContent 
              activeTab={targetTab}
              data2D={chartData.data2D || []} 
              data3D={chartData.data3D || []}
            />
          </React.StrictMode>
        );
      });
    });
  });

  console.log('Koordináta React alkalmazás inicializálva');
});
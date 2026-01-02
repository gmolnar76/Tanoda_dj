import React from 'react';
import { createRoot } from 'react-dom/client';
import PerformanceChart from './PerformanceChart.jsx';

// Global function to initialize the chart
window.initPerformanceChart = function(containerId, initialData = []) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return null;
    }

    // Create root and render
    const root = createRoot(container);
    root.render(<PerformanceChart data={initialData} />);

    // Return update function
    return {
        update: (newData) => {
            root.render(<PerformanceChart data={newData} />);
        },
        destroy: () => {
            root.unmount();
        }
    };
};

// Auto-initialize if container exists on load
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('teljesitmeny-grafikon');
    if (container && !container.dataset.reactInitialized) {
        container.dataset.reactInitialized = 'true';
        window.performanceChartInstance = window.initPerformanceChart('teljesitmeny-grafikon', []);
    }
});

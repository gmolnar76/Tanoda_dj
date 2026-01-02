import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminDashboard from './components/AdminDashboard';

document.addEventListener('DOMContentLoaded', () => {
  // Get the container element
  const container = document.getElementById('react-admin-dashboard');
  
  if (container) {
    // Get dashboard data from the data attribute
    let dashboardData = {};
    try {
      const dataAttribute = container.getAttribute('data-dashboard-data');
      dashboardData = dataAttribute ? JSON.parse(dataAttribute) : {};
    } catch (error) {
      console.error('Error parsing dashboard data:', error);
    }

    // Create a root
    const root = createRoot(container);
    
    // Render the AdminDashboard component with the data
    root.render(
      <React.StrictMode>
        <AdminDashboard data={dashboardData} />
      </React.StrictMode>
    );
    
    console.log('Admin Dashboard React application initialized');
  } else {
    console.error('React mount point #react-admin-dashboard not found');
  }
});
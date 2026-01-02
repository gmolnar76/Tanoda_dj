import React from 'react';
import { createRoot } from 'react-dom/client';
import UserDashboard from './components/UserDashboard';

document.addEventListener('DOMContentLoaded', () => {
  // Get the container element
  const container = document.getElementById('react-user-dashboard');
  
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
    
    // Render the UserDashboard component with the data
    root.render(
      <React.StrictMode>
        <UserDashboard data={dashboardData} />
      </React.StrictMode>
    );
    
    console.log('User Dashboard React application initialized');
  } else {
    console.error('React mount point #react-user-dashboard not found');
  }
});
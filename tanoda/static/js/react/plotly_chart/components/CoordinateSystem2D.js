import React, { useRef, useEffect } from 'react';

const CoordinateSystem2D = ({ szorzo, szorzando }) => {
  const canvasRef = useRef(null);
  const isNegativeProduct = (szorzo * szorzando) < 0;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maxAbsValue = Math.max(Math.abs(szorzo), Math.abs(szorzando), 10);
    
    // Make the canvas responsive to container width
    const updateDimensions = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientWidth * 0.75; // Maintain aspect ratio
      
      drawCoordinateSystem(ctx, canvas, maxAbsValue);
      drawRectangle(ctx, canvas, szorzo, szorzando, maxAbsValue);
    };
    
    // Initial drawing
    updateDimensions();
    
    // Handle window resize
    window.addEventListener('resize', updateDimensions);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', updateDimensions);
  }, [szorzo, szorzando]);

  // Draw the coordinate system
  const drawCoordinateSystem = (ctx, canvas, maxValue) => {
    const padding = 40;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = (Math.min(width, height) - padding * 2) / (2 * maxValue);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    
    // Draw grid
    for (let i = -maxValue; i <= maxValue; i += 2) {
      if (i === 0) continue; // Skip center lines as they'll be drawn separately
      
      const x = centerX + i * scale;
      const y = centerY + i * scale;
      
      // Vertical grid line
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      
      // Horizontal grid line
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    
    ctx.stroke();
    
    // Draw axes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // X-axis
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    
    // Y-axis
    ctx.moveTo(centerX, padding);
    ctx.lineTo(centerX, height - padding);
    
    ctx.stroke();
    
    // Draw axis ticks and numbers
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = -maxValue; i <= maxValue; i += 2) {
      if (i === 0) continue; // Skip zero
      
      const x = centerX + i * scale;
      const y = centerY + i * scale;
      
      // X-axis ticks and numbers
      ctx.fillText(i.toString(), x, centerY + 15);
      
      // Y-axis ticks and numbers
      ctx.fillText(i.toString(), centerX - 15, y);
    }
    
    // Draw zero
    ctx.fillText('0', centerX - 15, centerY + 15);
  };

  // Draw the rectangle representing the multiplication
  const drawRectangle = (ctx, canvas, szorzoX, szorzandoY, maxValue) => {
    const padding = 40;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = (Math.min(width, height) - padding * 2) / (2 * maxValue);
    
    // Calculate rectangle coordinates
    const x0 = centerX; // Origin (0,0)
    const y0 = centerY;
    const x1 = centerX + szorzoX * scale; // Right side of rectangle
    const y1 = centerY - szorzandoY * scale; // Top side of rectangle (y-axis inverted in canvas)
    
    // Draw filled rectangle
    ctx.fillStyle = 'rgba(78, 204, 163, 0.3)';
    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x0, y0); // Start at origin
    ctx.lineTo(x1, y0); // Go right to (szorzoX, 0)
    ctx.lineTo(x1, y1); // Go up to (szorzoX, szorzandoY)
    ctx.lineTo(x0, y1); // Go left to (0, szorzandoY)
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    // Add text in the middle
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${szorzoX} * ${szorzandoY} = ?`, midX, midY);
    
    // If negative product, draw additional visual explanation
    if (isNegativeProduct) {
      ctx.fillStyle = 'rgba(255, 99, 71, 0.3)';
      ctx.strokeStyle = '#ff6347';
      
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + Math.abs(szorzoX) * scale, y0);
      ctx.lineTo(x0 + Math.abs(szorzoX) * scale, y0 - Math.abs(szorzandoY) * scale);
      ctx.lineTo(x0, y0 - Math.abs(szorzandoY) * scale);
      ctx.closePath();
      
      ctx.fill();
      ctx.stroke();
    }
  };

  return (
    <div className="plot-container">
      <canvas ref={canvasRef} style={{width: '100%', height: 'auto'}}></canvas>
    </div>
  );
};

export default CoordinateSystem2D;
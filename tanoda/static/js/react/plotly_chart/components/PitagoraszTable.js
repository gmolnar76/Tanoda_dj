import React, { useState, useEffect, useRef } from 'react';

const PitagoraszTable = () => {
  const [currentScale, setCurrentScale] = useState(1);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // Initialize table when component mounts
  useEffect(() => {
    generateTable();
  }, []);

  // Generate the Pitagorasz multiplication table
  const generateTable = () => {
    if (!gridRef.current) return;
    
    let html = '<div class="grid-item header">×</div>';
    
    // Create header row
    for (let i = 1; i <= 10; i++) {
      html += `<div class="grid-item header">${i}</div>`;
    }
    
    // Create table content
    for (let i = 1; i <= 10; i++) {
      html += `<div class="grid-item header">${i}</div>`;
      for (let j = 1; j <= 10; j++) {
        const isPrimary = i === j ? 'primary' : '';
        html += `<div class="grid-item ${isPrimary}">${i * j}</div>`;
      }
    }
    
    gridRef.current.innerHTML = html;
  };

  // Set zoom level
  const setZoom = (scale) => {
    const newScale = Math.min(Math.max(0.5, scale), 3);
    if (gridRef.current) {
      gridRef.current.style.transform = `scale(${newScale})`;
    }
    setCurrentScale(newScale);
  };

  const handleZoomIn = () => {
    setZoom(currentScale + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.5, currentScale - 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  // Handle pinch zoom on touch devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const initialDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      const handleTouchMove = (moveEvent) => {
        if (moveEvent.touches.length === 2) {
          const currentDistance = Math.hypot(
            moveEvent.touches[0].pageX - moveEvent.touches[1].pageX,
            moveEvent.touches[0].pageY - moveEvent.touches[1].pageY
          );
          
          const scale = currentScale * (currentDistance / initialDistance);
          setZoom(Math.min(Math.max(0.5, scale), 3));
        }
      };
      
      const handleTouchEnd = () => {
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      };
      
      containerRef.current.addEventListener('touchmove', handleTouchMove);
      containerRef.current.addEventListener('touchend', handleTouchEnd);
    }
  };

  return (
    <>
      <div className="zoom-controls">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
        <button onClick={handleZoomReset}>Reset</button>
      </div>
      <div 
        className="pitagorasz-wrapper"
        ref={containerRef}
        onTouchStart={handleTouchStart}
      >
        <div className="pitagorasz-container">
          <div 
            ref={gridRef}
            className="pitagorasz-grid"
            style={{ transform: `scale(${currentScale})` }}
          >
            {/* Table will be generated here */}
          </div>
        </div>
      </div>
      <style jsx>{`
        .pitagorasz-wrapper {
          width: 100%;
          overflow: auto;
          border: 1px solid #4ecca3;
          border-radius: 5px;
          margin-top: 20px;
        }
        
        .pitagorasz-container {
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        
        .pitagorasz-grid {
          display: grid;
          grid-template-columns: repeat(11, 1fr);
          grid-gap: 2px;
          transform-origin: center;
          transition: transform 0.3s ease;
        }
        
        .grid-item {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a2e;
          color: #e0e0e0;
          border: 1px solid #4ecca3;
        }
        
        .grid-item.header {
          background: #4ecca3;
          color: #1a1a2e;
          font-weight: bold;
        }
        
        .grid-item.primary {
          background: rgba(78, 204, 163, 0.3);
        }
        
        .zoom-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        
        .zoom-controls button {
          padding: 5px 10px;
          margin: 0 5px;
          background: #4ecca3;
          color: #1a1a2e;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        
        .zoom-controls button:hover {
          background: #3aa18a;
        }
      `}</style>
    </>
  );
};

export default PitagoraszTable;
import React, { useState, useEffect, useRef } from 'react';

const CoordinateSystem3D = ({ szorzo1, szorzo2, szorzo3 }) => {
  const [rotation, setRotation] = useState({ x: -20, y: -30 });
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Make cube size responsive
    const updateContainerSize = () => {
      const parentWidth = container.parentElement.clientWidth;
      container.style.height = `${Math.min(400, parentWidth * 0.75)}px`;
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);

    return () => {
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

  // Mouse event handlers for rotation
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setPreviousMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };

    setRotation({
      y: rotation.y + deltaMove.x * 0.5,
      x: rotation.x + deltaMove.y * 0.5
    });

    setPreviousMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for rotation (mobile)
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setPreviousMousePosition({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const deltaMove = {
      x: e.touches[0].clientX - previousMousePosition.x,
      y: e.touches[0].clientY - previousMousePosition.y
    };

    setRotation({
      y: rotation.y + deltaMove.x * 0.5,
      x: rotation.x + deltaMove.y * 0.5
    });

    setPreviousMousePosition({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Generate cuboid faces
  const renderCuboidFaces = () => {
    const scale = 20; // Scale factor for CSS units
    const maxValue = Math.max(szorzo1, szorzo2, szorzo3, 10) * 1.2;

    // Define the faces
    const faces = [
      { // Front face
        transform: `translateZ(${szorzo3 * scale/2}px)`,
        width: `${szorzo1 * scale}px`,
        height: `${szorzo2 * scale}px`,
        background: 'rgba(78, 204, 163, 0.5)',
        border: '1px solid #4ecca3'
      },
      { // Back face
        transform: `translateZ(${-szorzo3 * scale/2}px)`,
        width: `${szorzo1 * scale}px`,
        height: `${szorzo2 * scale}px`,
        background: 'rgba(78, 204, 163, 0.5)',
        border: '1px solid #4ecca3'
      },
      { // Top face
        transform: `rotateX(90deg) translateZ(${szorzo2 * scale/2}px)`,
        width: `${szorzo1 * scale}px`,
        height: `${szorzo3 * scale}px`,
        background: 'rgba(78, 204, 163, 0.5)',
        border: '1px solid #4ecca3'
      },
      { // Bottom face
        transform: `rotateX(-90deg) translateZ(${szorzo2 * scale/2}px)`,
        width: `${szorzo1 * scale}px`,
        height: `${szorzo3 * scale}px`,
        background: 'rgba(78, 204, 163, 0.5)',
        border: '1px solid #4ecca3'
      },
      { // Right face
        transform: `rotateY(90deg) translateZ(${szorzo1 * scale/2}px)`,
        width: `${szorzo3 * scale}px`,
        height: `${szorzo2 * scale}px`,
        background: 'rgba(78, 204, 163, 0.5)',
        border: '1px solid #4ecca3'
      },
      { // Left face
        transform: `rotateY(-90deg) translateZ(${szorzo1 * scale/2}px)`,
        width: `${szorzo3 * scale}px`,
        height: `${szorzo2 * scale}px`,
        background: 'rgba(78, 204, 163, 0.5)',
        border: '1px solid #4ecca3'
      }
    ];

    return faces.map((face, index) => (
      <div 
        key={`face-${index}`}
        style={{
          position: 'absolute',
          width: face.width,
          height: face.height,
          background: face.background,
          border: face.border,
          transform: face.transform,
          transformOrigin: 'center',
          backfaceVisibility: 'visible',
          left: `calc(50% - ${parseInt(face.width)/2}px)`,
          top: `calc(50% - ${parseInt(face.height)/2}px)`
        }}
      />
    ));
  };

  // Generate axes
  const renderAxes = () => {
    const scale = 20;
    const axes = [
      { // X axis
        transform: `translateX(${szorzo1 * scale/2}px)`,
        width: `${szorzo1 * scale}px`,
        height: '2px',
        background: 'red',
        label: 'X'
      },
      { // Y axis
        transform: `rotateZ(90deg) translateX(${szorzo2 * scale/2}px)`,
        width: `${szorzo2 * scale}px`,
        height: '2px',
        background: 'green',
        label: 'Y'
      },
      { // Z axis
        transform: `rotateY(90deg) translateX(${szorzo3 * scale/2}px)`,
        width: `${szorzo3 * scale}px`,
        height: '2px',
        background: 'blue',
        label: 'Z'
      }
    ];

    return axes.map((axis, index) => (
      <div 
        key={`axis-${index}`}
        style={{
          position: 'absolute',
          width: axis.width,
          height: axis.height,
          background: axis.background,
          transform: axis.transform,
          transformOrigin: 'left',
          left: '50%',
          top: '50%'
        }}
      >
        <div style={{
          position: 'absolute',
          color: axis.background,
          right: '-15px',
          top: '-10px',
          fontWeight: 'bold'
        }}>
          {axis.label}
        </div>
      </div>
    ));
  };

  return (
    <div className="plot-container">
      <div 
        id="css-3d-container" 
        ref={containerRef}
        style={{
          width: '100%', 
          height: '400px', 
          position: 'relative', 
          perspective: '1000px'
        }}
      >
        <div 
          id="css-3d-cube"
          style={{
            width: '100%', 
            height: '100%', 
            position: 'relative', 
            transformStyle: 'preserve-3d'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            id="cuboid-container"
            style={{
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              transformStyle: 'preserve-3d', 
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
            }}
          >
            {renderCuboidFaces()}
            {renderAxes()}
          </div>
        </div>
        <div 
          style={{
            position: 'absolute',
            color: '#e0e0e0',
            background: 'rgba(0,0,0,0.7)',
            padding: '5px',
            borderRadius: '3px',
            bottom: '10px',
            right: '10px'
          }}
        >
          {`${szorzo1} × ${szorzo2} × ${szorzo3} = ?`}
        </div>
      </div>
    </div>
  );
};

export default CoordinateSystem3D;
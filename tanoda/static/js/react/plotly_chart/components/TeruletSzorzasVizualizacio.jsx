import React, { useState } from 'react';

const TeruletSzorzasVizualizacio = () => {
  const [szorzo, setSzorzo] = useState(5);
  const [szorzando, setSzorzando] = useState(7);
  const [showGrid, setShowGrid] = useState(true);
  
  // Maximális értékek a skálázáshoz
  const maxWidth = 10;
  const maxHeight = 10;
  
  // Négyzetek mérete
  const rectSize = 35;
  const padding = 5;
  
  // Számított értékek
  const canvasWidth = (maxWidth * rectSize) + (padding * 2);
  const canvasHeight = (maxHeight * rectSize) + (padding * 2);
  const szorzat = szorzo * szorzando;
  
  // Részterületek (felbontott szorzás ábrázolásához)
  const renderReszteruletek = () => {
    // A szorzót és szorzandót felbontjuk tízes és egyes részekre
    const szorzoTizes = Math.floor(szorzo / 10);
    const szorzoEgyes = szorzo % 10;
    const szorzandoTizes = Math.floor(szorzando / 10);
    const szorzandoEgyes = szorzando % 10;
    
    const areas = [];
    
    // Csak akkor mutatjuk, ha van tízes helyi érték
    if (szorzoTizes > 0 && szorzandoTizes > 0) {
      // Tízes × Tízes rész
      areas.push({
        x: 0,
        y: 0,
        width: szorzoTizes * rectSize,
        height: szorzandoTizes * rectSize,
        color: 'bg-primary',
        value: szorzoTizes * 10 * szorzandoTizes * 10,
        label: `${szorzoTizes}0 × ${szorzandoTizes}0 = ${szorzoTizes * szorzandoTizes * 100}`
      });
    }
    
    if (szorzoTizes > 0) {
      // Tízes × Egyes rész
      areas.push({
        x: 0,
        y: szorzandoTizes * rectSize,
        width: szorzoTizes * rectSize,
        height: szorzandoEgyes * rectSize,
        color: 'bg-success',
        value: szorzoTizes * 10 * szorzandoEgyes,
        label: `${szorzoTizes}0 × ${szorzandoEgyes} = ${szorzoTizes * 10 * szorzandoEgyes}`
      });
    }
    
    if (szorzandoTizes > 0) {
      // Egyes × Tízes rész
      areas.push({
        x: szorzoTizes * rectSize,
        y: 0,
        width: szorzoEgyes * rectSize,
        height: szorzandoTizes * rectSize,
        color: 'bg-warning',
        value: szorzoEgyes * szorzandoTizes * 10,
        label: `${szorzoEgyes} × ${szorzandoTizes}0 = ${szorzoEgyes * szorzandoTizes * 10}`
      });
    }
    
    // Egyes × Egyes rész
    areas.push({
      x: szorzoTizes * rectSize,
      y: szorzandoTizes * rectSize,
      width: szorzoEgyes * rectSize,
      height: szorzandoEgyes * rectSize,
      color: 'bg-danger',
      value: szorzoEgyes * szorzandoEgyes,
      label: `${szorzoEgyes} × ${szorzandoEgyes} = ${szorzoEgyes * szorzandoEgyes}`
    });
    
    return areas;
  };
  
  const reszteruletek = renderReszteruletek();
  
  return (
    <div className="p-4 bg-light rounded shadow mb-4">
      <h2 className="h4 fw-bold mb-4 text-center">Szorzás mint Téglalap Területe</h2>
      
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center">
          <label className="me-2">Szélesség (szorzó):</label>
          <input 
            type="range" 
            min="1" 
            max={maxWidth} 
            value={szorzo} 
            onChange={(e) => setSzorzo(parseInt(e.target.value))} 
            className="form-range"
            style={{width: '150px'}}
          />
          <span className="ms-2">{szorzo}</span>
        </div>
        
        <div className="d-flex align-items-center">
          <label className="me-2">Magasság (szorzandó):</label>
          <input 
            type="range" 
            min="1" 
            max={maxHeight} 
            value={szorzando} 
            onChange={(e) => setSzorzando(parseInt(e.target.value))} 
            className="form-range"
            style={{width: '150px'}}
          />
          <span className="ms-2">{szorzando}</span>
        </div>
        
        <div className="d-flex align-items-center">
          <label className="me-2">Rács megjelenítése:</label>
          <div className="form-check">
            <input 
              type="checkbox" 
              checked={showGrid} 
              onChange={(e) => setShowGrid(e.target.checked)} 
              className="form-check-input"
              id="gridCheckbox"
            />
            <label className="form-check-label" htmlFor="gridCheckbox"></label>
          </div>
        </div>
      </div>
      
      <div className="d-flex flex-column flex-md-row gap-3">
        <div className="border border-secondary p-2 rounded bg-light">
          <h3 className="h5 fw-semibold mb-2 text-center">Egységes terület</h3>
          <div 
            className="position-relative mx-auto" 
            style={{ 
              width: `${szorzo * rectSize + padding * 2}px`, 
              height: `${szorzando * rectSize + padding * 2}px` 
            }}
          >
            {/* Fő téglalap */}
            <div 
              className="position-absolute bg-info bg-opacity-10 border border-info" 
              style={{ 
                left: `${padding}px`, 
                top: `${padding}px`, 
                width: `${szorzo * rectSize}px`, 
                height: `${szorzando * rectSize}px` 
              }}
            >
              {/* Rács megjelenítése */}
              {showGrid && Array.from({ length: szorzo }).map((_, i) => (
                Array.from({ length: szorzando }).map((_, j) => (
                  <div 
                    key={`${i}-${j}`}
                    className="position-absolute border border-secondary border-opacity-25"
                    style={{
                      left: `${i * rectSize}px`,
                      top: `${j * rectSize}px`,
                      width: `${rectSize}px`,
                      height: `${rectSize}px`
                    }}
                  />
                ))
              ))}
              
              {/* Szorzat a téglalap közepén */}
              <div className="position-absolute inset-0 d-flex align-items-center justify-content-center fw-bold fs-3">
                {szorzat}
              </div>
            </div>
            
            {/* Szélességet jelölő nyíl */}
            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ 
              top: `${szorzando * rectSize + padding * 3}px`, 
              left: `${padding}px`, 
              width: `${szorzo * rectSize}px` 
            }}>
              <div className="w-100 bg-dark" style={{height: '2px', position: 'relative'}}>
                <div className="position-absolute" style={{left: '-4px', top: '-4px', width: 0, height: 0, 
                  borderTop: '4px solid transparent', 
                  borderBottom: '4px solid transparent', 
                  borderRight: '4px solid black', 
                  transform: 'rotate(180deg)'}}></div>
                <div className="position-absolute" style={{right: '-4px', top: '-4px', width: 0, height: 0, 
                  borderTop: '4px solid transparent', 
                  borderBottom: '4px solid transparent', 
                  borderLeft: '4px solid black', 
                  transform: 'rotate(180deg)'}}></div>
              </div>
              <div className="position-absolute w-100 text-center small" style={{bottom: '-20px'}}>
                {szorzo}
              </div>
            </div>
            
            {/* Magasságot jelölő nyíl */}
            <div className="position-absolute d-flex flex-column align-items-center justify-content-center" style={{ 
              left: `${szorzo * rectSize + padding * 3}px`, 
              top: `${padding}px`, 
              height: `${szorzando * rectSize}px` 
            }}>
              <div className="h-100 bg-dark" style={{width: '2px', position: 'relative'}}>
                <div className="position-absolute" style={{top: '-4px', left: '-4px', width: 0, height: 0, 
                  borderLeft: '4px solid transparent', 
                  borderRight: '4px solid transparent', 
                  borderBottom: '4px solid black', 
                  transform: 'rotate(180deg)'}}></div>
                <div className="position-absolute" style={{bottom: '-4px', left: '-4px', width: 0, height: 0, 
                  borderLeft: '4px solid transparent', 
                  borderRight: '4px solid transparent', 
                  borderTop: '4px solid black'}}></div>
              </div>
              <div className="position-absolute h-100 d-flex align-items-center" style={{right: '-20px'}}>
                <span className="small" style={{transform: 'rotate(90deg)'}}>{szorzando}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-center">
            Terület = szélesség × magasság = {szorzo} × {szorzando} = {szorzat}
          </div>
        </div>
        
        <div className="border border-secondary p-2 rounded bg-light">
          <h3 className="h5 fw-semibold mb-2 text-center">Felbontott terület</h3>
          <div 
            className="position-relative mx-auto" 
            style={{ 
              width: `${szorzo * rectSize + padding * 2}px`, 
              height: `${szorzando * rectSize + padding * 2}px` 
            }}
          >
            {/* Részterületek megjelenítése */}
            {reszteruletek.map((terulet, index) => (
              <div 
                key={index}
                className={`position-absolute ${terulet.color} border border-dark`}
                style={{
                  left: `${terulet.x + padding}px`,
                  top: `${terulet.y + padding}px`,
                  width: `${terulet.width}px`,
                  height: `${terulet.height}px`,
                  opacity: '0.5'
                }}
              >
                <div className="position-absolute inset-0 d-flex align-items-center justify-content-center fw-semibold">
                  {terulet.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Részterületek magyarázata */}
          <div className="mt-4">
            <h4 className="h6 fw-semibold">Részterületek:</h4>
            <ul className="small list-unstyled">
              {reszteruletek.map((terulet, index) => (
                <li key={index} className="d-flex align-items-center mt-1">
                  <div className={`${terulet.color}`} style={{width: '16px', height: '16px', marginRight: '8px', opacity: '0.5'}}></div>
                  {terulet.label}
                </li>
              ))}
            </ul>
            <div className="mt-2 fw-semibold">
              Összterület: {reszteruletek.reduce((sum, t) => sum + t.value, 0)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 row">
        <div className="col-md-6">
            <div className="mt-3">
                <h4>2D Szorzás Gyakorló</h4>
                <p>Mennyi <span id="szorzo-2d">{szorzo}</span> * <span id="szorzando-2d">{szorzando}</span>?</p>
                <div className="input-group">
                    <input type="number" id="valasz-2d" className="form-control" placeholder="Írd be a választ"/>
                    <span className="input-group-text bg-primary text-white" id="ellenorzes-2d">
                        <i className="fas fa-yin-yang"></i>
                    </span>
                </div>
                <div id="eredmeny-2d" className="alert mt-2" style={{display: 'none'}}></div>
            </div>
        </div>
        <div className="col-md-6">
            <div className="mt-3">
                <h4>3D Szorzás Gyakorló</h4>
                <p>Mennyi <span id="szorzo-3d-1">{szorzo}</span> * <span id="szorzo-3d-2">{szorzando}</span> * <span id="szorzo-3d-3">2</span>?</p>
                <div className="input-group">
                    <input type="number" id="valasz-3d" className="form-control" placeholder="Írd be a választ"/>
                    <span className="input-group-text bg-primary text-white" id="ellenorzes-3d">
                        <i className="fas fa-yin-yang"></i>
                    </span>
                </div>
                <div id="eredmeny-3d" className="alert mt-2" style={{display: 'none'}}></div>
            </div>
        </div>
      </div>
      
      <div className="mt-4 small text-secondary">
        <p>Ez a vizualizáció a szorzást egy téglalap területeként ábrázolja.</p>
        <p>A területszámítás szemléletesen mutatja, hogy a terület = szélesség × magasság, vagyis {szorzo} × {szorzando} = {szorzat}</p>
        <p>A jobb oldali ábrán látható a helyiérték szerinti felbontás (disztributív tulajdonság), amely segít megérteni a többjegyű számok szorzását is.</p>
      </div>
    </div>
  );
};

export default TeruletSzorzasVizualizacio;
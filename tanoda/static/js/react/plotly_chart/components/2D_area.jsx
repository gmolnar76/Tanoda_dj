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
        color: 'bg-blue-500',
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
        color: 'bg-green-500',
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
        color: 'bg-yellow-500',
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
      color: 'bg-red-500',
      value: szorzoEgyes * szorzandoEgyes,
      label: `${szorzoEgyes} × ${szorzandoEgyes} = ${szorzoEgyes * szorzandoEgyes}`
    });
    
    return areas;
  };
  
  const reszteruletek = renderReszteruletek();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Szorzás mint Téglalap Területe</h2>
      
      <div className="flex flex-col md:flex-row justify-center items-center mb-4 gap-4">
        <div className="flex items-center">
          <label className="mr-2">Szélesség (szorzó):</label>
          <input 
            type="range" 
            min="1" 
            max={maxWidth} 
            value={szorzo} 
            onChange={(e) => setSzorzo(parseInt(e.target.value))} 
            className="w-32"
          />
          <span className="ml-2">{szorzo}</span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2">Magasság (szorzandó):</label>
          <input 
            type="range" 
            min="1" 
            max={maxHeight} 
            value={szorzando} 
            onChange={(e) => setSzorzando(parseInt(e.target.value))} 
            className="w-32"
          />
          <span className="ml-2">{szorzando}</span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2">Rács megjelenítése:</label>
          <input 
            type="checkbox" 
            checked={showGrid} 
            onChange={(e) => setShowGrid(e.target.checked)} 
          />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="border border-gray-300 p-2 rounded bg-white">
          <h3 className="text-lg font-semibold mb-2 text-center">Egységes terület</h3>
          <div 
            className="relative mx-auto" 
            style={{ 
              width: `${szorzo * rectSize + padding * 2}px`, 
              height: `${szorzando * rectSize + padding * 2}px` 
            }}
          >
            {/* Fő téglalap */}
            <div 
              className="absolute bg-blue-200 border border-blue-500" 
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
                    className="absolute border border-gray-300"
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
              <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
                {szorzat}
              </div>
            </div>
            
            {/* Szélességet jelölő nyíl */}
            <div className="absolute flex items-center justify-center" style={{ 
              top: `${szorzando * rectSize + padding * 3}px`, 
              left: `${padding}px`, 
              width: `${szorzo * rectSize}px` 
            }}>
              <div className="w-full h-0.5 bg-black relative">
                <div className="absolute -left-1 -top-1.5 border-t-4 border-r-4 border-transparent border-l-4 border-l-black transform rotate-90"></div>
                <div className="absolute -right-1 -top-1.5 border-t-4 border-l-4 border-transparent border-r-4 border-r-black transform -rotate-90"></div>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-sm">
                {szorzo}
              </div>
            </div>
            
            {/* Magasságot jelölő nyíl */}
            <div className="absolute flex flex-col items-center justify-center" style={{ 
              left: `${szorzo * rectSize + padding * 3}px`, 
              top: `${padding}px`, 
              height: `${szorzando * rectSize}px` 
            }}>
              <div className="h-full w-0.5 bg-black relative">
                <div className="absolute -top-1 -left-1.5 border-r-4 border-b-4 border-transparent border-t-4 border-t-black transform rotate-180"></div>
                <div className="absolute -bottom-1 -left-1.5 border-r-4 border-t-4 border-transparent border-b-4 border-b-black"></div>
              </div>
              <div className="absolute -right-5 h-full flex items-center">
                <span className="text-sm transform rotate-90">{szorzando}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-center">
            Terület = szélesség × magasság = {szorzo} × {szorzando} = {szorzat}
          </div>
        </div>
        
        <div className="border border-gray-300 p-2 rounded bg-white">
          <h3 className="text-lg font-semibold mb-2 text-center">Felbontott terület</h3>
          <div 
            className="relative mx-auto" 
            style={{ 
              width: `${szorzo * rectSize + padding * 2}px`, 
              height: `${szorzando * rectSize + padding * 2}px` 
            }}
          >
            {/* Részterületek megjelenítése */}
            {reszteruletek.map((terulet, index) => (
              <div 
                key={index}
                className={`absolute ${terulet.color} border border-gray-500`}
                style={{
                  left: `${terulet.x + padding}px`,
                  top: `${terulet.y + padding}px`,
                  width: `${terulet.width}px`,
                  height: `${terulet.height}px`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center font-semibold">
                  {terulet.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Részterületek magyarázata */}
          <div className="mt-4">
            <h4 className="font-semibold">Részterületek:</h4>
            <ul className="text-sm">
              {reszteruletek.map((terulet, index) => (
                <li key={index} className="flex items-center mt-1">
                  <div className={`w-4 h-4 mr-2 ${terulet.color}`}></div>
                  {terulet.label}
                </li>
              ))}
            </ul>
            <div className="mt-2 font-semibold">
              Összterület: {reszteruletek.reduce((sum, t) => sum + t.value, 0)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>Ez a vizualizáció a szorzást egy téglalap területeként ábrázolja.</p>
        <p>A területszámítás szemléletesen mutatja, hogy a terület = szélesség × magasság, vagyis {szorzo} × {szorzando} = {szorzat}</p>
        <p>A jobb oldali ábrán látható a helyiérték szerinti felbontás (disztributív tulajdonság), amely segít megérteni a többjegyű számok szorzását is.</p>
      </div>
    </div>
  );
};

export default TeruletSzorzasVizualizacio;
import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, 
         RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, 
         Legend, ResponsiveContainer, Cell, PolarGrid, PolarAngleAxis, 
         PolarRadiusAxis, Brush } from 'recharts';

const EgysegesTeljesitmenyGrafikonok = () => {
  const [selectedTab, setSelectedTab] = useState('adaptiv');

  // 1. Adaptív nehézségi szint és teljesítmény adatok
  const adaptivData = Array(30).fill().map((_, i) => {
    const nap = i + 1;
    let nehezseg;
    if (nap < 6) nehezseg = 1;
    else if (nap < 12) nehezseg = 2;
    else if (nap < 18) nehezseg = 3;
    else if (nap < 24) nehezseg = 3;
    else nehezseg = 4;
    
    return {
      nap,
      nehezseg,
      teljesitmeny: 20 + Math.min(60, nap * 2.5) + Math.random() * 10 - 5,
      pontossag: 40 + Math.min(50, nap * 2) + Math.random() * 10 - 5
    };
  });

  // 2. Havi gyakorlási aktivitás adatok
  const naptar = Array(31).fill().map((_, i) => {
    const nap = i + 1;
    return {
      nap,
      feladatokSzama: nap % 7 === 0 ? 0 : Math.floor(Math.random() * 25) + 5,
      sikeresSzazalek: Math.min(95, 50 + Math.floor(Math.random() * 45))
    };
  });

  // 3. Teljesítményed az osztályátlaghoz képest adatok
  const osztalyOsszehasonlitasAdatok = [
    { kategoria: '1×1 - 5×5', sajat: 92, osztalyAtlag: 87 },
    { kategoria: '6×6 - 10×10', sajat: 78, osztalyAtlag: 71 },
    { kategoria: '11×11 - 15×15', sajat: 65, osztalyAtlag: 58 },
    { kategoria: '16×16 - 20×20', sajat: 45, osztalyAtlag: 40 },
    { kategoria: 'Negatív számok', sajat: 72, osztalyAtlag: 65 },
    { kategoria: 'Törtekkel', sajat: 60, osztalyAtlag: 55 },
  ];

  // 4. Szorzótábla teljesítmény hőtérkép adatok
  // A magasabb százalék jobb teljesítményt jelent
  const teljesitmenyHoterkepAdatok = () => {
    const eredmeny = [];
    for (let sor = 1; sor <= 12; sor++) {
      for (let oszlop = 1; oszlop <= 12; oszlop++) {
        // Nehezebb szorzások: kisebb teljesítmény
        let teljesitmeny;
        
        // Speciális esetek
        if (oszlop === 1 || sor === 1) {
          teljesitmeny = 95; // Eggyel szorzás könnyű
        } else if (oszlop === 2 || sor === 2) {
          teljesitmeny = 92; // Kettővel szorzás könnyű
        } else if (oszlop === 5 || sor === 5) {
          teljesitmeny = 87; // Öttel szorzás közepesen könnyű
        } else if (oszlop === 10 || sor === 10) {
          teljesitmeny = 89; // Tízzel szorzás könnyű
        } else if (oszlop === 11 || sor === 11) {
          teljesitmeny = 60; // 11-gyel szorzás nehéz
        } else if (oszlop >= 13 || sor >= 13) {
          teljesitmeny = 55 - Math.min(20, Math.max(oszlop, sor) - 12) * 2; // Nagyobb számokkal nehezebb
        } else if (oszlop === sor) {
          teljesitmeny = 85; // Négyzetek valamivel könnyebbek
        } else if (oszlop * sor > 100) {
          teljesitmeny = 65; // 100 feletti eredmények nehezebbek
        } else {
          // Alap nehézség a szorzat alapján
          teljesitmeny = 90 - Math.floor(Math.sqrt(oszlop * sor)) * 2;
        }
        
        // Véletlen variáció hozzáadása
        teljesitmeny += Math.floor(Math.random() * 10) - 5;
        teljesitmeny = Math.max(0, Math.min(100, teljesitmeny));
        
        eredmeny.push({
          sor,
          oszlop,
          teljesitmeny,
          probalkozasok: Math.floor(Math.random() * 30) + 5
        });
      }
    }
    return eredmeny;
  };

  // 5. Szorzótábla sikerességi hőtérkép adatok
  const hoterkepAdatok = [
    { szorzando: '1', '1': 100, '2': 100, '3': 95, '4': 90, '5': 85, '6': 80, '7': 75, '8': 70, '9': 65, '10': 60 },
    { szorzando: '2', '1': 100, '2': 95, '3': 90, '4': 85, '5': 80, '6': 75, '7': 70, '8': 65, '9': 60, '10': 55 },
    { szorzando: '3', '1': 95, '2': 90, '3': 85, '4': 80, '5': 75, '6': 70, '7': 65, '8': 60, '9': 55, '10': 50 },
    { szorzando: '4', '1': 90, '2': 85, '3': 80, '4': 75, '5': 70, '6': 65, '7': 60, '8': 55, '9': 50, '10': 45 },
    { szorzando: '5', '1': 85, '2': 80, '3': 75, '4': 70, '5': 65, '6': 60, '7': 55, '8': 50, '9': 45, '10': 40 },
    { szorzando: '6', '1': 80, '2': 75, '3': 70, '4': 65, '5': 60, '6': 55, '7': 50, '8': 45, '9': 40, '10': 35 },
    { szorzando: '7', '1': 75, '2': 70, '3': 65, '4': 60, '5': 55, '6': 50, '7': 45, '8': 40, '9': 35, '10': 30 },
    { szorzando: '8', '1': 70, '2': 65, '3': 60, '4': 55, '5': 50, '6': 45, '7': 40, '8': 35, '9': 30, '10': 25 },
    { szorzando: '9', '1': 65, '2': 60, '3': 55, '4': 50, '5': 45, '6': 40, '7': 35, '8': 30, '9': 25, '10': 20 },
    { szorzando: '10', '1': 60, '2': 55, '3': 50, '4': 45, '5': 40, '6': 35, '7': 30, '8': 25, '9': 20, '10': 15 },
  ];

  // 6. Teljesítmény mérőszámok adatok
  const metricsData = [
    { name: 'Gyorsaság', ertek: 65, fill: '#8884d8' },
    { name: 'Pontosság', ertek: 82, fill: '#4ecca3' },
    { name: 'Nehézség', ertek: 70, fill: '#ffc658' },
    { name: 'Konzisztencia', ertek: 75, fill: '#ff8042' },
  ];

  // Színskálák
  const getSzinTeljesitmenyhez = (teljesitmeny) => {
    if (teljesitmeny >= 90) return '#4ecca3'; // Zöld - nagyon jó
    if (teljesitmeny >= 75) return '#7ed6b2'; // Világos zöld - jó
    if (teljesitmeny >= 60) return '#fee08b'; // Sárga - közepes
    if (teljesitmeny >= 40) return '#fdae61'; // Narancs - gyenge
    return '#e74c3c';                         // Piros - rossz
  };

  // Grafikon renderelés komponensek
  const renderAdaptivNehezsegiSzint = () => (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Adaptív nehézségi szint és teljesítmény</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={adaptivData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="nap" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
            labelStyle={{ color: '#eee' }}
          />
          <Legend />
          <defs>
            <linearGradient id="colorTelj" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ecca3" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4ecca3" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorPont" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3498db" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorNeh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f39c12" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f39c12" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="teljesitmeny" 
            name="Teljesítmény pont" 
            stroke="#4ecca3" 
            fillOpacity={1} 
            fill="url(#colorTelj)" 
          />
          <Area 
            type="monotone" 
            dataKey="pontossag" 
            name="Pontosság %" 
            stroke="#3498db" 
            fillOpacity={1} 
            fill="url(#colorPont)" 
          />
          <Area 
            type="stepAfter" 
            dataKey="nehezseg" 
            name="Nehézségi szint" 
            stroke="#f39c12" 
            fillOpacity={1} 
            fill="url(#colorNeh)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const renderHaviGyakorlasi = () => (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Havi gyakorlási aktivitás</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={naptar}
          margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
          barCategoryGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="nap" stroke="#888" tick={{ fontSize: 10 }} />
          <YAxis stroke="#888" tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
            labelStyle={{ color: '#eee' }}
          />
          <Bar dataKey="feladatokSzama" name="Feladatok száma" radius={[2, 2, 0, 0]}>
            {naptar.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.feladatokSzama === 0 ? '#333' : `rgba(78, 204, 163, ${Math.min(1, entry.feladatokSzama / 25)})`} 
              />
            ))}
          </Bar>
          <Brush dataKey="nap" height={20} stroke="#888" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderOsztalyOsszehasonlitas = () => (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Teljesítményed az osztályátlaghoz képest</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart outerRadius={140} data={osztalyOsszehasonlitasAdatok}>
          <PolarGrid stroke="#555" />
          <PolarAngleAxis dataKey="kategoria" tick={{ fill: '#ddd' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" />
          <Radar name="Saját pontszám" dataKey="sajat" stroke="#4ecca3" fill="#4ecca3" fillOpacity={0.6} />
          <Radar name="Osztályátlag" dataKey="osztalyAtlag" stroke="#3498db" fill="#3498db" fillOpacity={0.6} />
          <Legend />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
            labelStyle={{ color: '#eee' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTeljesitmenyHoterkep = () => {
    const hoterkepData = teljesitmenyHoterkepAdatok();
    const maxMeret = 12;

    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Szorzótábla teljesítmény hőtérkép</h3>
        
        <div className="flex justify-center">
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="w-10 h-10 bg-gray-700 text-gray-300 font-bold border border-gray-600">×</th>
                  {Array(maxMeret).fill().map((_, i) => (
                    <th key={i} className="w-10 h-10 bg-gray-700 text-gray-300 font-bold border border-gray-600">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array(maxMeret).fill().map((_, sori) => (
                  <tr key={sori}>
                    <th className="w-10 h-10 bg-gray-700 text-gray-300 font-bold border border-gray-600">
                      {sori + 1}
                    </th>
                    {Array(maxMeret).fill().map((_, oszlopi) => {
                      const sor = sori + 1;
                      const oszlop = oszlopi + 1;
                      const adat = hoterkepData.find(item => 
                        item.sor === sor && item.oszlop === oszlop
                      );
                      
                      const teljesitmeny = adat ? adat.teljesitmeny : 0;
                      const szin = getSzinTeljesitmenyhez(teljesitmeny);
                      
                      return (
                        <td 
                          key={oszlopi}
                          className="w-10 h-10 text-center font-medium border border-gray-700 relative group"
                          style={{ backgroundColor: szin, color: teljesitmeny > 60 ? '#333' : '#fff' }}
                        >
                          {sor * oszlop}
                          
                          {/* Hover tooltip */}
                          <div className="absolute hidden group-hover:block bg-gray-900 text-white p-2 rounded shadow-lg text-xs z-10 w-36 left-1/2 transform -translate-x-1/2 -translate-y-full -mt-1">
                            <div className="font-bold">{sor} × {oszlop} = {sor * oszlop}</div>
                            <div className="mt-1">Teljesítmény: {teljesitmeny}%</div>
                            <div>Próbálkozások: {adat ? adat.probalkozasok : 0}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Jelmagyarázat */}
        <div className="mt-4 flex items-center justify-center">
          <div className="text-sm text-gray-400 mr-2">Teljesítmény:</div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-e74c3c mr-1" style={{ backgroundColor: '#e74c3c' }}></div>
            <span className="text-sm text-gray-300 mr-2">Gyenge</span>
            
            <div className="w-4 h-4 bg-fdae61 mr-1" style={{ backgroundColor: '#fdae61' }}></div>
            <span className="text-sm text-gray-300 mr-2">Közepes</span>
            
            <div className="w-4 h-4 bg-fee08b mr-1" style={{ backgroundColor: '#fee08b' }}></div>
            <span className="text-sm text-gray-300 mr-2">Jó</span>
            
            <div className="w-4 h-4 bg-7ed6b2 mr-1" style={{ backgroundColor: '#7ed6b2' }}></div>
            <span className="text-sm text-gray-300 mr-2">Nagyon jó</span>
            
            <div className="w-4 h-4 bg-4ecca3 mr-1" style={{ backgroundColor: '#4ecca3' }}></div>
            <span className="text-sm text-gray-300">Kiváló</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSikeressegiHoterkep = () => (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Szorzótábla sikerességi hőtérkép</h3>
      <div className="flex justify-center">
        <div className="grid grid-cols-11 gap-1">
          <div className="w-8 h-8 flex items-center justify-center text-gray-300 font-medium">×</div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(col => (
            <div key={col} className="w-8 h-8 flex items-center justify-center text-gray-300 font-medium">{col}</div>
          ))}

          {hoterkepAdatok.map((row, idx) => (
            <React.Fragment key={idx}>
              <div className="w-8 h-8 flex items-center justify-center text-gray-300 font-medium">{row.szorzando}</div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(col => {
                const value = row[col.toString()];
                const intensity = Math.floor(value * 2.55);
                const bgColor = `rgb(${100 - intensity}, ${Math.min(255, intensity + 100)}, ${100})`;
                
                return (
                  <div 
                    key={col}
                    className="w-8 h-8 flex items-center justify-center text-xs font-medium rounded-sm"
                    style={{ backgroundColor: bgColor, color: value > 50 ? '#fff' : '#333' }}
                  >
                    {value}%
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeljesitmenyMeroszamok = () => (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Teljesítmény mérőszámok</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="20%" 
          outerRadius="80%" 
          barSize={20} 
          data={metricsData}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background={{ fill: '#333' }}
            dataKey="ertek"
            cornerRadius={10}
            label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
          />
          <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            wrapperStyle={{ lineHeight: '24px' }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
            labelStyle={{ color: '#eee' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );

  // Grafikon kiválasztó tabfülek
  const tabs = [
    { id: 'adaptiv', name: 'Adaptív nehézség', component: renderAdaptivNehezsegiSzint },
    { id: 'havi', name: 'Havi aktivitás', component: renderHaviGyakorlasi },
    { id: 'osztaly', name: 'Osztályhoz képest', component: renderOsztalyOsszehasonlitas },
    { id: 'teljesitmeny', name: 'Teljesítmény hőtérkép', component: renderTeljesitmenyHoterkep },
    { id: 'sikeressegi', name: 'Sikerességi hőtérkép', component: renderSikeressegiHoterkep },
    { id: 'meroszamok', name: 'Teljesítmény metrikák', component: renderTeljesitmenyMeroszamok },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Tab fejléc */}
      <div className="flex flex-wrap overflow-x-auto bg-gray-700 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 whitespace-nowrap ${selectedTab === tab.id 
              ? 'bg-gray-800 text-blue-400 font-medium border-b-2 border-blue-400' 
              : 'text-gray-300 hover:text-gray-100'}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Az aktuálisan kiválasztott grafikon megjelenítése */}
      {tabs.find(tab => tab.id === selectedTab)?.component()}
      
      {/* Teljes áttekintő nézet opcionálisan */}
      {selectedTab === 'all' && (
        <div className="space-y-6">
          {tabs.filter(tab => tab.id !== 'all').map(tab => (
            <div key={tab.id}>
              {tab.component()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EgysegesTeljesitmenyGrafikonok;
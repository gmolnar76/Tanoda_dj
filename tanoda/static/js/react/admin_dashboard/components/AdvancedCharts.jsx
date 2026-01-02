import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, 
         RadialBarChart, RadialBar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, 
         Legend, ResponsiveContainer, Cell, PolarGrid, PolarAngleAxis, 
         PolarRadiusAxis, Brush } from 'recharts';

const AdvancedCharts = ({ data }) => {
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
  const naptar = data.aktivitas_idopontok ? 
    data.aktivitas_idopontok.map((date, idx) => ({
      nap: new Date(date).getDate(),
      feladatokSzama: data.aktivitas_ertekek[idx] || 0,
      sikeresSzazalek: Math.min(95, 50 + Math.floor(Math.random() * 45))
    })) : 
    Array(31).fill().map((_, i) => ({
      nap: i + 1,
      feladatokSzama: i % 7 === 0 ? 0 : Math.floor(Math.random() * 25) + 5,
      sikeresSzazalek: Math.min(95, 50 + Math.floor(Math.random() * 45))
    }));

  // 3. Teljesítmény az osztályátlaghoz képest adatok
  const osztalyOsszehasonlitasAdatok = [
    { kategoria: '1×1 - 5×5', sajat: 92, osztalyAtlag: 87 },
    { kategoria: '6×6 - 10×10', sajat: 78, osztalyAtlag: 71 },
    { kategoria: '11×11 - 15×15', sajat: 65, osztalyAtlag: 58 },
    { kategoria: '16×16 - 20×20', sajat: 45, osztalyAtlag: 40 },
    { kategoria: 'Negatív számok', sajat: 72, osztalyAtlag: 65 },
    { kategoria: 'Törtekkel', sajat: 60, osztalyAtlag: 55 },
  ];

  // 4. Szorzótábla teljesítmény adatok a heatmap alapján
  const teljesitmenyHoterkepAdatok = () => {
    const eredmeny = [];
    
    if (data.hiba_matrix && data.hiba_matrix.length > 0) {
      // Ha van adat, akkor azt használjuk
      for (let sor = 0; sor < data.hiba_matrix.length; sor++) {
        for (let oszlop = 0; oszlop < data.hiba_matrix[sor].length; oszlop++) {
          const hibaErtek = data.hiba_matrix[sor][oszlop];
          // A hiba értéket átalakítjuk teljesítmény értékké (több hiba = alacsonyabb teljesítmény)
          const teljesitmeny = Math.max(0, 100 - hibaErtek * 5);
          
          eredmeny.push({
            sor: sor + 1,
            oszlop: oszlop + 1,
            teljesitmeny,
            probalkozasok: Math.floor(Math.random() * 30) + 5
          });
        }
      }
    } else {
      // Ha nincs adat, akkor generálunk
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
    }
    return eredmeny;
  };

  // 5. Teljesítmény mérőszámok adatok
  const metricsData = [
    { name: 'Gyorsaság', ertek: 65, fill: '#8884d8' },
    { name: 'Pontosság', ertek: 82, fill: '#4ecca3' },
    { name: 'Nehézség', ertek: 70, fill: '#ffc658' },
    { name: 'Konzisztencia', ertek: 75, fill: '#ff8042' },
  ];

  // 6. Aktivitás eloszlás napok szerint
  const activityByDayData = data.aktivitas_hetnapok ? 
    data.aktivitas_hetnapok.map((count, index) => {
      const napok = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
      return {
        name: napok[index],
        value: count
      };
    }) : 
    [
      { name: 'Hétfő', value: 120 },
      { name: 'Kedd', value: 150 },
      { name: 'Szerda', value: 180 },
      { name: 'Csütörtök', value: 160 },
      { name: 'Péntek', value: 140 },
      { name: 'Szombat', value: 60 },
      { name: 'Vasárnap', value: 40 }
    ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4ecca3', '#ffc658'];

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
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Adaptív nehézségi szint és teljesítmény</h5>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={adaptivData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nap" />
              <YAxis />
              <Tooltip />
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
      </div>
    </div>
  );

  const renderHaviGyakorlasi = () => (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Havi gyakorlási aktivitás</h5>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={naptar}
              margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
              barCategoryGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nap" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="feladatokSzama" name="Feladatok száma" radius={[2, 2, 0, 0]}>
                {naptar.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.feladatokSzama === 0 ? '#ddd' : `rgba(78, 204, 163, ${Math.min(1, entry.feladatokSzama / 25)})`} 
                  />
                ))}
              </Bar>
              <Brush dataKey="nap" height={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderOsztalyOsszehasonlitas = () => (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Teljesítményed az osztályátlaghoz képest</h5>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={140} data={osztalyOsszehasonlitasAdatok}>
              <PolarGrid />
              <PolarAngleAxis dataKey="kategoria" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Saját pontszám" dataKey="sajat" stroke="#4ecca3" fill="#4ecca3" fillOpacity={0.6} />
              <Radar name="Osztályátlag" dataKey="osztalyAtlag" stroke="#3498db" fill="#3498db" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTeljesitmenyHoterkep = () => {
    const hoterkepData = teljesitmenyHoterkepAdatok();
    const maxMeret = 10;

    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Szorzótábla teljesítmény hőtérkép</h5>
          
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-center">×</th>
                  {Array(maxMeret).fill().map((_, i) => (
                    <th key={i} className="text-center">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array(maxMeret).fill().map((_, sori) => (
                  <tr key={sori}>
                    <th className="text-center">
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
                          className="text-center position-relative"
                          style={{ backgroundColor: szin, color: teljesitmeny > 60 ? '#333' : '#fff' }}
                          data-toggle="tooltip" 
                          data-placement="top" 
                          title={`${sor}×${oszlop}=${sor*oszlop}, Teljesítmény: ${teljesitmeny}%, Próbálkozások: ${adat ? adat.probalkozasok : 0}`}
                        >
                          {sor * oszlop}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Jelmagyarázat */}
          <div className="mt-3 d-flex align-items-center justify-content-center">
            <div className="me-2">Teljesítmény:</div>
            <div className="d-flex align-items-center">
              <div className="d-inline-block me-1" style={{ width: '15px', height: '15px', backgroundColor: '#e74c3c' }}></div>
              <span className="me-2">Gyenge</span>
              
              <div className="d-inline-block me-1" style={{ width: '15px', height: '15px', backgroundColor: '#fdae61' }}></div>
              <span className="me-2">Közepes</span>
              
              <div className="d-inline-block me-1" style={{ width: '15px', height: '15px', backgroundColor: '#fee08b' }}></div>
              <span className="me-2">Jó</span>
              
              <div className="d-inline-block me-1" style={{ width: '15px', height: '15px', backgroundColor: '#7ed6b2' }}></div>
              <span className="me-2">Nagyon jó</span>
              
              <div className="d-inline-block me-1" style={{ width: '15px', height: '15px', backgroundColor: '#4ecca3' }}></div>
              <span>Kiváló</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeljesitmenyMeroszamok = () => (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Teljesítmény mérőszámok</h5>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
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
                background={{ fill: '#eee' }}
                dataKey="ertek"
                cornerRadius={10}
                label={{ position: 'insideStart', fill: '#333', fontSize: 12 }}
              />
              <Legend 
                iconSize={10} 
                layout="vertical" 
                verticalAlign="middle" 
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderActivityByDay = () => (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Felhasználói aktivitás eloszlása a hét napjai szerint</h5>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activityByDayData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {activityByDayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} aktivitás`, props.payload.name]} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-muted text-center mt-2">
          Ez a grafikon segít megérteni, hogy a diákok a hét mely napjain a legaktívabbak,
          ami segíthet az optimális támogatás és tartalom ütemezésében.
        </p>
      </div>
    </div>
  );

  // Grafikon kiválasztó tabfülek
  const tabs = [
    { id: 'adaptiv', name: 'Adaptív nehézség', component: renderAdaptivNehezsegiSzint },
    { id: 'havi', name: 'Havi aktivitás', component: renderHaviGyakorlasi },
    { id: 'osztaly', name: 'Osztályhoz képest', component: renderOsztalyOsszehasonlitas },
    { id: 'teljesitmeny', name: 'Teljesítmény hőtérkép', component: renderTeljesitmenyHoterkep },
    { id: 'meroszamok', name: 'Teljesítmény metrikák', component: renderTeljesitmenyMeroszamok },
    { id: 'napieloszlas', name: 'Aktivitás napok szerint', component: renderActivityByDay },
  ];

  return (
    <div className="advanced-charts-container">
      {/* Tab fejléc */}
      <ul className="nav nav-tabs mb-3">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${selectedTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Az aktuálisan kiválasztott grafikon megjelenítése */}
      {tabs.find(tab => tab.id === selectedTab)?.component()}
    </div>
  );
};

export default AdvancedCharts;
// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';

// Helper function to format ISO date string
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeCard, setActiveCard] = useState('statisztika');
  const [selectedClass, setSelectedClass] = useState('all'); // Default to 'all'
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // Default to 30 days
  const [showSideMenu, setShowSideMenu] = useState(true);
  const [availableClasses, setAvailableClasses] = useState(['all']);
  const [classPerformanceData, setClassPerformanceData] = useState([]); // State for class performance

  useEffect(() => {
    const element = document.getElementById('react-admin-dashboard');
    if (element && element.dataset.dashboardData) {
      try {
        const data = JSON.parse(element.dataset.dashboardData);
        
        // Ha a tanulok_szama attribútum elérhető, használjuk azt
        if (element.dataset.tanulokSzama) {
          const tanulokSzama = parseInt(element.dataset.tanulokSzama, 10);
          data.tanulok_szama = tanulokSzama;
          console.log("Tanulók száma betöltve:", tanulokSzama);
        }
        
        setDashboardData(data);
        setSelectedTimeRange(data.idoszak || '30'); // Set time range from backend data

        // Extract unique classes from user statistics
        if (data.user_statisztikak) {
          const classes = [...new Set(data.user_statisztikak.map(user => user.osztaly).filter(Boolean))];
          classes.sort(); // Sort classes alphabetically/numerically
          setAvailableClasses(['all', ...classes]);
        }
        
        // Set class performance data from backend
        if (data.osztalyok_teljesitmenye) {
            setClassPerformanceData(data.osztalyok_teljesitmenye);
        }

      } catch (error) {
        console.error("Error parsing dashboard data:", error);
        // Handle error, maybe set default data or show an error message
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Minta adatok - Keep for components not yet using backend data
  // const osztalyok = ['3',  '4.a', '4.b', '5.a', '5.b', '6.a', '6.b']; // Remove or replace if needed
  // const tanuloLista = [ ... ]; // Remove this, use dashboardData.user_statisztikak

  // Statisztikai adatok - Use dashboardData for KPIs
  const statData = dashboardData ? {
    osztalyokSzama: availableClasses.length > 1 ? availableClasses.length - 1 : 0, // Exclude 'all'
    tanulokSzama: dashboardData.tanulok_szama,  // Tanulók száma az adatbázisból
    feladatokSzama: dashboardData.osszes_valasz,
    atlagPontszam: dashboardData.atlag_pontszam,
    // javulasElozoHethez: 12.5, // Placeholder - calculate if needed
    // atlagosGyakorlasPercNap: 18 // Placeholder - calculate if needed
  } : { // Default values while loading
    osztalyokSzama: 0,
    tanulokSzama: 0,
    feladatokSzama: 0,
    atlagPontszam: 0,
    // javulasElozoHethez: 0,
    // atlagosGyakorlasPercNap: 0
  };

  // Problémás területek a szorzótáblában (osztály átlag) - Still sample data
  const problemasTeruletek = [
    { feladat: '7×8', helyesValaszArany: 45 },
    { feladat: '6×7', helyesValaszArany: 48 },
    { feladat: '8×9', helyesValaszArany: 52 },
    { feladat: '9×6', helyesValaszArany: 55 },
    { feladat: '7×7', helyesValaszArany: 58 },
  ];

  // Filtered student list based on selected class
  const filteredTanuloLista = dashboardData?.user_statisztikak
    ? dashboardData.user_statisztikak.filter(user => selectedClass === 'all' || user.osztaly === selectedClass)
    : [];

  const renderStatisztikakCard = () => {
    // Debug: közvetlenül a DOM-ból kiolvassuk a tanulók számát
    const tanuloSzamElem = document.getElementById('tanulok-szama-value');
    const tanuloSzam = tanuloSzamElem ? parseInt(tanuloSzamElem.value, 10) : 0;
    
    console.log("Tanulók száma DOM-ból:", tanuloSzam);
    console.log("Tanulók száma dashboardData-ból:", dashboardData?.tanulok_szama);
    
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h3 className="text-gray-400 text-sm mb-1">Regisztrált osztályok</h3> {/* Changed label */}
        <div className="text-3xl font-bold text-white">{statData.osztalyokSzama}</div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">Összes tanuló</div>
          <div className="text-lg font-medium text-white">
            {/* Közvetlenül használjuk a DOM-ból kiolvasott értéket */}
            {tanuloSzam}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h3 className="text-gray-400 text-sm mb-1">Regisztrált tanulók (összes)</h3> {/* Módosított címsor */}
        <div className="text-3xl font-bold text-white">{tanuloSzam?.toLocaleString() ?? '0'}</div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">Aktív felhasználók</div> {/* Módosított alcím */}
          <div className="text-lg font-medium text-white">{dashboardData?.aktiv_felhasznalok ?? '0'}</div>
        </div>
      </div>

      {/* Placeholder for Weekly Improvement / Daily Practice */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h3 className="text-gray-400 text-sm mb-1">Aktív felhasználók (7 nap)</h3>
        <div className="text-3xl font-bold text-green-500">{dashboardData?.aktiv_felhasznalok ?? '0'}</div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">Időszak</div>
          <div className="text-lg font-medium text-white">
            {selectedTimeRange === 'all' ? 'Összes' : `${selectedTimeRange} nap`}
          </div>
        </div>
      </div>

      {/* Osztályok átlag teljesítménye - Use classPerformanceData from state */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg col-span-1 md:col-span-2">
         <h3 className="text-gray-200 font-medium mb-3">Osztályok teljesítménye</h3>
         <div className="bg-gray-700 p-4 rounded-lg">
           {classPerformanceData.length > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {classPerformanceData.map(osztaly => (
                 <div key={osztaly.nev} className="p-2 bg-gray-600 rounded-lg">
                   <div className="text-lg font-medium text-white">{osztaly.nev}</div>
                   <div className="text-sm text-gray-300">Teljesítmény: {osztaly.teljesitmeny}%</div>
                   <div className="text-sm text-gray-300">Feladatok: {osztaly.feladatokSzama}</div>
                   <div className="mt-2 bg-gray-800 h-2 rounded-full">
                     <div
                       className="bg-green-500 h-2 rounded-full"
                       style={{ width: `${osztaly.teljesitmeny}%` }}
                       title={`${osztaly.teljesitmeny}%`}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-gray-400 text-center">Nincs megjeleníthető osztály teljesítmény adat.</p>
           )}
         </div>
      </div>

      {/* Tanároknak szóló javaslatok - Sample data */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        {/* ... existing code for suggestions ... */}
         <h3 className="text-lg font-medium text-gray-200 mb-3">Javaslatok tanároknak (Minta)</h3>
         <div className="space-y-3">
           <div className="p-3 bg-gray-700 rounded-lg">
             <h4 className="text-white font-medium">Fókuszáljanak a 7×8 szorzásra</h4>
             <p className="text-gray-300 text-sm mt-1">Az 5.b osztályban ez a legproblémásabb terület.</p>
           </div>
           <div className="p-3 bg-gray-700 rounded-lg">
             <h4 className="text-white font-medium">Több kihívás bevezetése</h4>
             <p className="text-gray-300 text-sm mt-1">A kihívás alapú tanulás 25%-os javulást mutat.</p>
           </div>
         </div>
      </div>

      {/* Teljesítmény hőtérképek - Uses backend data */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg col-span-3">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Szorzótábla hibák (Összesített)</h3>
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="w-10 h-10 bg-gray-700 text-gray-300 font-bold">×</th>
                {dashboardData?.hiba_oszlopok?.map((col, i) => (
                  <th key={i} className="w-10 h-10 bg-gray-700 text-gray-300 font-bold">
                    {col}
                  </th>
                )) ?? [...Array(10)].map((_, i) => <th key={i} className="w-10 h-10 bg-gray-700"></th>)}
              </tr>
            </thead>
            <tbody>
              {dashboardData?.hiba_matrix?.map((row, i) => (
                <tr key={i}>
                  <th className="w-10 h-10 bg-gray-700 text-gray-300 font-bold">
                    {dashboardData?.hiba_sorok?.[i] ?? i + 1}
                  </th>
                  {row.map((cellValue, j) => {
                    // Simple heatmap coloring based on error count
                    const maxErrors = Math.max(...dashboardData.hiba_matrix.flat()); // Find max error count for scaling
                    const intensity = maxErrors > 0 ? cellValue / maxErrors : 0;
                    const bgColor = cellValue === 0 ? '#374151' // gray-700 if no errors
                                     : `rgba(231, 76, 60, ${Math.max(0.2, intensity)})`; // Red intensity based on errors
                    const textColor = intensity > 0.5 ? '#fff' : '#e2e8f0'; // White or light gray text

                    return (
                      <td
                        key={j}
                        className="w-10 h-10 text-center font-medium"
                        style={{ backgroundColor: bgColor, color: textColor }}
                        title={`${dashboardData?.hiba_sorok?.[i] ?? i+1} × ${dashboardData?.hiba_oszlopok?.[j] ?? j+1}: ${cellValue} hiba`}
                      >
                        {cellValue > 0 ? cellValue : ''}
                      </td>
                    );
                  })}
                </tr>
              )) ?? [...Array(10)].map((_, i) => (
                  <tr key={i}>
                      <th className="w-10 h-10 bg-gray-700">{i+1}</th>
                      {[...Array(10)].map((_, j) => <td key={j} className="w-10 h-10 bg-gray-700"></td>)}
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

  const renderOsztalyCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg md:col-span-1">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Kiválasztott osztály: {selectedClass === 'all' ? 'Összes' : selectedClass}</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Válassz osztályt</label>
          <select
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {availableClasses.map(osztaly => (
              <option key={osztaly} value={osztaly}>
                {osztaly === 'all' ? 'Összes osztály' : osztaly}
              </option>
            ))}
          </select>
        </div>

        {/* Class specific stats - Placeholder/Sample */}
        <div className="space-y-3 mt-6">
          <div>
            <h4 className="text-sm text-gray-400">Tanulók száma (kiválasztott)</h4>
            <p className="text-xl font-medium text-white">{filteredTanuloLista.length}</p>
          </div>
          {/* Add more aggregated stats for the selected class if calculated */}
          {/* <div>
            <h4 className="text-sm text-gray-400">Átlag teljesítmény</h4>
            <p className="text-xl font-medium text-green-500">84%</p>
          </div> */}
        </div>

        {/* Nehézségi szint eloszlása - Sample data */}
        <div className="mt-6">
          {/* ... existing code for difficulty distribution ... */}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 shadow-lg md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-200">Tanulók listája</h3>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
            Exportálás
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700">
                {/* Update Headers */}
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vezetéknév</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Keresztnév</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Osztály</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Össz Pont</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Feladatok</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Telj. (%)</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Regisztrált</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTanuloLista.length > 0 ? (
                filteredTanuloLista.map((tanulo) => (
                  <tr key={tanulo.id}>
                    {/* Update Data Cells */}
                    <td className="py-3 px-4 text-sm font-medium text-white">{tanulo.last_name || '-'}</td>
                    <td className="py-3 px-4 text-sm font-medium text-white">{tanulo.first_name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{tanulo.osztaly || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-blue-400">{tanulo.ossz_pont}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{tanulo.megoldott_feladatok}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${tanulo.teljesitesi_arany}%` }}
                            title={`${tanulo.teljesitesi_arany}%`}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-300">{tanulo.teljesitesi_arany}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">{formatDate(tanulo.date_joined)}</td>
                    <td className="py-3 px-4 text-sm">
                      {/* Add relevant actions, maybe link to user detail page */}
                      <a href={`/admin/account/customuser/${tanulo.id}/change/`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 mr-3">Szerkesztés</a>
                      {/* <a href="#" className="text-blue-400 hover:text-blue-300">Üzenet</a> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-4 px-4 text-center text-gray-500">Nincsenek tanulók ebben az osztályban vagy időszakban.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Problémás területek - Sample data */}
        <div className="mt-6">
          {/* ... existing code for problematic areas ... */}
        </div>
      </div>
    </div>
  );

  const renderModszerekCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bal oldali panel: Hatékony tanítási módszerek */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Hatékony tanítási módszerek</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-300">3D Blockly alkalmazás</div>
            <div className="flex-1 mx-2">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
            <div className="w-16 text-sm text-gray-300">+32%</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-300">Vizuális szorzás</div>
            <div className="flex-1 mx-2">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-purple-500 h-4 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div className="w-16 text-sm text-gray-300">+28%</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-300">Interaktív grafikonok</div>
            <div className="flex-1 mx-2">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div className="w-16 text-sm text-gray-300">+25%</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-300">Űrlapkitöltéses feladatok</div>
            <div className="flex-1 mx-2">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-yellow-500 h-4 rounded-full" style={{ width: '21%' }}></div>
              </div>
            </div>
            <div className="w-16 text-sm text-gray-300">+21%</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-300">Pitagorasz táblázatok</div>
            <div className="flex-1 mx-2">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-pink-500 h-4 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            <div className="w-16 text-sm text-gray-300">+18%</div>
          </div>
        </div>
        
        {/* Magyarázó szövegblokk */}
        <div className="mt-6 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            A fenti százalékok azt jelzik, hogy az adott módszer mennyire növelte a tanulói teljesítményt 
            a hagyományos oktatási módszerekhez képest. A 3D Blockly alkalmazás és a vizuális szorzás 
            különösen hatékonynak bizonyult a matematikai készségek fejlesztésében.
          </p>
        </div>
      </div>

      {/* Jobb oldali panel: Új fejlesztések */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Új fejlesztések</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 p-2 bg-blue-900 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-white font-medium">3D Vizualizációs modulok</h4>
              <p className="text-gray-300 text-sm mt-1">
                Az új 3D-s modulok 32%-kal növelik a tanulói elköteleződést és megértést.
                Már elérhető a matematika és természetismereti tananyagokhoz.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0 p-2 bg-green-900 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-white font-medium">Vizuális szorzástáblák</h4>
              <p className="text-gray-300 text-sm mt-1">
                A vizuális szorzástáblák használata 28%-os javulást mutat a tanulók teljesítményében.
                Különösen hatékony az alacsonyabb évfolyamokon.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0 p-2 bg-purple-900 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-white font-medium">Interaktív teljesítmény grafikonok</h4>
              <p className="text-gray-300 text-sm mt-1">
                A tanulói teljesítményt megjelenítő interaktív grafikonok motiválóan hatnak és segítik az
                önreflexiót, átlagosan 25%-kal növelve a rendszeres gyakorlást.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Javaslatok a következő időszakra */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg md:col-span-2">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Javaslatok a következő időszakra</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-2">Gamifikáció bővítése</h4>
            <p className="text-gray-300 text-sm">
              A Tanoda platform gamifikációs elemeinek további bővítése (jelvények, szintek, versenyfeladatok) további 15-20%-os 
              teljesítménynövekedést eredményezhet, főleg a kevésbé motivált tanulóknál.
            </p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-2">AI alapú személyreszabás</h4>
            <p className="text-gray-300 text-sm">
              Javasoljuk a személyre szabott tanulási útvonalak fejlesztését, amely a tanuló 
              egyéni előrehaladásához és tanulási stílusához igazodik az eddigi teljesítmény elemzésével.
            </p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-2">Mobil alkalmazás</h4>
            <p className="text-gray-300 text-sm">
              A mobil platformokra optimalizált Tanoda alkalmazás fejlesztése növelheti a platformhoz való 
              hozzáférést és a napi gyakorlási időt a tanulók körében.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBeallitasokCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Rendszerbeállítások panel */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Általános beállítások (Minta adatok)</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Iskola neve</label>
            <input 
              type="text" 
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3"
              value="Tanoda Általános Iskola"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tanév</label>
            <select className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3">
              <option>2024/2025</option>
              <option>2023/2024</option>
              <option>2022/2023</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="push-notifications" type="checkbox" className="h-4 w-4 text-blue-500" checked readOnly />
              <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-300">
                Email értesítések engedélyezése
              </label>
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">
              Beállítások
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="analytics" type="checkbox" className="h-4 w-4 text-blue-500" checked readOnly />
              <label htmlFor="analytics" className="ml-2 block text-sm text-gray-300">
                Teljesítmény analitika engedélyezése
              </label>
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">
              Beállítások
            </button>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">
            Alapértelmezések
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Mentés
          </button>
        </div>
      </div>
      
      {/* Értesítési beállítások panel */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Értesítési beállítások (Minta adatok)</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Új tanuló regisztráció</h4>
              <p className="text-sm text-gray-400">Értesítés, ha új tanuló regisztrál a rendszerben</p>
            </div>
            <div className="relative">
              <input type="checkbox" id="new-student" className="sr-only" checked readOnly />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className="dot absolute left-1 top-1 bg-blue-500 w-6 h-6 rounded-full transition transform translate-x-6"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Teljesítmény riasztások</h4>
              <p className="text-sm text-gray-400">Figyelmeztetés, ha egy tanuló teljesítménye jelentősen csökken</p>
            </div>
            <div className="relative">
              <input type="checkbox" id="performance-alert" className="sr-only" checked readOnly />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className="dot absolute left-1 top-1 bg-blue-500 w-6 h-6 rounded-full transition transform translate-x-6"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Heti összefoglaló jelentések</h4>
              <p className="text-sm text-gray-400">Heti statisztikák és elemzések</p>
            </div>
            <div className="relative">
              <input type="checkbox" id="weekly-report" className="sr-only" checked readOnly />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className="dot absolute left-1 top-1 bg-blue-500 w-6 h-6 rounded-full transition transform translate-x-6"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Adatkezelési beállítások panel */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg md:col-span-2">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Adatkezelési beállítások (Minta adatok)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Adatmegőrzés</h4>
            <select className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3">
              <option>Határozatlan idő</option>
              <option>5 év</option>
              <option>3 év</option>
              <option>1 év</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">A tanulói adatok megőrzésének időtartama</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Biztonsági mentések</h4>
            <select className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3">
              <option>Naponta</option>
              <option>Hetente</option>
              <option>Havonta</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">Automatikus adatmentés gyakorisága</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-gray-300 mb-2">Adatexportálás</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV exportálás
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel exportálás
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              PDF jelentés
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  // Main component return
  if (!dashboardData) {
    // Optional: Render a loading state
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Adatok betöltése...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Oldalsó menü */}
      {showSideMenu && (
        <div className="w-64 bg-gray-800 p-4 shadow-lg flex flex-col"> 
          {/* Dashboard fejléc */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Tanoda</h1>
              <p className="text-xs text-gray-400">Admin Felület</p>
            </div>
          </div>
          
          {/* Fő menüpontok */}
          <div className="space-y-1">
            <button 
              onClick={() => setActiveCard('statisztika')} 
              className={`w-full text-left py-2 px-3 rounded-lg ${activeCard === 'statisztika' ? 'bg-blue-900 text-blue-300' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Statisztikák
            </button>
            <button 
              onClick={() => setActiveCard('osztaly')} 
              className={`w-full text-left py-2 px-3 rounded-lg ${activeCard === 'osztaly' ? 'bg-blue-900 text-blue-300' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Osztály kezelés
            </button>
            <button 
              onClick={() => setActiveCard('modszerek')} 
              className={`w-full text-left py-2 px-3 rounded-lg ${activeCard === 'modszerek' ? 'bg-blue-900 text-blue-300' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Tanítási módszerek
            </button>
            <button 
              onClick={() => setActiveCard('beallitasok')} 
              className={`w-full text-left py-2 px-3 rounded-lg ${activeCard === 'beallitasok' ? 'bg-blue-900 text-blue-300' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Rendszer beállítások
            </button>
          </div>

          {/* Felhasználói információ és kijelentkezés */}
          <div className="mt-auto pt-6 border-t border-gray-700"> 
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                {dashboardData?.user_statisztikak?.[0]?.first_name?.[0] || 'A'}{dashboardData?.user_statisztikak?.[0]?.last_name?.[0] || 'A'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{dashboardData?.user_statisztikak?.[0]?.first_name || 'Admin'} {dashboardData?.user_statisztikak?.[0]?.last_name || ''}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
            <button className="w-full py-2 px-3 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm text-gray-300">
              Kijelentkezés
            </button>
          </div>
        </div>
      )}

      {/* Fő tartalom */}
      <div className="flex-1 p-6 overflow-y-auto"> 
        {/* Fejléc sáv menü gombbal, keresővel és értesítésekkel */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setShowSideMenu(!showSideMenu)} 
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Keresés" 
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button className="p-1 ml-4 rounded-full relative text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            <button className="p-1 ml-3 rounded-full text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">
          {activeCard === 'statisztika' && 'Dashboard - Áttekintés'}
          {activeCard === 'osztaly' && 'Osztályok kezelése'}
          {activeCard === 'modszerek' && 'Tanítási módszerek'}
          {activeCard === 'beallitasok' && 'Rendszer beállítások'}
        </h2>

        {/* Render active card */}
        {activeCard === 'statisztika' && renderStatisztikakCard()}
        {activeCard === 'osztaly' && renderOsztalyCard()}
        {activeCard === 'modszerek' && renderModszerekCard()}
        {activeCard === 'beallitasok' && renderBeallitasokCard()}
      </div>
    </div>
  );
};

export default AdminDashboard;
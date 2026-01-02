import React, { useState } from 'react';
import ActivityChart from './ActivityChart';
import PerformanceChart from './PerformanceChart';
import HeatmapChart from './HeatmapChart';
import ProgressionChart from './ProgressionChart';
import WeekdayActivityChart from './WeekdayActivityChart';
import PitagoraszTableChart from './PitagoraszTableChart';

// Felhasználói Dashboard fő komponens
const UserDashboard = ({ data }) => {
  const [period, setPeriod] = useState(data.idoszak || '30');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Időszak váltás kezelése
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
    // Frissítés AJAX helyett egyszerű oldal újratöltéssel
    window.location.href = `/statisztika/?idoszak=${e.target.value}`;
  };

  // Advanced nézet kapcsolása
  const toggleAdvancedView = () => {
    setShowAdvanced(!showAdvanced);
  };
  
  return (
    <div className="user-dashboard">
      {/* Fejléc rész */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="dashboard-title">Felhasználói Teljesítmény Dashboard</h1>
          <p className="text-muted">Részletes statisztikák és fejlődési mutatók</p>
        </div>
        <div className="col-md-4">
          <div className="filter-form">
            <div className="row">
              <div className="col">
                <select 
                  className="form-select" 
                  value={period} 
                  onChange={handlePeriodChange}
                >
                  <option value="7">Utolsó 7 nap</option>
                  <option value="30">Utolsó 30 nap</option>
                  <option value="90">Utolsó 90 nap</option>
                  <option value="all">Összes</option>
                </select>
              </div>
              <div className="col">
                <button className="btn btn-primary" onClick={() => handlePeriodChange({ target: { value: period }})}>
                  Szűrés
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* KPI kártyák */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card kpi-card">
            <div className="card-body">
              <h5 className="card-title">Összes pont</h5>
              <p className="display-4">{data.osszes_pont || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card kpi-card">
            <div className="card-body">
              <h5 className="card-title">Sikeres megoldások</h5>
              <p className="display-4">{data.sikeres_megoldasok || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card kpi-card">
            <div className="card-body">
              <h5 className="card-title">Átlagos teljesítmény</h5>
              <p className="display-4">{data.atlagos_teljesitmeny || 0}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card kpi-card">
            <div className="card-body">
              <h5 className="card-title">Összes megoldott feladat</h5>
              <p className="display-4">{data.megoldott_feladatok || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nézet váltás */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-end">
            <button 
              className={`btn ${showAdvanced ? 'btn-success' : 'btn-outline-success'}`}
              onClick={toggleAdvancedView}
            >
              {showAdvanced ? 'Egyszerűsített nézet' : 'Részletes adatok mutatása'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Alap grafikonok */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Aktivitási trend</h5>
              <ActivityChart 
                dates={data.aktivitas_idopontok || []}
                values={data.aktivitas_ertekek || []}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Teljesítmény nehézségi szint szerint</h5>
              <PerformanceChart 
                levels={data.nehezsegi_szintek || []}
                values={data.teljesitesi_aranyok || []}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Pitagorasz tábla (mindig megjelenik) */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Pitagorasz Tábla (1-10 Szorzótábla)</h5>
              <PitagoraszTableChart size={10} />
              <div className="mt-3">
                <p className="text-muted small">
                  A Pitagorasz tábla segít vizualizálni a szorzótáblát. A színek az értékeket jelzik: 
                  a kéktől (kisebb számok) a piroson át (nagyobb számok).
                  Használd ezt a táblát a szorzások gyakorlásához!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* További grafikonok */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Fejlődési görbe</h5>
              <ProgressionChart 
                dates={data.fejlodes_idopontok || []}
                values={data.fejlodes_ertekek || []}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Aktivitás a hét napjai szerint</h5>
              <WeekdayActivityChart 
                data={data.aktivitas_hetnapok || [0, 0, 0, 0, 0, 0, 0]}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Csak akkor jelenik meg, ha részletes nézetben vagyunk */}
      {showAdvanced && (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Hibagyakoriság hőtérképe</h5>
                  <HeatmapChart 
                    matrix={data.hiba_matrix || [[]]}
                    xLabels={data.hiba_oszlopok || []}
                    yLabels={data.hiba_sorok || []}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Legutóbbi aktivitások táblázata */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Legutóbbi aktivitások</h5>
                  {data.legutobbi_pontszamok && data.legutobbi_pontszamok.length > 0 ? (
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Dátum</th>
                          <th>Pontszám</th>
                          <th>Max pontszám</th>
                          <th>Hatékonyság</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.legutobbi_pontszamok.map((pont, index) => (
                          <tr key={index}>
                            <td>{pont.datum}</td>
                            <td>{pont.pontszam}</td>
                            <td>{pont.max_pontszam}</td>
                            <td>{pont.hatekonysag}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="alert alert-info">
                      Nincs megjeleníthető adatod az adott időszakban.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Motivációs üzenet és tippek */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Tippek a fejlődéshez</h5>
              <p>
                Rendszeres gyakorlással érheted el a legjobb eredményeket. A statisztikáidból látszik, hogy
                {data.aktivitas_hetnapok && Math.max(...data.aktivitas_hetnapok) > 0 ? (
                  <>
                    {' '}a hét {['hétfői', 'keddi', 'szerdai', 'csütörtöki', 'pénteki', 'szombati', 'vasárnapi'][data.aktivitas_hetnapok.indexOf(Math.max(...data.aktivitas_hetnapok))]} 
                    napján vagy a legaktívabb.
                  </>
                ) : ' még nem teltél fel elég adatot az aktivitási mintád elemzéséhez.'}
                {' '}Próbálj meg rendszeresen, akár naponta 10-15 percet szánni a gyakorlásra!
              </p>
              <div className="alert alert-success">
                <strong>Emlékeztető:</strong> A szuperpozícióban levő emberi elme, szív univerzumteremtő erejével
                már minden napi gyakorlással jelentős fejlődést érhetsz el!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
import React, { useState } from 'react';
import CoordinateSystem2D from './CoordinateSystem2D';
import CoordinateSystem3D from './CoordinateSystem3D';
import PitagoraszTable from './PitagoraszTable';
import PopulationChart from './PopulationChart';
import CivilizationChart from './CivilizationChart';

const KoordinataCharts = ({ data2D, data3D }) => {
  // For 2D coordinate system
  const [szorzo2D, setSzorzo2D] = useState(Math.floor(Math.random() * 21) - 10);
  const [szorzando2D, setSzorzando2D] = useState(Math.floor(Math.random() * 21) - 10);
  const [answer2D, setAnswer2D] = useState('');
  const [feedback2D, setFeedback2D] = useState({ show: false, correct: false, message: '' });

  // For 3D coordinate system
  const [szorzo3D1, setSzorzo3D1] = useState(Math.floor(Math.random() * 10) + 1);
  const [szorzo3D2, setSzorzo3D2] = useState(Math.floor(Math.random() * 10) + 1);
  const [szorzo3D3, setSzorzo3D3] = useState(Math.floor(Math.random() * 10) + 1);
  const [answer3D, setAnswer3D] = useState('');
  const [feedback3D, setFeedback3D] = useState({ show: false, correct: false, message: '' });

  // Check 2D answer
  const check2D = () => {
    const userAnswer = parseInt(answer2D);
    const correctAnswer = szorzo2D * szorzando2D;
    const isNegativeProduct = (szorzo2D * szorzando2D) < 0;
    
    if (userAnswer === correctAnswer) {
      const explanation = isNegativeProduct 
        ? "Helyes! Két különböző előjelű szám szorzata negatív." 
        : "Helyes! Két azonos előjelű szám szorzata pozitív.";
      
      setFeedback2D({
        show: true,
        correct: true,
        message: `<strong>Gratulálunk!</strong> ${explanation}<br>
                <em>Szabály: Két azonos előjelű szám szorzata pozitív, 
                két különböző előjelű szám szorzata negatív lesz.</em>`
      });
      
      setAnswer2D('');
      
      // Generate new numbers after a delay
      setTimeout(() => {
        setSzorzo2D(Math.floor(Math.random() * 21) - 10);
        setSzorzando2D(Math.floor(Math.random() * 21) - 10);
        setFeedback2D({ show: false, correct: false, message: '' });
      }, 3000);
    } else {
      if (isNegativeProduct && userAnswer === Math.abs(correctAnswer)) {
        setFeedback2D({
          show: true,
          correct: false,
          message: `<strong>Majdnem!</strong> De ne feledd, két különböző előjelű szám szorzata negatív.<br>
                   A helyes válasz: ${correctAnswer}<br>
                   <em>Szabály: Két azonos előjelű szám szorzata pozitív, 
                   két különböző előjelű szám szorzata negatív lesz.</em>`
        });
      } else {
        setFeedback2D({
          show: true,
          correct: false,
          message: `<strong>Helytelen.</strong> A helyes válasz: ${correctAnswer}<br>
                   <em>Szabály: Két azonos előjelű szám szorzata pozitív, 
                   két különböző előjelű szám szorzata negatív lesz.</em>`
        });
      }
    }
  };

  // Check 3D answer
  const check3D = () => {
    const userAnswer = parseInt(answer3D);
    const correctAnswer = szorzo3D1 * szorzo3D2 * szorzo3D3;
    
    if (userAnswer === correctAnswer) {
      setFeedback3D({
        show: true,
        correct: true,
        message: `<strong>Gratulálunk!</strong> A válasz helyes!<br>
                <em>${szorzo3D1} × ${szorzo3D2} × ${szorzo3D3} = ${correctAnswer}</em>`
      });
      
      setAnswer3D('');
      
      // Generate new numbers after a delay
      setTimeout(() => {
        setSzorzo3D1(Math.floor(Math.random() * 10) + 1);
        setSzorzo3D2(Math.floor(Math.random() * 10) + 1);
        setSzorzo3D3(Math.floor(Math.random() * 10) + 1);
        setFeedback3D({ show: false, correct: false, message: '' });
      }, 3000);
    } else {
      setFeedback3D({
        show: true,
        correct: false,
        message: `<strong>Helytelen.</strong> A helyes válasz: ${correctAnswer}<br>
                 <em>${szorzo3D1} × ${szorzo3D2} × ${szorzo3D3} = ${correctAnswer}</em>`
      });
    }
  };

  const handleKeyPress = (e, checkFunction) => {
    if (e.key === 'Enter') {
      checkFunction();
    }
  };

  return (
    <>
      {/* This is just a container for mounting charts in their respective tabs */}
      {/* The actual tab system is handled by the Django template */}
      <div className="row">
        <div className="col-md-6">
          <h3>Síkban</h3>
          <CoordinateSystem2D 
            szorzo={szorzo2D} 
            szorzando={szorzando2D} 
          />
          
          <div className="mt-3">
            <h4></h4>
            <p>Mennyi <span id="szorzo-2d">{szorzo2D}</span> * <span id="szorzando-2d">{szorzando2D}</span>?</p>
            <input 
              type="number" 
              className="form-control mb-2" 
              value={answer2D}
              onChange={(e) => setAnswer2D(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, check2D)}
            />
            <button onClick={check2D} className="btn btn-primary">Ellenőrzés</button>
            {feedback2D.show && (
              <div className={`alert mt-2 ${feedback2D.correct ? 'alert-success' : 'alert-danger'}`} 
                   dangerouslySetInnerHTML={{ __html: feedback2D.message }}>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <h3>Térben</h3>
          <CoordinateSystem3D 
            szorzo1={szorzo3D1} 
            szorzo2={szorzo3D2} 
            szorzo3={szorzo3D3} 
          />
          
          <div className="mt-3">
            <h4></h4>
            <p>Mennyi <span>{szorzo3D1}</span> * <span>{szorzo3D2}</span> * <span>{szorzo3D3}</span>?</p>
            <input 
              type="number" 
              className="form-control mb-2"
              value={answer3D}
              onChange={(e) => setAnswer3D(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, check3D)}
            />
            <button onClick={check3D} className="btn btn-primary">Ellenőrzés</button>
            {feedback3D.show && (
              <div className={`alert mt-2 ${feedback3D.correct ? 'alert-success' : 'alert-danger'}`}
                   dangerouslySetInnerHTML={{ __html: feedback3D.message }}>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default KoordinataCharts;
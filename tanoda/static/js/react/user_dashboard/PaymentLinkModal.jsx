import React, { useState } from "react";
import axios from "axios";

const PRESETS = [1000, 2500, 5000];

export default function PaymentLinkModal({ sponsorIds, state, setState, onClose, setToast }) {
  const [localAmount, setLocalAmount] = useState(state.amount);
  const [customAmount, setCustomAmount] = useState("");
  const [purpose, setPurpose] = useState(state.purpose);

  const handlePreset = (amt) => {
    setLocalAmount(amt);
    setCustomAmount("");
  };
  const handleCustom = (e) => {
    setCustomAmount(e.target.value);
    setLocalAmount(Number(e.target.value) || 0);
  };
  const handleGenerate = () => {
    setState(s => ({ ...s, loading: true, error: "", link: "" }));
    axios.post("/api/monetization/payment-links/", {
      sponsor_ids: sponsorIds,
      amount_huf: localAmount,
      purpose
    })
      .then(res => setState(s => ({ ...s, link: res.data.link, loading: false, error: "" })))
      .catch(() => setState(s => ({ ...s, error: "Hiba történt.", loading: false })));
  };
  const handleCopy = () => {
    if (state.link) {
      navigator.clipboard.writeText(state.link);
      setState(s => ({ ...s, copied: true }));
      setToast({ type: "success", message: "Payment link elkészült. Másold és küldd el." });
    }
  };
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ background: "white", padding: 32, borderRadius: 12, minWidth: 320 }}>
        <h3>Payment link generálása</h3>
        <div>
          <div>Összeg presetek:</div>
          {PRESETS.map(amt => (
            <button key={amt} onClick={() => handlePreset(amt)} style={{ margin: 4, background: localAmount === amt ? "#1976d2" : undefined, color: localAmount === amt ? "#fff" : undefined }}>{amt} HUF</button>
          ))}
        </div>
        <div style={{ margin: "8px 0" }}>
          <input
            type="number"
            placeholder="Egyedi összeg (HUF)"
            value={customAmount}
            onChange={handleCustom}
            min={1}
            style={{ width: 120 }}
          />
        </div>
        <div style={{ margin: "8px 0" }}>
          <input
            type="text"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="Leírás"
            style={{ width: 200 }}
          />
        </div>
        <button onClick={handleGenerate} disabled={state.loading || !localAmount}>
          Link generálása
        </button>
        {state.loading && <span> Generálás...</span>}
        {state.error && <div style={{ color: "red" }}>{state.error}</div>}
        {state.link && (
          <div style={{ marginTop: 16 }}>
            <input type="text" value={state.link} readOnly style={{ width: "100%" }} />
            <button onClick={handleCopy} style={{ marginTop: 8 }}>Másolás</button>
            {state.copied && <span style={{ color: "green", marginLeft: 8 }}>Másolva!</span>}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <button onClick={onClose}>Bezárás</button>
        </div>
      </div>
    </div>
  );
}

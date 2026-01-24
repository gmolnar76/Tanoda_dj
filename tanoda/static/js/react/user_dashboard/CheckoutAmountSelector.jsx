import React from "react";
export default function CheckoutAmountSelector({ presets, amount, customAmount, onPreset, onCustom }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div>Összeg:</div>
      {presets.map(amt => (
        <button key={amt} onClick={() => onPreset(amt)} style={{ margin: 4, background: amount === amt ? "#1976d2" : undefined, color: amount === amt ? "#fff" : undefined }}>{amt} HUF</button>
      ))}
      <input
        type="number"
        placeholder="Egyedi összeg"
        value={customAmount}
        onChange={onCustom}
        min={1}
        style={{ width: 120, marginLeft: 8 }}
      />
    </div>
  );
}

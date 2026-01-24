import React from "react";

export default function SponsorAddInput({ value, error, loading, onChange, onAdd }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="email"
        placeholder="Új finanszírozó e-mail címe"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
        style={{ marginRight: 8 }}
      />
      <button onClick={onAdd} disabled={loading || !value}>
        Hozzáadás
      </button>
      {error && <div style={{ color: "red", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

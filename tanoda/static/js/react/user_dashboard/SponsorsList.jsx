import React from "react";

export default function SponsorsList({ sponsors, selectedIds, onSelect, onDelete, loading, searchQuery, setSearchQuery }) {
  if (loading) {
    return <div className="skeleton-list">Betöltés...</div>;
  }
  if (!sponsors.length) {
    return <div className="empty-state">Még nincs finanszírozó. Adj hozzá egy e-mail címet lent.</div>;
  }
  const allSelected = sponsors.length && selectedIds.length === sponsors.length;
  const handleSelectAll = () => {
    if (allSelected) onSelect([]);
    else onSelect(sponsors.map(s => s.id));
  };
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) onSelect(selectedIds.filter(sid => sid !== id));
    else onSelect([...selectedIds, id]);
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Keresés email / név szerint"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div>
        <label>
          <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
          Mind kijelöl / kijelölés törlése
        </label>
      </div>
      <ul>
        {sponsors.map(s => (
          <li key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={selectedIds.includes(s.id)}
              onChange={() => handleSelect(s.id)}
            />
            <span>{s.name ? `${s.name} (${s.email})` : s.email}</span>
            <button onClick={() => onDelete(s.id)} style={{ marginLeft: "auto" }}>Törlés</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

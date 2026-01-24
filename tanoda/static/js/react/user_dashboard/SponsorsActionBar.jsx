import React from "react";

export default function SponsorsActionBar({ disabled, onSendInvitation, onOpenPaymentLink, selectedCount, loading }) {
  return (
    <div style={{ margin: "16px 0", display: "flex", gap: 8 }}>
      <button
        onClick={onSendInvitation}
        disabled={disabled}
        title={disabled ? "Jelölj ki legalább egy finanszírozót!" : undefined}
      >
        Meghívó küldése
      </button>
      <button
        onClick={onOpenPaymentLink}
        disabled={disabled}
        title={disabled ? "Jelölj ki legalább egy finanszírozót!" : undefined}
      >
        Payment link generálása
      </button>
      {loading && <span>Feldolgozás...</span>}
      {selectedCount > 0 && <span>{selectedCount} kijelölve</span>}
    </div>
  );
}

import React from "react";
export default function CheckoutSummary({ summary }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2>{summary.purpose || "Tanoda támogatás"}</h2>
      {summary.description && <div>{summary.description}</div>}
    </div>
  );
}

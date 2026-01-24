import React from "react";

const typeToColor = {
  info: "#1976d2",
  success: "#4caf50",
  error: "#f44336"
};

export default function NotificationItem({ type, message, timestamp, status }) {
  return (
    <div style={{
      background: typeToColor[type] || "#eee",
      color: "#fff",
      padding: "12px 16px",
      borderRadius: 8,
      margin: "8px 0",
      display: "flex",
      alignItems: "center",
      gap: 12
    }}>
      <span style={{ fontWeight: 600 }}>{message}</span>
      <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>{new Date(timestamp).toLocaleString()}</span>
      {status && <span style={{ marginLeft: 12, fontSize: 12 }}>{status === "pending" ? "Várakozik" : status === "approved" ? "Jóváhagyva" : "Elutasítva"}</span>}
    </div>
  );
}

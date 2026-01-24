import React, { useEffect } from "react";

export default function Toast({ type, message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      background: type === "error" ? "#f44336" : "#4caf50",
      color: "white",
      padding: "12px 24px",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      zIndex: 1000
    }}>
      {message}
    </div>
  );
}

import React from "react";
export default function CheckoutSkeleton() {
  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24 }}>
      <div className="skeleton" style={{ height: 32, width: 200, background: "#eee", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 24, width: 120, background: "#eee", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 40, width: 180, background: "#eee" }} />
    </div>
  );
}

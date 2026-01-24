import React from "react";
export default function CheckoutStatus({ type }) {
  return (
    <div style={{ textAlign: "center", marginTop: 64 }}>
      {type === "success" ? (
        <div>
          <h2>Fizetés sikeres!</h2>
          <div>Köszönjük a támogatást.</div>
        </div>
      ) : (
        <div>
          <h2>Fizetés sikertelen</h2>
          <div>Próbáld újra később.</div>
        </div>
      )}
    </div>
  );
}

import React from "react";
export default function CheckoutActionBar({ disabled, onPay, submitting }) {
  return (
    <div>
      <button onClick={onPay} disabled={disabled}>
        {submitting ? "Fizetés..." : "Fizetés indítása"}
      </button>
    </div>
  );
}

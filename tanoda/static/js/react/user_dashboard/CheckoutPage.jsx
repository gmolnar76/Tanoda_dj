import React, { useState, useEffect } from "react";
import axios from "axios";
import Toast from "./Toast";
import CheckoutSummary from "./CheckoutSummary";
import CheckoutAmountSelector from "./CheckoutAmountSelector";
import CheckoutActionBar from "./CheckoutActionBar";
import CheckoutStatus from "./CheckoutStatus";
import CheckoutSkeleton from "./CheckoutSkeleton";

export default function CheckoutPage({ token }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | "success" | "fail"
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/pay/${token}/`)
      .then(res => {
        setSummary(res.data);
        setAmount(res.data.default_amount || "");
      })
      .catch(() => setError("Hiba a payment link betöltésekor."))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePreset = (amt) => {
    setAmount(amt);
    setCustomAmount("");
  };
  const handleCustom = (e) => {
    setCustomAmount(e.target.value);
    setAmount(Number(e.target.value) || "");
  };

  const handlePay = () => {
    if (!amount || amount < 1) {
      setError("Adj meg érvényes összeget!");
      return;
    }
    setSubmitting(true);
    setError("");
    axios.post(`/api/pay/${token}/start/`, { amount_huf: amount })
      .then(() => {
        setStatus("success");
        setToast({ type: "success", message: "Fizetés sikeres (szimulált)!" });
      })
      .catch(() => {
        setStatus("fail");
        setToast({ type: "error", message: "Fizetés sikertelen." });
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) return <CheckoutSkeleton />;
  if (status === "success") return <CheckoutStatus type="success" />;
  if (status === "fail") return <CheckoutStatus type="fail" />;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <CheckoutSummary summary={summary} />
      <CheckoutAmountSelector
        presets={summary.presets || [1000, 2500, 5000]}
        amount={amount}
        customAmount={customAmount}
        onPreset={handlePreset}
        onCustom={handleCustom}
      />
      {error && <div style={{ color: "red", margin: "8px 0" }}>{error}</div>}
      <CheckoutActionBar
        disabled={!amount || submitting}
        onPay={handlePay}
        submitting={submitting}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

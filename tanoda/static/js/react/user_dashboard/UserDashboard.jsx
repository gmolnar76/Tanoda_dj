import React, { useEffect, useState } from "react";
import WalletSummaryCards from "./components/WalletSummaryCards";
import LedgerTimeline from "./components/LedgerTimeline";
import {
  fetchDashboardSummary,
  fetchDashboardTimeline,
} from "./components/api";

export default function UserDashboard() {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const s = await fetchDashboardSummary();
        const t = await fetchDashboardTimeline();
        setSummary(s);
        setTimeline(t);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  if (error) {
    return <div className="text-red-500">Hiba: {error}</div>;
  }

  return (
    <div className="p-6 text-slate-100">
      <h1 className="mb-4 text-2xl font-bold">Tanoda – Áttekintés</h1>
      <WalletSummaryCards summary={summary} />
      <LedgerTimeline entries={timeline} />
    </div>
  );
}

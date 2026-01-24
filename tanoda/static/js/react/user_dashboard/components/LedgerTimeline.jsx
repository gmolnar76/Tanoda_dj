import React from "react";

export default function LedgerTimeline({ entries }) {
  return (
    <div className="mt-6 rounded-xl bg-slate-900 p-4">
      <h3 className="mb-3 text-lg font-semibold">Pénzmozgások</h3>
      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="flex justify-between text-sm">
            <span>{e.label}</span>
            <span
              className={
                e.direction === "in"
                  ? "text-green-400"
                  : e.direction === "out"
                  ? "text-red-400"
                  : "text-slate-400"
              }
            >
              {e.amount} Ft
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import React from "react";

export default function WalletSummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    { title: "Elérhető pénz", value: summary.available, suffix: "Ft" },
    { title: "Tanulás alatt", value: summary.locked, suffix: "Ft" },
    { title: "Már kifizetve", value: summary.paid_out, suffix: "Ft" },
    { title: "Finanszírozók száma", value: summary.sources_count, suffix: "forrás" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="rounded-xl bg-slate-900 p-4">
          <div className="text-sm text-slate-400">{c.title}</div>
          <div className="text-2xl font-bold">
            {c.value} {c.suffix}
          </div>
        </div>
      ))}
    </div>
  );
}

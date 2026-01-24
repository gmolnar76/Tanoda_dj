export async function fetchDashboardSummary() {
  const res = await fetch("/api/monetization/dashboard/summary/", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Summary fetch failed");
  return res.json();
}

export async function fetchDashboardTimeline(limit = 20) {
  const res = await fetch(
    `/api/monetization/dashboard/timeline/?limit=${limit}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Timeline fetch failed");
  return res.json();
}

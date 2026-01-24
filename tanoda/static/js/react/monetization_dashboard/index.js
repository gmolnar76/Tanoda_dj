import React from "react";
import { createRoot } from "react-dom/client";
import UserDashboard from "../user_dashboard/UserDashboard";

const el = document.getElementById("react-monetization-dashboard-root");
if (!el) {
  console.warn('[React:monetization-dashboard] Mount point not found');
} else {
  createRoot(el).render(<UserDashboard />);
}

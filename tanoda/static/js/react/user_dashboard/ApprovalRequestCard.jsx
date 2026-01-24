import React from "react";

export default function ApprovalRequestCard({
  request,
  onApprove,
  onReject,
  busy,
  error,
}) {
  const { id, message, status, createdAt } = request;
  const isPending = status === "pending";
  const approveDisabled = !isPending || busy === "approve" || !!busy;
  const rejectDisabled = !isPending || busy === "reject" || !!busy;

  return (
    <div
      style={{
        border: "1px solid #1976d2",
        borderRadius: 8,
        padding: 16,
        margin: "16px 0",
        background: "#e3f2fd",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{message}</div>
      <div style={{ fontSize: 12, color: "#1976d2", marginBottom: 8 }}>
        {new Date(createdAt).toLocaleString()}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onApprove(id)}
          disabled={approveDisabled}
          style={{
            background: "#4caf50",
            color: "#fff",
            border: 0,
            padding: "6px 16px",
            borderRadius: 4,
            opacity: approveDisabled ? 0.7 : 1,
            cursor: approveDisabled ? "not-allowed" : "pointer",
          }}
        >
          {busy === "approve" ? "Mentés…" : "Jóváhagyom"}
        </button>
        <button
          onClick={() => onReject(id)}
          disabled={rejectDisabled}
          style={{
            background: "#f44336",
            color: "#fff",
            border: 0,
            padding: "6px 16px",
            borderRadius: 4,
            opacity: rejectDisabled ? 0.7 : 1,
            cursor: rejectDisabled ? "not-allowed" : "pointer",
          }}
        >
          {busy === "reject" ? "Mentés…" : "Elutasítom"}
        </button>
      </div>
      {error && (
        <div style={{ color: "red", fontSize: 13, marginTop: 8 }}>{error}</div>
      )}
      {status === "approved" && (
        <div style={{ color: "#388e3c", marginTop: 8 }}>
          A fizetés jóváhagyva. Indítható.
        </div>
      )}
      {status === "rejected" && (
        <div style={{ color: "#d32f2f", marginTop: 8 }}>
          A fizetés nem lett jóváhagyva.
        </div>
      )}
    </div>
  );
}

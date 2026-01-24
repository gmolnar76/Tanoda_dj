import React, { useMemo } from "react";
import NotificationItem from "./NotificationItem";
import ApprovalRequestCard from "./ApprovalRequestCard";

/**
 * ParentNotificationsPanel
 *
 * Props:
 * - notifications: Array<NotificationEvent>
 * - approvalRequests: Array<ApprovalRequest>
 * - onApprove: (id: number) => Promise<void> | void
 * - onReject: (id: number) => Promise<void> | void
 * - busyMap?: Record<number, "approve" | "reject" | null>   (optional)
 * - isLoading?: boolean (optional)
 */
export default function ParentNotificationsPanel({
  notifications = [],
  approvalRequests = [],
  onApprove,
  onReject,
  busyMap = {},
  isLoading = false,
}) {
  const pendingApprovals = useMemo(() => {
    // Ha a backend más státuszokat is küld, itt safe-eljük.
    return (approvalRequests || []).filter((a) => a?.status === "pending");
  }, [approvalRequests]);

  const sortedNotifications = useMemo(() => {
    // Legfrissebb elöl (ha timestamp parse-olható)
    const arr = [...(notifications || [])];
    arr.sort((a, b) => {
      const ta = Date.parse(a?.timestamp || "") || 0;
      const tb = Date.parse(b?.timestamp || "") || 0;
      return tb - ta;
    });
    return arr;
  }, [notifications]);

  const hasAny =
    pendingApprovals.length > 0 || (sortedNotifications?.length ?? 0) > 0;

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #eee",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Szülői értesítések</h2>

        {pendingApprovals.length > 0 && (
          <span
            style={{
              fontSize: 12,
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid #1976d2",
              color: "#1976d2",
              background: "rgba(25, 118, 210, 0.06)",
            }}
            title="Jóváhagyásra váró kérelmek"
          >
            {pendingApprovals.length} pending
          </span>
        )}

        {isLoading && (
          <span style={{ fontSize: 12, color: "#666" }}>Betöltés…</span>
        )}
      </div>

      {/* Empty state */}
      {!hasAny && !isLoading && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #f0f0f0",
            background: "#fafafa",
            color: "#444",
          }}
        >
          Nincs új értesítés.
        </div>
      )}

      {/* Approval requests */}
      {pendingApprovals.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Jóváhagyásra vár
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {pendingApprovals.map((req) => (
              <ApprovalRequestCard
                key={req.id}
                request={req}
                onApprove={onApprove}
                onReject={onReject}
                // Opcionális: ha a kártya tudja kezelni
                busy={busyMap?.[req.id] ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {sortedNotifications.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Események
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {sortedNotifications.map((n) => (
              <NotificationItem
                // Ha van id, azt használjuk; fallback: timestamp+kind
                key={n?.id ?? `${n?.timestamp || "no-ts"}-${n?.kind || "evt"}`}
                {...n}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useMemo, useState } from "react";
import ParentNotificationsPanel from "./ParentNotificationsPanel";
import { useParentNotificationsPolling } from "../../../../../src/hooks/useParentNotificationsPolling";
import { approveRequest, rejectRequest } from "../../../../../src/api/parentNotifications";

export default function ParentNotificationsPollingPanel() {
  const {
    notifications,
    approvalRequests,
    nextCursor,
    status,
    error,
    refresh,
    loadMore,
  } = useParentNotificationsPolling();

  const [busy, setBusy] = useState({});      // { [id]: "approve" | "reject" }
  const [loadingMore, setLoadingMore] = useState(false);

  const isInitialLoading =
    (status === "idle" || status === "loading") &&
    (notifications?.length ?? 0) === 0 &&
    (approvalRequests?.length ?? 0) === 0;

  const hasAny =
    (notifications?.length ?? 0) > 0 || (approvalRequests?.length ?? 0) > 0;

  const pendingApprovals = useMemo(
    () => (approvalRequests ?? []).filter((a) => a.status === "pending"),
    [approvalRequests]
  );

  const handleApprove = useCallback(
    async (id) => {
      setBusy((m) => ({ ...m, [id]: "approve" }));
      try {
        await approveRequest(id);
        await refresh();
      } finally {
        setBusy((m) => ({ ...m, [id]: null }));
      }
    },
    [refresh]
  );

  const handleReject = useCallback(
    async (id) => {
      setBusy((m) => ({ ...m, [id]: "reject" }));
      try {
        await rejectRequest(id);
        await refresh();
      } finally {
        setBusy((m) => ({ ...m, [id]: null }));
      }
    },
    [refresh]
  );

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadMore]);

  // ERROR state (felső sáv)
  return (
    <div>
      {error && (
        <div style={{ color: "#b00020", background: "#ffe8ec", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>Kapcsolati hiba</div>
          <div style={{ marginTop: 4 }}>{error}</div>
          <button
            onClick={refresh}
            style={{ marginTop: 8, padding: "6px 12px", borderRadius: 6, border: "1px solid #b00020", background: "transparent", cursor: "pointer" }}
          >
            Újrapróbál
          </button>
        </div>
      )}

      {/* Initial loading / empty state */}
      {isInitialLoading && (
        <div style={{ padding: 12, opacity: 0.8 }}>
          Betöltés…
        </div>
      )}

      {!isInitialLoading && !hasAny && !error && (
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, opacity: 0.85 }}>
          Nincs új értesítés.
        </div>
      )}

      {/* Main panel (csak ha van mit mutatni, vagy ha a panel maga tud empty-t kezelni) */}
      {(hasAny || (!isInitialLoading && !error)) && (
        <ParentNotificationsPanel
          notifications={notifications}
          approvalRequests={pendingApprovals} // csak pendinget adunk át (opcionális, de tisztább)
          onApprove={handleApprove}
          onReject={handleReject}
          busyMap={busy} // ha a belső panel tudja használni (ha nem, hagyd ki)
        />
      )}

      {/* Load more */}
      {nextCursor && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              padding: "8px 24px",
              borderRadius: 6,
              background: loadingMore ? "#90a4ae" : "#1976d2",
              color: "#fff",
              border: 0,
              cursor: loadingMore ? "default" : "pointer",
              opacity: loadingMore ? 0.9 : 1,
            }}
          >
            {loadingMore ? "Betöltés…" : "További értesítések betöltése"}
          </button>
        </div>
      )}
    </div>
  );
}

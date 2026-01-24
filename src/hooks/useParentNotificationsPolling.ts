import { useCallback, useEffect, useRef, useState } from "react";
import { fetchParentNotifications } from "../api/parentNotifications";
import type {
  ApprovalRequest,
  NotificationEvent,
} from "../api/parentNotifications";


type Status = "idle" | "loading" | "ok" | "error";

export function useParentNotificationsPolling(pollMs = 15000) {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);
  const timer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current || document.hidden) return;
    inFlight.current = true;

    try {
      const data = await fetchParentNotifications();
      setNotifications(data.notifications ?? []);
      setApprovalRequests(data.approval_requests ?? []);
      setNextCursor(data.next_cursor ?? null);
      setStatus("ok");
    } catch (e: any) {
      setStatus("error");
      setError(e.message);
    } finally {
      inFlight.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || inFlight.current) return;
    inFlight.current = true;

    try {
      const data = await fetchParentNotifications(nextCursor);
      setNotifications((p: NotificationEvent[]) => [
  ...p,
  ...(data.notifications ?? []),]);

      setNextCursor(data.next_cursor ?? null);
    } finally {
      inFlight.current = false;
    }
  }, [nextCursor]);

  useEffect(() => {
    refresh();
    timer.current = window.setInterval(refresh, pollMs);

    const onVis = () => !document.hidden && refresh();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pollMs, refresh]);

  return {
    notifications,
    approvalRequests,
    nextCursor,
    status,
    error,
    refresh,
    loadMore,
  };
}

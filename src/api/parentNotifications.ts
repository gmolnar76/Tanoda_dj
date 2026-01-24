export type NotificationEvent = {
  id: number;
  timestamp: string;
  kind: string;
  title?: string;
  message?: string;
};

export type ApprovalRequest = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at?: string;
};

export type ParentNotificationsResponse = {
  notifications: NotificationEvent[];
  approval_requests: ApprovalRequest[];
  next_cursor?: string | null;
  has_next?: boolean;
};

const API_BASE = "";

async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(API_BASE + url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

export function fetchParentNotifications(cursor?: string) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiFetch<ParentNotificationsResponse>(
    `/api/parent/notifications/${qs}`
  );
}

export function approveRequest(id: number) {
  return apiFetch(`/api/parent/approval/${id}/approve`, { method: "POST" });
}

export function rejectRequest(id: number) {
  return apiFetch(`/api/parent/approval/${id}/reject`, { method: "POST" });
}

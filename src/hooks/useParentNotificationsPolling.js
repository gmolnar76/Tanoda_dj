/**
 * Parent Notifications Polling Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotifications } from '../api/parentNotifications';

const POLLING_INTERVAL = 30000; // 30 seconds

export function useParentNotificationsPolling() {
  const [notifications, setNotifications] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  const loadNotifications = useCallback(async (cursor = null) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await fetchNotifications(cursor);
      if (cursor) {
        // Append to existing
        setNotifications(prev => [...prev, ...(data.notifications || [])]);
        setApprovalRequests(prev => [...prev, ...(data.approval_requests || [])]);
      } else {
        // Replace
        setNotifications(data.notifications || []);
        setApprovalRequests(data.approval_requests || []);
      }
      setNextCursor(data.next_cursor || null);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  const refresh = useCallback(() => {
    return loadNotifications(null);
  }, [loadNotifications]);

  const loadMore = useCallback(() => {
    if (nextCursor) {
      return loadNotifications(nextCursor);
    }
    return Promise.resolve();
  }, [loadNotifications, nextCursor]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Polling
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      loadNotifications();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadNotifications]);

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

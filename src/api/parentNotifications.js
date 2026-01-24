/**
 * Parent Notifications API
 */

const API_BASE = '/api/parent';

export async function approveRequest(id) {
  const response = await fetch(`${API_BASE}/approval/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to approve request');
  }
  return response.json();
}

export async function rejectRequest(id) {
  const response = await fetch(`${API_BASE}/approval/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to reject request');
  }
  return response.json();
}

export async function fetchNotifications(cursor = null) {
  const url = cursor
    ? `${API_BASE}/notifications/?cursor=${cursor}`
    : `${API_BASE}/notifications/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

function getCsrfToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return '';
}

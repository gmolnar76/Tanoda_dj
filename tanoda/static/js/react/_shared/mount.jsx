
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './ErrorBoundary';

export function mountReactModule({ moduleId, component: Component }) {
  const mountId = `react-${moduleId}-root`;

  function attemptMount() {
    const el =
      document.getElementById(mountId) ||
      document.querySelector(`[data-react-mount="${moduleId}"]`);

    if (!el) {
      console.warn(`[React:${moduleId}] Mount point not found (#${mountId})`);
      return false;
    }

    console.log(`[React:${moduleId}] Mounting to`, el);
    createRoot(el).render(
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    );
    return true;
  }

  if (document.readyState === 'complete') {
    attemptMount();
  } else {
    document.addEventListener('DOMContentLoaded', attemptMount);
  }

  window.addEventListener(`tanoda:mount-${moduleId}`, attemptMount);
}

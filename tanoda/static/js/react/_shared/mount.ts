import React from 'react';
import { createRoot } from 'react-dom/client';

interface MountConfig {
  moduleId: string;
  component: React.ComponentType;
}

export function mountReactModule({ moduleId, component: Component }: MountConfig) {
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
    createRoot(el).render(<Component />);
    return true;
  }

  if (document.readyState === 'complete') {
    attemptMount();
  } else {
    document.addEventListener('DOMContentLoaded', attemptMount);
  }

  window.addEventListener(`tanoda:mount-${moduleId}`, attemptMount);
}

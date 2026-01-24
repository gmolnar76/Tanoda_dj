/**
 * vNext Learning App
 * ==================
 *
 * Main application component.
 * MASTER_SPEC v1.0 compliant implementation.
 * IMPLEMENTATION MAP v1.1: Module switching via custom events.
 */

import React, { useEffect } from 'react';
import { LearningLayout } from './components';
import { useLearningStore } from './store';
import type { LearningModule } from './types';
//import './styles.css';

// TEMPORARY: Test visible rendering
const TestDiv = () => (
  <div style={{ background: '#ff0055', color: '#fff', padding: '2rem', fontSize: '2rem', textAlign: 'center' }}>
    React Render Test – If you see this, React is working!
  </div>
);

// ============================================================================
// LEARNING SESSION PROVIDER (Context wrapper if needed)
// ============================================================================

interface LearningSessionProviderProps {
  children: React.ReactNode;
}

const LearningSessionProvider: React.FC<LearningSessionProviderProps> = ({
  children,
}) => {
  // The store is already global via Zustand
  // This provider is for future context needs (e.g., theme, i18n)
  return <>{children}</>;
};

// ============================================================================
// MAIN APP
// ============================================================================

const App: React.FC = () => {
  const changeModule = useLearningStore((state) => state.changeModule);

  // IMPLEMENTATION MAP v1.1: Listen for module change events from Django menu
  useEffect(() => {
    const handleModuleChange = (event: CustomEvent<{ module: string }>) => {
      const module = event.detail.module as LearningModule;

      // Validate module type
      if (['multiplication', 'division', 'fractions'].includes(module)) {
        console.log(`[ModuleSwitch] Switching to module: ${module}`);
        changeModule(module);
      } else {
        console.warn(`[ModuleSwitch] Unknown module: ${module}`);
      }
    };

    // Listen for custom event dispatched by Django template script
    window.addEventListener('tanoda-module-change', handleModuleChange as EventListener);

    return () => {
      window.removeEventListener('tanoda-module-change', handleModuleChange as EventListener);
    };
  }, [changeModule]);

  return (
    <LearningSessionProvider>
      <div className="learning-app">
        <TestDiv />
        <LearningLayout />
      </div>
    </LearningSessionProvider>
  );
};



export default App;

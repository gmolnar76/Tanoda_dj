/**
 * LearningModulePanel Component
 * ==============================
 *
 * IMPLEMENTATION MAP v1.1 requirement:
 * Dynamic module switcher - renders different panels based on activeModule.
 *
 * This component replaces direct use of MultiplicationWidget in the layout,
 * enabling SPA-style module switching without page reloads.
 */

import React from 'react';
import { useLearningStore } from '../store';
import type { LearningModule } from '../types';

// Import module-specific panels
import MultiplicationWidget from './MultiplicationWidget';

// ============================================================================
// MODULE PANEL MAPPING
// ============================================================================

interface ModulePanelProps {
  // Common props that all module panels receive
}

/**
 * Placeholder panels for modules not yet implemented.
 * These will be replaced with actual implementations later.
 */
const DivisionPanel: React.FC<ModulePanelProps> = () => (
  <div className="module-panel division-panel">
    <div className="module-placeholder">
      <h2>Osztás modul</h2>
      <p>Ez a modul még fejlesztés alatt áll.</p>
      <p className="coming-soon">Hamarosan elérhető!</p>
    </div>
  </div>
);

const FractionsPanel: React.FC<ModulePanelProps> = () => (
  <div className="module-panel fractions-panel">
    <div className="module-placeholder">
      <h2>Törtek modul</h2>
      <p>Ez a modul még fejlesztés alatt áll.</p>
      <p className="coming-soon">Hamarosan elérhető!</p>
    </div>
  </div>
);

/**
 * Map of module identifiers to their corresponding panel components.
 *
 * MASTER_SPEC v1.1: When adding new modules, register them here.
 */
const MODULE_PANELS: Record<LearningModule, React.FC<ModulePanelProps>> = {
  multiplication: MultiplicationWidget,
  division: DivisionPanel,
  fractions: FractionsPanel,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * LearningModulePanel
 *
 * Dynamically renders the appropriate learning panel based on the
 * currently active module from the store.
 *
 * IMPLEMENTATION MAP v1.1:
 * - Reads `activeModule` from store
 * - Switches between MultiplicationPanel, DivisionPanel, FractionsPanel
 * - NO page reload on module change
 */
const LearningModulePanel: React.FC = () => {
  const activeModule = useLearningStore((state) => state.activeModule);

  // Get the panel component for the active module
  const PanelComponent = MODULE_PANELS[activeModule];

  if (!PanelComponent) {
    // Fallback for unknown modules
    return (
      <div className="module-panel error-panel">
        <div className="error-content">
          <h2>Ismeretlen modul</h2>
          <p>A(z) "{activeModule}" modul nem található.</p>
        </div>
      </div>
    );
  }

  // Render the active panel
  return (
    <div className="learning-module-panel" data-module={activeModule}>
      <PanelComponent />
    </div>
  );
};

export default LearningModulePanel;
export { DivisionPanel, FractionsPanel };

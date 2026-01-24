/**
 * LevelControlPanel Component
 * ===========================
 *
 * Controls for level selection, reset, and module switching.
 */

import React, { useState } from 'react';
import { useLearningStore } from '../store';
import type { LearningModule } from '../types';

// ============================================================================
// LEVEL SELECTOR
// ============================================================================

interface LevelSelectorProps {
  currentLevel: number;
  maxLevel?: number;
  completedLevels: number[];
  onLevelChange: (level: number) => void;
  disabled?: boolean;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  maxLevel = 10,
  completedLevels,
  onLevelChange,
  disabled = false,
}) => {
  return (
    <div className="level-selector">
      <label className="selector-label">Szint kiválasztása:</label>
      <div className="level-buttons">
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
          const isCompleted = completedLevels.includes(level);
          const isActive = level === currentLevel;

          return (
            <button
              key={level}
              className={`level-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onLevelChange(level)}
              disabled={disabled}
              title={`${level}. szint${isCompleted ? ' (Teljesítve)' : ''}`}
            >
              {level}
              {isCompleted && <span className="check-mark">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MODULE SELECTOR
// ============================================================================

interface ModuleSelectorProps {
  currentModule: LearningModule;
  onModuleChange: (module: LearningModule) => void;
  disabled?: boolean;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  currentModule,
  onModuleChange,
  disabled = false,
}) => {
  const modules: Array<{ value: LearningModule; label: string; icon: string }> = [
    { value: 'multiplication', label: 'Szorzás', icon: '×' },
    { value: 'division', label: 'Osztás', icon: '÷' },
    { value: 'fractions', label: 'Törtek', icon: '½' },
  ];

  return (
    <div className="module-selector">
      <label className="selector-label">Modul:</label>
      <div className="module-buttons">
        {modules.map((module) => (
          <button
            key={module.value}
            className={`module-btn ${currentModule === module.value ? 'active' : ''}`}
            onClick={() => onModuleChange(module.value)}
            disabled={disabled || module.value !== 'multiplication'} // Only multiplication for now
            title={module.label}
          >
            <span className="module-icon">{module.icon}</span>
            <span className="module-label">{module.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// RESET CONTROLS
// ============================================================================

interface ResetControlsProps {
  currentLevel: number;
  onResetLevel: (level?: number) => void;
  disabled?: boolean;
}

const ResetControls: React.FC<ResetControlsProps> = ({
  currentLevel,
  onResetLevel,
  disabled = false,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetType, setResetType] = useState<'level' | 'full'>('level');

  const handleResetClick = (type: 'level' | 'full') => {
    setResetType(type);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (resetType === 'level') {
      onResetLevel(currentLevel);
    } else {
      // Full reset would reset all levels
      for (let i = 1; i <= 10; i++) {
        onResetLevel(i);
      }
    }
    setShowConfirm(false);
  };

  return (
    <div className="reset-controls">
      <label className="selector-label">Újrakezdés:</label>

      {!showConfirm ? (
        <div className="reset-buttons">
          <button
            className="reset-btn level"
            onClick={() => handleResetClick('level')}
            disabled={disabled}
            title={`${currentLevel}. szint újrakezdése`}
          >
            🔄 Szint újrakezdése
          </button>
          <button
            className="reset-btn full"
            onClick={() => handleResetClick('full')}
            disabled={disabled}
            title="Minden szint újrakezdése"
          >
            🔄 Minden újrakezdése
          </button>
        </div>
      ) : (
        <div className="reset-confirm">
          <p className="confirm-message">
            {resetType === 'level'
              ? `Biztosan újra akarod kezdeni a ${currentLevel}. szintet?`
              : 'Biztosan újra akarod kezdeni az összes szintet?'}
          </p>
          <p className="confirm-note">
            Az előzmények megmaradnak (új epoch).
          </p>
          <div className="confirm-buttons">
            <button className="confirm-yes" onClick={handleConfirm}>
              Igen
            </button>
            <button
              className="confirm-no"
              onClick={() => setShowConfirm(false)}
            >
              Mégsem
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// LEVEL INFO DISPLAY
// ============================================================================

interface LevelInfoDisplayProps {
  level: number;
  description: string;
  minOperand?: number;
  maxOperand?: number;
  includesNegative?: boolean;
}

const LevelInfoDisplay: React.FC<LevelInfoDisplayProps> = ({
  level,
  description,
  minOperand,
  maxOperand,
  includesNegative,
}) => {
  return (
    <div className="level-info-display">
      <h4>
        {level}. szint - {description}
      </h4>
      <div className="level-details">
        {minOperand !== undefined && maxOperand !== undefined && (
          <span className="detail-item">
            Számtartomány: {minOperand} - {maxOperand}
          </span>
        )}
        {includesNegative && (
          <span className="detail-item negative">Negatív számok: Igen</span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PANEL
// ============================================================================

const LevelControlPanel: React.FC = () => {
  const {
    currentLevel,
    activeModule,
    mastery,
    levelInfo,
    ui,
    changeLevel,
    changeModule,
    resetLevel,
  } = useLearningStore();

  return (
    <div className="level-control-panel">
      <h3 className="panel-title">Beállítások</h3>

      {levelInfo && (
        <LevelInfoDisplay
          level={levelInfo.level}
          description={levelInfo.description}
          minOperand={levelInfo.min_operand}
          maxOperand={levelInfo.max_operand}
          includesNegative={levelInfo.includes_negative}
        />
      )}

      <LevelSelector
        currentLevel={currentLevel}
        completedLevels={mastery.completed_levels}
        onLevelChange={changeLevel}
        disabled={ui.isLoading}
      />

      <ModuleSelector
        currentModule={activeModule}
        onModuleChange={changeModule}
        disabled={ui.isLoading}
      />

      <ResetControls
        currentLevel={currentLevel}
        onResetLevel={resetLevel}
        disabled={ui.isLoading}
      />
    </div>
  );
};

export default LevelControlPanel;
export { LevelSelector, ModuleSelector, ResetControls, LevelInfoDisplay };

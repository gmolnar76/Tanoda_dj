/**
 * TopBar Component
 * ================
 *
 * Contains mode switcher and mastery stars display.
 */

import React from 'react';
import { useLearningStore } from '../store';
import type { LearningMode } from '../types';

// ============================================================================
// MODE SWITCHER
// ============================================================================

interface ModeSwitcherProps {
  currentMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
  disabled?: boolean;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  const modes: Array<{ value: LearningMode; label: string; icon: string }> = [
    { value: 'practice', label: 'Gyakorlás', icon: '📝' },
    { value: 'score', label: 'Pontozás', icon: '🎯' },
    { value: 'challenge', label: 'Kihívás', icon: '🏆' },
  ];

  return (
    <div className="mode-switcher">
      {modes.map((mode) => (
        <button
          key={mode.value}
          className={`mode-btn ${currentMode === mode.value ? 'active' : ''}`}
          onClick={() => onModeChange(mode.value)}
          disabled={disabled}
          title={mode.label}
        >
          <span className="mode-icon">{mode.icon}</span>
          <span className="mode-label">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// MASTERY STARS
// ============================================================================

interface MasteryStarsProps {
  stars: number;
  maxStars?: number;
}

const MasteryStars: React.FC<MasteryStarsProps> = ({ stars, maxStars = 5 }) => {
  return (
    <div className="mastery-stars" title={`${stars} / ${maxStars} csillag`}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          className={`star ${i < stars ? 'filled' : 'empty'}`}
        >
          {i < stars ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

// ============================================================================
// LEVEL BADGE
// ============================================================================

interface LevelBadgeProps {
  level: number;
  isCompleted: boolean;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, isCompleted }) => {
  return (
    <div className={`level-badge ${isCompleted ? 'completed' : ''}`}>
      <span className="level-number">{level}</span>
      <span className="level-label">. szint</span>
      {isCompleted && <span className="completed-check">✓</span>}
    </div>
  );
};

// ============================================================================
// TOP BAR
// ============================================================================

const TopBar: React.FC = () => {
  const {
    mode,
    changeMode,
    mastery,
    currentLevel,
    levelProgress,
    activeModule,
    ui,
  } = useLearningStore();

  const moduleLabels: Record<string, string> = {
    multiplication: 'Szorzás',
    division: 'Osztás',
    fractions: 'Törtek',
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="module-indicator">
          <span className="module-icon">📐</span>
          <span className="module-name">{moduleLabels[activeModule]}</span>
        </div>
        <LevelBadge
          level={currentLevel}
          isCompleted={levelProgress.is_completed}
        />
      </div>

      <div className="top-bar-center">
        <ModeSwitcher
          currentMode={mode}
          onModeChange={changeMode}
          disabled={ui.isLoading}
        />
      </div>

      <div className="top-bar-right">
        <MasteryStars stars={mastery.stars} />
        <div className="accuracy-display">
          <span className="accuracy-value">
            {mastery.overall_accuracy.toFixed(1)}%
          </span>
          <span className="accuracy-label">pontosság</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
export { ModeSwitcher, MasteryStars, LevelBadge };

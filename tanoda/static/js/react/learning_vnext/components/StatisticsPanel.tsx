/**
 * StatisticsPanel Component
 * =========================
 *
 * Displays user statistics and progress overview.
 */

import React from 'react';
import { useLearningStore } from '../store';
import type { LevelState } from '../types';

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subValue,
  variant = 'default',
}) => {
  return (
    <div className={`stat-card ${variant}`}>
      <span className="stat-icon">{icon}</span>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {subValue && <span className="stat-sub">{subValue}</span>}
      </div>
    </div>
  );
};

// ============================================================================
// LEVEL PROGRESS ITEM
// ============================================================================

interface LevelProgressItemProps {
  level: LevelState;
  isActive: boolean;
  onClick: () => void;
}

const LevelProgressItem: React.FC<LevelProgressItemProps> = ({
  level,
  isActive,
  onClick,
}) => {
  const getStateClass = () => {
    if (level.is_completed) return 'completed';
    if (level.total_attempts === 0) return 'not-started';
    if (level.accuracy_rate >= 80) return 'mastering';
    if (level.accuracy_rate >= 50) return 'practicing';
    return 'struggling';
  };

  return (
    <button
      className={`level-progress-item ${getStateClass()} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={`Szint ${level.level}: ${level.accuracy_rate.toFixed(0)}%`}
    >
      <span className="level-num">{level.level}</span>
      <div className="level-bar">
        <div
          className="level-fill"
          style={{ width: `${Math.min(level.accuracy_rate, 100)}%` }}
        />
      </div>
      {level.is_completed && <span className="level-check">✓</span>}
    </button>
  );
};

// ============================================================================
// ACCURACY RING
// ============================================================================

interface AccuracyRingProps {
  accuracy: number;
  size?: number;
}

const AccuracyRing: React.FC<AccuracyRingProps> = ({
  accuracy,
  size = 120,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (accuracy / 100) * circumference;

  const getColor = () => {
    if (accuracy >= 80) return '#22c55e';
    if (accuracy >= 60) return '#eab308';
    if (accuracy >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="accuracy-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-content">
        <span className="ring-value">{accuracy.toFixed(0)}%</span>
        <span className="ring-label">pontosság</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PANEL
// ============================================================================

const StatisticsPanel: React.FC = () => {
  const {
    statistics,
    mastery,
    levelProgress,
    levels,
    currentLevel,
    changeLevel,
  } = useLearningStore();

  const totalAttempts = statistics?.total_attempts || levelProgress.total_attempts;
  const totalCorrect = statistics?.total_correct || levelProgress.correct_attempts;
  const overallAccuracy = statistics?.overall_accuracy || mastery.overall_accuracy;

  return (
    <div className="statistics-panel">
      <h3 className="panel-title">Statisztikák</h3>

      <div className="stats-overview">
        <AccuracyRing accuracy={overallAccuracy} />

        <div className="stats-cards">
          <StatCard
            icon="🎯"
            label="Összes próbálkozás"
            value={totalAttempts}
            variant="info"
          />
          <StatCard
            icon="✓"
            label="Helyes válaszok"
            value={totalCorrect}
            variant="success"
          />
          <StatCard
            icon="🔥"
            label="Aktuális sorozat"
            value={levelProgress.current_streak}
            subValue={`Legjobb: ${levelProgress.best_streak}`}
            variant={levelProgress.current_streak >= 5 ? 'success' : 'default'}
          />
          <StatCard
            icon="⭐"
            label="Csillagok"
            value={`${mastery.stars} / 5`}
            variant={mastery.stars >= 3 ? 'success' : 'default'}
          />
        </div>
      </div>

      <div className="levels-overview">
        <h4>Szintek előrehaladása</h4>
        <div className="levels-grid">
          {(levels.length > 0 ? levels : Array.from({ length: 10 }, (_, i) => ({
            level: i + 1,
            epoch: 1,
            total_attempts: 0,
            correct_attempts: 0,
            accuracy_rate: 0,
            is_completed: false,
            current_streak: 0,
            best_streak: 0,
          }))).map((level) => (
            <LevelProgressItem
              key={level.level}
              level={level}
              isActive={level.level === currentLevel}
              onClick={() => changeLevel(level.level)}
            />
          ))}
        </div>
      </div>

      {mastery.completed_levels.length > 0 && (
        <div className="completed-levels">
          <h4>Teljesített szintek</h4>
          <div className="completed-badges">
            {mastery.completed_levels.map((level) => (
              <span key={level} className="completed-badge">
                {level}. szint ✓
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
export { StatCard, LevelProgressItem, AccuracyRing };

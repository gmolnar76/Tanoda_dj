/**
 * LearningLayout Component
 * ========================
 *
 * Main layout container for the learning system.
 * MASTER_SPEC: Follows the canonical component tree structure.
 */

import React, { useEffect } from 'react';
import { useLearningStore } from '../store';

// Components
import TopBar from './TopBar';
import LearningModulePanel from './LearningModulePanel';
import StatisticsPanel from './StatisticsPanel';
import ProgressChart from './ProgressChart';
import PythagorasGrid from './PythagorasGrid';
import LevelControlPanel from './LevelControlPanel';
import NotificationPanel from './NotificationPanel';

// ============================================================================
// LOADING SCREEN
// ============================================================================

const LoadingScreen: React.FC = () => (
  <div className="loading-screen">
    <div className="loading-spinner large" />
    <h2>Tanulási modul betöltése...</h2>
    <p>Kérlek várj, amíg betöltjük az adatokat.</p>
  </div>
);

// ============================================================================
// ERROR SCREEN
// ============================================================================

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => (
  <div className="error-screen">
    <div className="error-icon">⚠️</div>
    <h2>Hiba történt</h2>
    <p className="error-message">{error}</p>
    <button className="retry-btn" onClick={onRetry}>
      Újrapróbálkozás
    </button>
  </div>
);

// ============================================================================
// SESSION START SCREEN
// ============================================================================

interface SessionStartScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

const SessionStartScreen: React.FC<SessionStartScreenProps> = ({
  onStart,
  isLoading,
}) => (
  <div className="session-start-screen">
    <div className="start-content">
      <h1>Szorzás Gyakorló</h1>
      <h2>vNext Learning System</h2>
      <p>Üdvözöllek a szorzás tanulási modulban!</p>
      <p>
        Ez a rendszer segít neked elsajátítani a szorzótáblát szintről szintre
        haladva.
      </p>

      <div className="features-list">
        <div className="feature">
          <span className="feature-icon">📊</span>
          <span>10 nehézségi szint</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🎯</span>
          <span>Adaptív feladatok</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📈</span>
          <span>Részletes statisztikák</span>
        </div>
        <div className="feature">
          <span className="feature-icon">⭐</span>
          <span>Csillagok és jutalmak</span>
        </div>
      </div>

      <button
        className="start-btn"
        onClick={onStart}
        disabled={isLoading}
      >
        {isLoading ? 'Betöltés...' : 'Kezdjük!'}
      </button>
    </div>
  </div>
);

// ...existing code...
// ...existing code...

// ============================================================================
// MAIN LAYOUT
// ============================================================================

const LearningLayout: React.FC = () => {
  const {
    sessionId,
    isActive,
    ui,
    startSession,
    resumeSession,
    clearError,
    fetchStatistics,
  } = useLearningStore();

  // Try to resume session on mount
  useEffect(() => {
    resumeSession();
    fetchStatistics();
  }, [resumeSession, fetchStatistics]);

  // Handle session start
  const handleStart = () => {
    startSession('multiplication', 'practice', 1);
  };

  // Show error screen
  if (ui.error && !isActive) {
    return (
      <ErrorScreen
        error={ui.error}
        onRetry={() => {
          clearError();
          resumeSession();
        }}
      />
    );
  }

  // Show loading screen
  if (ui.isLoading && !sessionId) {
    return <LoadingScreen />;
  }

  // Show start screen if no active session
  if (!isActive && !sessionId) {
    return (
      <SessionStartScreen
        onStart={handleStart}
        isLoading={ui.isLoading}
      />
    );
  }

  // Main learning interface
  return (
    <div className="learning-layout">
      <TopBar />

      <div className="learning-content">
        <div className="main-grid">
          <div className="grid-widget">
            <LearningModulePanel />
          </div>
          <div className="grid-statistics">
            <StatisticsPanel />
          </div>
          <div className="grid-progress">
            <ProgressChart />
          </div>
          <div className="grid-pythagoras">
            <PythagorasGrid />
          </div>
        </div>
        <aside className="learning-sidebar">
          <LevelControlPanel />
        </aside>
      </div>

      <NotificationPanel />

      {ui.isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
};

export default LearningLayout;
export { LoadingScreen, ErrorScreen, SessionStartScreen };

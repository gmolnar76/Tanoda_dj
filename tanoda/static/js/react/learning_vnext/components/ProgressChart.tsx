/**
 * ProgressChart Component
 * =======================
 *
 * Displays progress charts using Recharts.
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useLearningStore } from '../store';

// ============================================================================
// ACCURACY BY LEVEL CHART
// ============================================================================

const AccuracyByLevelChart: React.FC = () => {
  const { levels } = useLearningStore();

  const data = useMemo(() => {
    return (levels.length > 0
      ? levels
      : Array.from({ length: 10 }, (_, i) => ({
          level: i + 1,
          accuracy_rate: 0,
          total_attempts: 0,
          is_completed: false,
        }))
    ).map((level) => ({
      name: `L${level.level}`,
      accuracy: Math.round(level.accuracy_rate),
      attempts: level.total_attempts,
      completed: level.is_completed,
    }));
  }, [levels]);

  const getBarColor = (accuracy: number, completed: boolean) => {
    if (completed) return '#22c55e';
    if (accuracy >= 80) return '#84cc16';
    if (accuracy >= 60) return '#eab308';
    if (accuracy >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="chart-container accuracy-by-level">
      <h4>Pontosság szintenként</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'accuracy') return [`${value}%`, 'Pontosság'];
              return [value, name];
            }}
          />
          <Bar dataKey="accuracy" name="accuracy">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.accuracy, entry.completed)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================================
// ATTEMPTS BY LEVEL CHART
// ============================================================================

const AttemptsByLevelChart: React.FC = () => {
  const { levels } = useLearningStore();

  const data = useMemo(() => {
    return (levels.length > 0
      ? levels
      : Array.from({ length: 10 }, (_, i) => ({
          level: i + 1,
          total_attempts: 0,
          correct_attempts: 0,
        }))
    ).map((level) => ({
      name: `L${level.level}`,
      total: level.total_attempts,
      correct: level.correct_attempts,
      incorrect: level.total_attempts - level.correct_attempts,
    }));
  }, [levels]);

  return (
    <div className="chart-container attempts-by-level">
      <h4>Próbálkozások szintenként</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="correct" stackId="a" fill="#22c55e" name="Helyes" />
          <Bar dataKey="incorrect" stackId="a" fill="#ef4444" name="Hibás" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================================
// STREAK HISTORY CHART
// ============================================================================

interface StreakHistoryChartProps {
  currentStreak: number;
  bestStreak: number;
}

const StreakHistoryChart: React.FC<StreakHistoryChartProps> = ({
  currentStreak,
  bestStreak,
}) => {
  // Generate mock history data for visualization
  const data = useMemo(() => {
    const milestones = [5, 10, 25, 50, 100];
    return milestones.map((milestone) => ({
      milestone: `${milestone}`,
      achieved: currentStreak >= milestone || bestStreak >= milestone,
      current: currentStreak >= milestone,
    }));
  }, [currentStreak, bestStreak]);

  return (
    <div className="chart-container streak-history">
      <h4>Sorozat mérföldkövek</h4>
      <div className="streak-milestones">
        {data.map((item) => (
          <div
            key={item.milestone}
            className={`milestone ${item.achieved ? 'achieved' : ''} ${item.current ? 'current' : ''}`}
          >
            <span className="milestone-icon">
              {item.current ? '🔥' : item.achieved ? '✓' : '○'}
            </span>
            <span className="milestone-value">{item.milestone}</span>
          </div>
        ))}
      </div>
      <div className="streak-current">
        <span className="streak-label">Aktuális:</span>
        <span className="streak-value">{currentStreak}</span>
        <span className="streak-separator">|</span>
        <span className="streak-label">Legjobb:</span>
        <span className="streak-value best">{bestStreak}</span>
      </div>
    </div>
  );
};

// ============================================================================
// MASTERY PROGRESS CHART
// ============================================================================

const MasteryProgressChart: React.FC = () => {
  const { mastery } = useLearningStore();

  const starProgress = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      star: i + 1,
      earned: i < mastery.stars,
    }));
  }, [mastery.stars]);

  return (
    <div className="chart-container mastery-progress">
      <h4>Mester szint</h4>
      <div className="mastery-stars-display">
        {starProgress.map((star) => (
          <div
            key={star.star}
            className={`mastery-star ${star.earned ? 'earned' : ''}`}
          >
            {star.earned ? '★' : '☆'}
          </div>
        ))}
      </div>
      <div className="mastery-info">
        <span>Teljesített szintek: {mastery.completed_levels.length} / 10</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PANEL
// ============================================================================

const ProgressChart: React.FC = () => {
  const { levelProgress } = useLearningStore();

  return (
    <div className="progress-chart-panel">
      <h3 className="panel-title">Haladás</h3>

      <AccuracyByLevelChart />
      <AttemptsByLevelChart />
      <StreakHistoryChart
        currentStreak={levelProgress.current_streak}
        bestStreak={levelProgress.best_streak}
      />
      <MasteryProgressChart />
    </div>
  );
};

export default ProgressChart;
export {
  AccuracyByLevelChart,
  AttemptsByLevelChart,
  StreakHistoryChart,
  MasteryProgressChart,
};

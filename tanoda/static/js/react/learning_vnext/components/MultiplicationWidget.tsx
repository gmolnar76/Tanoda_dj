/**
 * MultiplicationWidget Component
 * ==============================
 *
 * The main learning widget for multiplication tasks.
 * Displays current problem and accepts answers.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useLearningStore } from '../store';

// ============================================================================
// TASK DISPLAY
// ============================================================================

interface TaskDisplayProps {
  operand1: number;
  operand2: number;
  operation: 'multiply' | 'divide';
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({
  operand1,
  operand2,
  operation,
}) => {
  const operatorSymbol = operation === 'multiply' ? '×' : '÷';

  return (
    <div className="task-display">
      <span className="operand operand-1">{operand1}</span>
      <span className="operator">{operatorSymbol}</span>
      <span className="operand operand-2">{operand2}</span>
      <span className="equals">=</span>
      <span className="answer-placeholder">?</span>
    </div>
  );
};

// ============================================================================
// ANSWER INPUT
// ============================================================================

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isCorrect = null,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim() !== '') {
      onSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and minus sign
    const newValue = e.target.value.replace(/[^0-9-]/g, '');
    onChange(newValue);
  };

  let inputClass = 'answer-input';
  if (isCorrect === true) inputClass += ' correct';
  if (isCorrect === false) inputClass += ' incorrect';

  return (
    <div className="answer-input-container">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        className={inputClass}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="?"
        autoComplete="off"
      />
      <button
        className="submit-btn"
        onClick={onSubmit}
        disabled={disabled || value.trim() === ''}
      >
        Ellenőrzés
      </button>
    </div>
  );
};

// ============================================================================
// FEEDBACK DISPLAY
// ============================================================================

interface FeedbackDisplayProps {
  isCorrect: boolean | null;
  correctAnswer?: number;
  hint?: string | null;
  showHint: boolean;
  onToggleHint: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  isCorrect,
  correctAnswer,
  hint,
  showHint,
  onToggleHint,
}) => {
  if (isCorrect === null) {
    return hint ? (
      <div className="feedback-container">
        <button className="hint-toggle" onClick={onToggleHint}>
          {showHint ? 'Segítség elrejtése' : 'Segítség kérése'}
        </button>
        {showHint && <div className="hint-text">{hint}</div>}
      </div>
    ) : null;
  }

  return (
    <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
      {isCorrect ? (
        <span className="feedback-message">Helyes! ✓</span>
      ) : (
        <>
          <span className="feedback-message">Hibás!</span>
          {correctAnswer !== undefined && (
            <span className="correct-answer">
              A helyes válasz: {correctAnswer}
            </span>
          )}
          {hint && (
            <div className="hint-after-error">
              <strong>Tipp:</strong> {hint}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// STREAK DISPLAY
// ============================================================================

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  bestStreak,
}) => {
  return (
    <div className="streak-display">
      <div className="streak current">
        <span className="streak-icon">🔥</span>
        <span className="streak-value">{currentStreak}</span>
        <span className="streak-label">sorozat</span>
      </div>
      <div className="streak best">
        <span className="streak-icon">🏅</span>
        <span className="streak-value">{bestStreak}</span>
        <span className="streak-label">legjobb</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN WIDGET
// ============================================================================

const MultiplicationWidget: React.FC = () => {
  const {
    currentTask,
    attempt,
    levelProgress,
    ui,
    submitAnswer,
    setInputValue,
    toggleHint,
  } = useLearningStore();

  const startTimeRef = useRef<number>(Date.now());

  // Reset timer when task changes
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [currentTask?.operand1, currentTask?.operand2]);

  const handleSubmit = useCallback(() => {
    const answer = parseInt(ui.inputValue, 10);
    if (isNaN(answer)) return;

    const responseTime = Date.now() - startTimeRef.current;
    submitAnswer(answer, responseTime);
  }, [ui.inputValue, submitAnswer]);

  if (!currentTask) {
    return (
      <div className="multiplication-widget loading">
        <div className="loading-spinner" />
        <p>Feladat betöltése...</p>
      </div>
    );
  }

  return (
    <div className="multiplication-widget">
      <div className="widget-header">
        <h2>Szorzás gyakorlás</h2>
        <StreakDisplay
          currentStreak={levelProgress.current_streak}
          bestStreak={levelProgress.best_streak}
        />
      </div>

      <div className="widget-body">
        <TaskDisplay
          operand1={currentTask.operand1}
          operand2={currentTask.operand2}
          operation={currentTask.operation}
        />

        <AnswerInput
          value={ui.inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={attempt.isSubmitting}
          isCorrect={ui.animatingCorrect ? true : ui.animatingIncorrect ? false : null}
        />

        <FeedbackDisplay
          isCorrect={
            ui.animatingCorrect ? true : ui.animatingIncorrect ? false : null
          }
          hint={currentTask.hint}
          showHint={ui.showHint}
          onToggleHint={toggleHint}
        />
      </div>

      <div className="widget-footer">
        <div className="progress-info">
          <span className="attempts">
            {levelProgress.correct_attempts} / {levelProgress.total_attempts} helyes
          </span>
          <span className="accuracy">
            ({levelProgress.accuracy_rate.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default MultiplicationWidget;
export { TaskDisplay, AnswerInput, FeedbackDisplay, StreakDisplay };

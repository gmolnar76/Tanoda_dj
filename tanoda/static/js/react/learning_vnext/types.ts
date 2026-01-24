/**
 * vNext Learning System Types
 * ===========================
 *
 * MASTER_SPEC v1.0 compliant TypeScript type definitions.
 */

// ============================================================================
// ENUMS
// ============================================================================

export type LearningModule = 'multiplication' | 'division' | 'fractions';
export type LearningMode = 'practice' | 'score' | 'challenge';
export type CellState = 'unseen' | 'incorrect_recent' | 'correct_once' | 'correct_stable' | 'mastered';

// ============================================================================
// TASK TYPES
// ============================================================================

export interface MultiplicationTask {
  module: LearningModule;
  level: number;
  operand1: number;
  operand2: number;
  correct_answer?: number; // Hidden from UI
  operation: 'multiply' | 'divide';
  hint?: string | null;
}

// ============================================================================
// ATTEMPT & PROGRESS TYPES
// ============================================================================

export interface AttemptState {
  isSubmitting: boolean;
  lastAnswer: number | null;
  lastCorrect: boolean | null;
  responseTimeMs: number | null;
}

export interface LevelProgress {
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: number;
  current_streak: number;
  best_streak: number;
  is_completed: boolean;
}

export interface LevelInfo {
  level: number;
  description: string;
  min_operand?: number;
  max_operand?: number;
  total_cells?: number;
  includes_negative?: boolean;
}

export interface LevelState extends LevelProgress {
  level: number;
  epoch: number;
}

// ============================================================================
// MASTERY TYPES
// ============================================================================

export interface MasteryState {
  stars: number;
  completed_levels: number[];
  overall_accuracy: number;
  badges?: string[];
}

// ============================================================================
// PYTHAGORAS GRID TYPES
// ============================================================================

export interface GridCell {
  row: number;
  col: number;
  product: number;
  state: CellState;
  attempts: number;
  correct: number;
  consecutive_correct: number;
}

export interface PythagorasState {
  module: LearningModule;
  level: number;
  epoch: number;
  max_operand: number;
  grid: GridCell[][];
  highlightedCell: { row: number; col: number } | null;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface StatisticsState {
  module: LearningModule;
  stars: number;
  completed_levels: number[];
  total_attempts: number;
  total_correct: number;
  overall_accuracy: number;
  badges: string[];
  levels: LevelState[];
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: 'level_completed' | 'level_regressed' | 'streak_milestone' | 'level_reset' | 'mode_changed' | 'error' | 'info';
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface Reward {
  type: 'level_completion' | 'streak_bonus' | 'challenge_win';
  level?: number;
  points: number;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  showHint: boolean;
  inputValue: string;
  animatingCorrect: boolean;
  animatingIncorrect: boolean;
}

// ============================================================================
// SESSION STATE (MASTER)
// ============================================================================

export interface LearningSessionState {
  // Session info
  sessionId: string | null;
  isActive: boolean;
  startedAt: string | null;

  // Current state
  mode: LearningMode;
  activeModule: LearningModule;
  currentLevel: number;
  epoch: number;

  // Current task
  currentTask: MultiplicationTask | null;

  // Attempt tracking
  attempt: AttemptState;

  // Progress
  mastery: MasteryState;
  levelProgress: LevelProgress;
  levels: LevelState[];
  levelInfo: LevelInfo | null;

  // Pythagoras grid
  pythagoras: PythagorasState | null;

  // Statistics
  statistics: StatisticsState | null;

  // UI
  ui: UIState;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SessionResponse {
  session_id: string;
  active_module: LearningModule;
  mode: LearningMode;
  current_level: number;
  current_task: MultiplicationTask | null;
  is_active: boolean;
  started_at: string;
  epoch: number;
  level_progress: LevelProgress;
  mastery: MasteryState;
  level_info: LevelInfo;
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: number;
  user_answer: number;
  next_task: MultiplicationTask;
  level: number;
  level_completed: boolean;
  level_regressed: boolean;
  streak_milestone: number | null;
  rewards: Reward[];
  notifications: Array<{
    type: string;
    message: string;
    [key: string]: unknown;
  }>;
  hint: string | null;
}

export interface PythagorasResponse {
  module: LearningModule;
  level: number;
  epoch: number;
  max_operand: number;
  grid: GridCell[][];
}

// ============================================================================
// STORE ACTIONS
// ============================================================================

export interface LearningActions {
  // Session
  startSession: (module?: LearningModule, mode?: LearningMode, level?: number) => Promise<void>;
  endSession: () => Promise<void>;
  resumeSession: () => Promise<void>;

  // Task
  submitAnswer: (answer: number, responseTimeMs?: number) => Promise<void>;
  getNextTask: () => Promise<void>;

  // Level & Mode
  changeLevel: (level: number) => Promise<void>;
  changeMode: (mode: LearningMode) => Promise<void>;
  changeModule: (module: LearningModule) => Promise<void>;
  resetLevel: (level?: number) => Promise<void>;

  // Data fetching
  fetchStatistics: (module?: LearningModule) => Promise<void>;
  fetchPythagorasGrid: (module?: LearningModule, level?: number) => Promise<void>;

  // UI
  setInputValue: (value: string) => void;
  toggleHint: () => void;
  clearNotification: (id: string) => void;
  clearError: () => void;

  // Reset
  reset: () => void;
}

export type LearningStore = LearningSessionState & LearningActions;

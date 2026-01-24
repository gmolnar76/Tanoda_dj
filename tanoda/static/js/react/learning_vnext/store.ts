/**
 * vNext Learning Store (Zustand)
 * ==============================
 *
 * MASTER_SPEC v1.0: LearningSessionState as the Single Source of Truth.
 * All UI state is derived from this store.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  LearningStore,
  LearningSessionState,
  LearningModule,
  LearningMode,
  Notification,
} from './types';
import * as api from './api';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: LearningSessionState = {
  // Session
  sessionId: null,
  isActive: false,
  startedAt: null,

  // Current state
  mode: 'practice',
  activeModule: 'multiplication',
  currentLevel: 1,
  epoch: 1,

  // Current task
  currentTask: null,

  // Attempt
  attempt: {
    isSubmitting: false,
    lastAnswer: null,
    lastCorrect: null,
    responseTimeMs: null,
  },

  // Progress
  mastery: {
    stars: 0,
    completed_levels: [],
    overall_accuracy: 0,
  },
  levelProgress: {
    total_attempts: 0,
    correct_attempts: 0,
    accuracy_rate: 0,
    current_streak: 0,
    best_streak: 0,
    is_completed: false,
  },
  levels: [],
  levelInfo: null,

  // Pythagoras
  pythagoras: null,

  // Statistics
  statistics: null,

  // UI
  ui: {
    isLoading: false,
    error: null,
    notifications: [],
    showHint: false,
    inputValue: '',
    animatingCorrect: false,
    animatingIncorrect: false,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const createNotification = (
  type: Notification['type'],
  message: string,
  data?: Record<string, unknown>
): Notification => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  message,
  data,
  timestamp: Date.now(),
});

// ============================================================================
// STORE
// ============================================================================

export const useLearningStore = create<LearningStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ==================================================================
        // SESSION ACTIONS
        // ==================================================================

        startSession: async (
          module: LearningModule = 'multiplication',
          mode: LearningMode = 'practice',
          level: number = 1
        ) => {
          set((state) => ({
            ui: { ...state.ui, isLoading: true, error: null },
          }));

          try {
            const session = await api.startSession(module, mode, level);

            set({
              sessionId: session.session_id,
              isActive: session.is_active,
              startedAt: session.started_at,
              mode: session.mode,
              activeModule: session.active_module,
              currentLevel: session.current_level,
              epoch: session.epoch,
              currentTask: session.current_task,
              levelProgress: session.level_progress,
              mastery: session.mastery,
              levelInfo: session.level_info,
              ui: { ...get().ui, isLoading: false, inputValue: '' },
            });

            // Fetch pythagoras grid
            get().fetchPythagorasGrid(module, level);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to start session';
            set((state) => ({
              ui: {
                ...state.ui,
                isLoading: false,
                error: message,
                notifications: [
                  ...state.ui.notifications,
                  createNotification('error', message),
                ],
              },
            }));
          }
        },

        endSession: async () => {
          const { sessionId } = get();
          if (!sessionId) return;

          set((state) => ({
            ui: { ...state.ui, isLoading: true },
          }));

          try {
            await api.endSession(sessionId);
            set({
              ...initialState,
              ui: { ...initialState.ui },
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to end session';
            set((state) => ({
              ui: {
                ...state.ui,
                isLoading: false,
                error: message,
              },
            }));
          }
        },

        resumeSession: async () => {
          set((state) => ({
            ui: { ...state.ui, isLoading: true, error: null },
          }));

          try {
            const session = await api.getSession();

            if (session) {
              set({
                sessionId: session.session_id,
                isActive: session.is_active,
                startedAt: session.started_at,
                mode: session.mode,
                activeModule: session.active_module,
                currentLevel: session.current_level,
                epoch: session.epoch,
                currentTask: session.current_task,
                levelProgress: session.level_progress,
                mastery: session.mastery,
                levelInfo: session.level_info,
                ui: { ...get().ui, isLoading: false, inputValue: '' },
              });

              // Fetch related data
              get().fetchPythagorasGrid(session.active_module, session.current_level);
              get().fetchStatistics(session.active_module);
            } else {
              set((state) => ({
                ui: { ...state.ui, isLoading: false },
              }));
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to resume session';
            set((state) => ({
              ui: {
                ...state.ui,
                isLoading: false,
                error: message,
              },
            }));
          }
        },

        // ==================================================================
        // TASK ACTIONS
        // ==================================================================

        submitAnswer: async (answer: number, responseTimeMs?: number) => {
          const { sessionId, currentTask } = get();
          if (!sessionId || !currentTask) return;

          set((state) => ({
            attempt: { ...state.attempt, isSubmitting: true },
            ui: { ...state.ui, error: null },
          }));

          try {
            const result = await api.submitAnswer(sessionId, answer, responseTimeMs);

            const notifications: Notification[] = [];

            // Handle notifications from backend
            result.notifications.forEach((n) => {
              notifications.push(
                createNotification(
                  n.type as Notification['type'],
                  n.message,
                  n as Record<string, unknown>
                )
              );
            });

            set((state) => ({
              currentTask: result.next_task,
              currentLevel: result.level,
              attempt: {
                isSubmitting: false,
                lastAnswer: answer,
                lastCorrect: result.is_correct,
                responseTimeMs: responseTimeMs || null,
              },
              ui: {
                ...state.ui,
                inputValue: '',
                showHint: false,
                animatingCorrect: result.is_correct,
                animatingIncorrect: !result.is_correct,
                notifications: [...state.ui.notifications, ...notifications],
              },
            }));

            // Reset animation state after delay
            setTimeout(() => {
              set((state) => ({
                ui: {
                  ...state.ui,
                  animatingCorrect: false,
                  animatingIncorrect: false,
                },
              }));
            }, 500);

            // Refresh statistics and grid if level changed
            if (result.level_completed || result.level_regressed) {
              get().fetchStatistics();
              get().fetchPythagorasGrid();
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit answer';
            set((state) => ({
              attempt: { ...state.attempt, isSubmitting: false },
              ui: {
                ...state.ui,
                error: message,
                notifications: [
                  ...state.ui.notifications,
                  createNotification('error', message),
                ],
              },
            }));
          }
        },

        getNextTask: async () => {
          const { sessionId } = get();
          if (!sessionId) return;

          set((state) => ({
            ui: { ...state.ui, isLoading: true },
          }));

          try {
            const result = await api.getNextTask(sessionId);

            set((state) => ({
              currentTask: result.task,
              currentLevel: result.level,
              epoch: result.epoch,
              ui: { ...state.ui, isLoading: false, inputValue: '' },
            }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get next task';
            set((state) => ({
              ui: {
                ...state.ui,
                isLoading: false,
                error: message,
              },
            }));
          }
        },

        // ==================================================================
        // LEVEL & MODE ACTIONS
        // ==================================================================

        changeLevel: async (level: number) => {
          const { sessionId } = get();
          if (!sessionId) return;

          set((state) => ({
            ui: { ...state.ui, isLoading: true },
          }));

          try {
            const result = await api.changeLevel(sessionId, level);

            set((state) => ({
              currentLevel: result.new_level,
              currentTask: result.task,
              levelInfo: result.level_info,
              ui: { ...state.ui, isLoading: false, inputValue: '' },
            }));

            // Refresh grid for new level
            get().fetchPythagorasGrid(get().activeModule, level);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to change level';
            set((state) => ({
              ui: {
                ...state.ui,
                isLoading: false,
                error: message,
              },
            }));
          }
        },

        changeMode: async (mode: LearningMode) => {
          const { sessionId } = get();
          if (!sessionId) return;

          try {
            await api.changeMode(sessionId, mode);

            set((state) => ({
              mode,
              ui: {
                ...state.ui,
                notifications: [
                  ...state.ui.notifications,
                  createNotification('mode_changed', `Mód: ${mode}`),
                ],
              },
            }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to change mode';
            set((state) => ({
              ui: {
                ...state.ui,
                error: message,
              },
            }));
          }
        },

        changeModule: async (module: LearningModule) => {
          const { sessionId } = get();
          if (!sessionId) return;

          set((state) => ({
            ui: { ...state.ui, isLoading: true },
          }));

          try {
            const result = await api.changeModule(sessionId, module);

            set((state) => ({
              activeModule: result.new_module,
              currentTask: result.task,
              ui: { ...state.ui, isLoading: false, inputValue: '' },
            }));

            // Refresh grid and statistics for new module
            get().fetchPythagorasGrid(module);
            get().fetchStatistics(module);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to change module';
            set((state) => ({
              ui: {
                ...state.ui,
                isLoading: false,
                error: message,
              },
            }));
          }
        },

        resetLevel: async (level?: number) => {
          const { sessionId, currentLevel } = get();
          if (!sessionId) return;

          const targetLevel = level || currentLevel;

          set((state) => ({
            ui: { ...state.ui, isLoading: true },
          }));

          try {
            const result = await api.resetLevel(sessionId, targetLevel);

            set((state) => ({
              epoch: result.new_epoch,
              currentTask: result.task,
              ui: {
                ...state.ui,
                isLoading: false,
                inputValue: '',
                notifications: [
                  ...state.ui.notifications,
                  createNotification(
                    'level_reset',
                    `${targetLevel}. szint újrakezdve (Epoch: ${result.new_epoch})`
                  ),
                ],
              },
            }));

            // Refresh grid
            get().fetchPythagorasGrid();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset level';
            set((state) => ({
              ui: {
                ...state.ui,
                isLoading: false,
                error: message,
              },
            }));
          }
        },

        // ==================================================================
        // DATA FETCHING
        // ==================================================================

        fetchStatistics: async (module?: LearningModule) => {
          const targetModule = module || get().activeModule;

          try {
            const statistics = await api.getStatistics(targetModule);

            set({
              statistics,
              mastery: {
                stars: statistics.stars,
                completed_levels: statistics.completed_levels,
                overall_accuracy: statistics.overall_accuracy,
                badges: statistics.badges,
              },
              levels: statistics.levels,
            });
          } catch (error) {
            console.error('Failed to fetch statistics:', error);
          }
        },

        fetchPythagorasGrid: async (module?: LearningModule, level?: number) => {
          const targetModule = module || get().activeModule;
          const targetLevel = level || get().currentLevel;

          try {
            const grid = await api.getPythagorasGrid(targetModule, targetLevel);

            set({
              pythagoras: {
                module: grid.module,
                level: grid.level,
                epoch: grid.epoch,
                max_operand: grid.max_operand,
                grid: grid.grid,
                highlightedCell: null,
              },
            });
          } catch (error) {
            console.error('Failed to fetch Pythagoras grid:', error);
          }
        },

        // ==================================================================
        // UI ACTIONS
        // ==================================================================

        setInputValue: (value: string) => {
          set((state) => ({
            ui: { ...state.ui, inputValue: value },
          }));
        },

        toggleHint: () => {
          set((state) => ({
            ui: { ...state.ui, showHint: !state.ui.showHint },
          }));
        },

        clearNotification: (id: string) => {
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: state.ui.notifications.filter((n) => n.id !== id),
            },
          }));
        },

        clearError: () => {
          set((state) => ({
            ui: { ...state.ui, error: null },
          }));
        },

        // ==================================================================
        // RESET
        // ==================================================================

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'learning-vnext-storage',
        partialize: (state) => ({
          // Only persist essential session data
          sessionId: state.sessionId,
          activeModule: state.activeModule,
          currentLevel: state.currentLevel,
        }),
      }
    ),
    { name: 'LearningStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectCurrentTask = (state: LearningStore) => state.currentTask;
export const selectIsLoading = (state: LearningStore) => state.ui.isLoading;
export const selectError = (state: LearningStore) => state.ui.error;
export const selectMastery = (state: LearningStore) => state.mastery;
export const selectLevelProgress = (state: LearningStore) => state.levelProgress;
export const selectPythagoras = (state: LearningStore) => state.pythagoras;
export const selectNotifications = (state: LearningStore) => state.ui.notifications;
export const selectMode = (state: LearningStore) => state.mode;
export const selectLevel = (state: LearningStore) => state.currentLevel;
export const selectModule = (state: LearningStore) => state.activeModule;

export default useLearningStore;

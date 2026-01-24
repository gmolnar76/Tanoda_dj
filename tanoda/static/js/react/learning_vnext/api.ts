/**
 * vNext Learning API Client
 * =========================
 *
 * API client for the learning backend.
 * All requests include client_event_id for idempotency.
 */

import axios, { AxiosInstance } from 'axios';
import type {
  LearningModule,
  LearningMode,
  SessionResponse,
  AnswerResponse,
  PythagorasResponse,
  StatisticsState,
  LevelInfo,
} from './types';

// Generate unique event ID
const generateEventId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get CSRF token from cookie
const getCSRFToken = (): string => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return '';
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api/learning',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  config.headers['X-CSRFToken'] = getCSRFToken();
  return config;
});

// ============================================================================
// SESSION ENDPOINTS
// ============================================================================

export const startSession = async (
  module: LearningModule = 'multiplication',
  mode: LearningMode = 'practice',
  level: number = 1
): Promise<SessionResponse> => {
  const response = await api.post<SessionResponse>('/session/start/', {
    module,
    mode,
    level,
    client_event_id: generateEventId(),
  });
  return response.data;
};

export const getSession = async (): Promise<SessionResponse | null> => {
  const response = await api.get<SessionResponse | { session: null }>('/session/');
  if ('session' in response.data && response.data.session === null) {
    return null;
  }
  return response.data as SessionResponse;
};

export const endSession = async (sessionId: string): Promise<void> => {
  await api.post('/session/end/', {
    session_id: sessionId,
    client_event_id: generateEventId(),
  });
};

// ============================================================================
// TASK ENDPOINTS
// ============================================================================

export const submitAnswer = async (
  sessionId: string,
  userAnswer: number,
  responseTimeMs?: number
): Promise<AnswerResponse> => {
  const response = await api.post<AnswerResponse>('/answer/', {
    session_id: sessionId,
    user_answer: userAnswer,
    response_time_ms: responseTimeMs,
    client_event_id: generateEventId(),
  });
  return response.data;
};

export const getNextTask = async (sessionId: string): Promise<{
  task: SessionResponse['current_task'];
  session_id: string;
  level: number;
  epoch: number;
}> => {
  const response = await api.post('/task/next/', {
    session_id: sessionId,
    client_event_id: generateEventId(),
  });
  return response.data;
};

// ============================================================================
// LEVEL & MODE ENDPOINTS
// ============================================================================

export const changeLevel = async (
  sessionId: string,
  newLevel: number
): Promise<{
  old_level: number;
  new_level: number;
  task: SessionResponse['current_task'];
  level_info: LevelInfo;
}> => {
  const response = await api.post('/level/change/', {
    session_id: sessionId,
    new_level: newLevel,
    client_event_id: generateEventId(),
  });
  return response.data;
};

export const changeMode = async (
  sessionId: string,
  newMode: LearningMode
): Promise<{
  old_mode: LearningMode;
  new_mode: LearningMode;
}> => {
  const response = await api.post('/mode/change/', {
    session_id: sessionId,
    new_mode: newMode,
    client_event_id: generateEventId(),
  });
  return response.data;
};

export const changeModule = async (
  sessionId: string,
  newModule: LearningModule
): Promise<{
  old_module: LearningModule;
  new_module: LearningModule;
  task: SessionResponse['current_task'];
}> => {
  const response = await api.post('/module/change/', {
    session_id: sessionId,
    new_module: newModule,
    client_event_id: generateEventId(),
  });
  return response.data;
};

export const resetLevel = async (
  sessionId: string,
  level?: number
): Promise<{
  level: number;
  old_epoch: number;
  new_epoch: number;
  task: SessionResponse['current_task'];
  notifications: Array<{ type: string; message: string }>;
}> => {
  const response = await api.post('/level/reset/', {
    session_id: sessionId,
    level,
    client_event_id: generateEventId(),
  });
  return response.data;
};

// ============================================================================
// STATISTICS ENDPOINTS
// ============================================================================

export const getStatistics = async (
  module: LearningModule = 'multiplication'
): Promise<StatisticsState> => {
  const response = await api.get<StatisticsState>('/statistics/', {
    params: { module },
  });
  return response.data;
};

export const getPythagorasGrid = async (
  module: LearningModule = 'multiplication',
  level?: number
): Promise<PythagorasResponse> => {
  const response = await api.get<PythagorasResponse>('/pythagoras/', {
    params: { module, level },
  });
  return response.data;
};

export const getLevelsInfo = async (
  module: LearningModule = 'multiplication'
): Promise<{
  module: LearningModule;
  levels: LevelInfo[];
}> => {
  const response = await api.get('/levels/', {
    params: { module },
  });
  return response.data;
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.message;
      throw new APIError(message, error.response?.status, error.response?.data);
    }
    throw error;
  }
);

export default api;

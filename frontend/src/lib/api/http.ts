import type { ApiClient } from './types';

// Real implementation, wired up once SCRUM-15 (Express backend) exists. Every method
// throws until then so the seam is visible in code review rather than silently no-op.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

function notReady(endpoint: string): never {
  throw new Error(
    `http API client not implemented yet: ${endpoint} (base url: "${BASE_URL}"). ` +
      'Backend endpoints land in SCRUM-15/SCRUM-23 — set EXPO_PUBLIC_USE_MOCK_API=true until then.'
  );
}

export const httpApi: ApiClient = {
  auth: {
    signup: () => notReady('POST /api/auth/signup'),
    login: () => notReady('POST /api/auth/login'),
  },
  routines: {
    generate: () => notReady('POST /api/routines'),
    getCurrent: () => notReady('GET /api/routines'),
  },
  logs: {
    getDailySummary: () => notReady('GET /api/logs'),
    logFoodFromText: () => notReady('POST /api/logs'),
  },
  workouts: {
    logSet: () => notReady('POST /api/logs (set)'),
    finishWorkout: () => notReady('POST /api/logs (finish workout)'),
    skipToday: () => notReady('POST /api/logs (skip)'),
  },
};

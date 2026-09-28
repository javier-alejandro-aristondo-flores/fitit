import { httpApi } from './http';
import { mockApi } from './mock';
import type { ApiClient } from './types';

// Every screen imports `api` from here — never from ./mock or ./http directly.
// This is the entire seam for swapping to the real backend once SCRUM-15/23 land.
const useMock = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';

export const api: ApiClient = useMock ? mockApi : httpApi;

export type { ApiClient } from './types';

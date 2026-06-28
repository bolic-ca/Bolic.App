/**
 * API Configuration
 * Local development server configuration
 */

// Get config from environment variables (with fallbacks)
const getEnvVar = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

export const API_CONFIG = {
  baseURL: getEnvVar('API_BASE_URL', 'http://localhost:7071/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Feature flag to use mock data instead of API
export const USE_MOCK_DATA = getEnvVar('USE_MOCK_DATA', 'false') === 'true';

// Mock user ID for local testing
// TODO: Replace with actual auth system
export const MOCK_USER_ID = getEnvVar(
  'MOCK_USER_ID',
  '123e4567-e89b-12d3-a456-426614174001'
);

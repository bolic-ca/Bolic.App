/**
 * API Client
 * Handles HTTP requests to the Bolic Training API
 */

import { API_CONFIG } from './config';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: any;
  params?: Record<string, string>;
}

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const { method, endpoint, body, params } = options;

  // Build URL with query params for GET requests
  let url = `${API_CONFIG.baseURL}${endpoint}`;
  if (params && method === 'GET') {
    const queryString = new URLSearchParams(params).toString();
    url = `${url}?${queryString}`;
  }

  const config: RequestInit = {
    method,
    headers: API_CONFIG.headers,
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Parse response
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new APIError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or parsing error
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

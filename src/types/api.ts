/**
 * Generic API types
 * 
 * Common interfaces for API request and response handling
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  statusCode?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Common request options
 */
export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

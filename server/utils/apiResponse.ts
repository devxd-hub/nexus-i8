export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T, M = PaginationMeta | Record<string, unknown> | null> {
  data: T;
  meta: M;
  error: null;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  data: null;
  meta: null;
  error: ApiErrorPayload;
}

export function apiSuccess<T, M = PaginationMeta | Record<string, unknown> | null>(
  data: T,
  meta: M = null as M
): ApiResponse<T, M> {
  return {
    data,
    meta,
    error: null,
  };
}

export function apiError(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    data: null,
    meta: null,
    error: {
      code,
      message,
      details,
    },
  };
}

export function parsePaginationParams(query: Record<string, unknown>, defaultLimit: number = 12): {
  page: number;
  limit: number;
  offset: number;
} {
  let page = parseInt(String(query.page || '1'), 10);
  let limit = parseInt(String(query.limit || defaultLimit), 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }
  if (limit > 100) {
    limit = 100;
  }

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function createPaginationMeta(
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

import type { PaginationMeta } from '@vesioh/types';

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function parsePagination(
  query: Record<string, unknown>,
  defaultLimit: number,
  maxLimit: number,
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, Number(query['page'] ?? 1));
  const limit = Math.min(Math.max(1, Number(query['limit'] ?? defaultLimit)), maxLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

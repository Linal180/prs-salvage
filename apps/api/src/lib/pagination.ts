import { z } from "zod";

/** Shared list pagination — reuse on every future listing endpoint. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export function parsePagination(query: unknown): PaginationQuery {
  return paginationQuerySchema.parse(query ?? {});
}

export function paginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

export function paginationSkip(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}

/** Clamp page against total, then return skip/take for Prisma. */
export function resolvePagination(total: number, page: number, pageSize: number) {
  const meta = paginationMeta(total, page, pageSize);
  return {
    meta,
    skip: paginationSkip(meta.page, pageSize),
    take: pageSize,
  };
}

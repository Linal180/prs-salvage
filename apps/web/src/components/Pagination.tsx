import type { PaginationMeta } from "../lib/api";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type PaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /** Optional noun for the summary, e.g. "users", "vehicles" */
  itemLabel?: string;
};

/**
 * Reusable list pager for admin/dealer/insurance tables.
 * Wire any future listing page with the same `pagination` API shape.
 */
export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  itemLabel = "items",
}: PaginationProps) {
  const { page, pageSize, total, totalPages, hasNext, hasPrev } = pagination;

  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-line bg-wash px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Showing <span className="font-medium text-ink">{from}</span>–
        <span className="font-medium text-ink">{to}</span> of{" "}
        <span className="font-medium text-ink">{total}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <span>Per page</span>
            <select
              className="rounded-md border border-line bg-paper px-2 py-1.5 text-ink outline-none focus:border-prs-500"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:border-prs-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="min-w-[5.5rem] text-center text-sm text-muted">
          Page <span className="font-medium text-ink">{page}</span> / {totalPages}
        </span>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:border-prs-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export const DEFAULT_PAGE_SIZE = 10;

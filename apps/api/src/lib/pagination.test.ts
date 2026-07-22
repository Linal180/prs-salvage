import { describe, expect, it } from "vitest";
import {
  parsePagination,
  paginationMeta,
  resolvePagination,
} from "./pagination.js";

describe("parsePagination", () => {
  it("defaults to page 1 / size 10", () => {
    expect(parsePagination({})).toEqual({ page: 1, pageSize: 10 });
  });

  it("coerces string query params", () => {
    expect(parsePagination({ page: "2", pageSize: "20" })).toEqual({
      page: 2,
      pageSize: 20,
    });
  });

  it("rejects pageSize over 50", () => {
    expect(() => parsePagination({ pageSize: "100" })).toThrow();
  });
});

describe("resolvePagination", () => {
  it("clamps oversized page and computes skip", () => {
    const { meta, skip, take } = resolvePagination(25, 99, 10);
    expect(meta.page).toBe(3);
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(true);
    expect(skip).toBe(20);
    expect(take).toBe(10);
  });

  it("handles empty lists", () => {
    const { meta, skip } = resolvePagination(0, 1, 10);
    expect(meta.total).toBe(0);
    expect(meta.totalPages).toBe(1);
    expect(meta.hasNext).toBe(false);
    expect(skip).toBe(0);
  });
});

describe("paginationMeta", () => {
  it("marks hasNext correctly", () => {
    const meta = paginationMeta(11, 1, 10);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(false);
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination } from "../components/Pagination";
import type { PaginationMeta } from "../lib/api";

afterEach(() => cleanup());

const base: PaginationMeta = {
  page: 2,
  pageSize: 10,
  total: 35,
  totalPages: 4,
  hasNext: true,
  hasPrev: true,
};

describe("Pagination component", () => {
  it("shows range summary and page numbers", () => {
    render(
      <Pagination pagination={base} onPageChange={() => undefined} itemLabel="users" />,
    );
    expect(screen.getByText(/showing/i).textContent).toMatch(/11.*20.*35.*users/i);
    expect(screen.getByText(/page/i).textContent).toMatch(/2\s*\/\s*4/);
  });

  it("Previous / Next call onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination pagination={base} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables Previous on first page", () => {
    render(
      <Pagination
        pagination={{ ...base, page: 1, hasPrev: false }}
        onPageChange={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("renders nothing when total is 0", () => {
    const { container } = render(
      <Pagination
        pagination={{ ...base, total: 0 }}
        onPageChange={() => undefined}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("page size select fires callback", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        pagination={base}
        onPageChange={() => undefined}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    await user.selectOptions(screen.getByRole("combobox"), "20");
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});

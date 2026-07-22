import { useCallback, useEffect, useState } from "react";
import { Pagination, DEFAULT_PAGE_SIZE } from "../components/Pagination";
import { Alert, Page, Shell } from "../components/ui";
import {
  api,
  roleLabel,
  statusLabel,
  type ApiError,
  type PaginationMeta,
  type User,
  type UserStatus,
} from "../lib/api";

type Filter = "ALL" | UserStatus;

const emptyPagination: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export function AdminPage() {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, suspended: 0 });
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.adminUsers(filter, page, pageSize);
      setUsers(res.users);
      setPagination(res.pagination);
      setCounts(res.counts);
    } catch (err) {
      setError((err as ApiError).error ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(1);
  }

  function changePageSize(next: number) {
    setPageSize(next);
    setPage(1);
  }

  async function act(id: string, action: "approve" | "suspend") {
    setBusyId(id);
    setError(null);
    try {
      await api.adminUserAction(id, action);
      await load();
    } catch (err) {
      setError((err as ApiError).error ?? "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "PENDING", label: "Pending", count: counts.pending },
    { key: "APPROVED", label: "Approved", count: counts.approved },
    { key: "SUSPENDED", label: "Suspended", count: counts.suspended },
    { key: "ALL", label: "All" },
  ];

  return (
    <Shell>
      <Page
        title="Admin · Users"
        subtitle="Approve new registrations or suspend accounts. Only approved users can use role dashboards."
      >
        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => changeFilter(f.key)}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                filter === f.key
                  ? "bg-prs-600 text-white"
                  : "border border-line bg-paper text-muted hover:border-prs-300"
              }`}
            >
              {f.label}
              {typeof f.count === "number" ? ` (${f.count})` : ""}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-paper">
          {loading ? (
            <p className="p-6 text-muted">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-muted">No users in this filter.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-line bg-wash text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name / Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink">{u.displayName}</div>
                          <div className="text-muted">{u.email}</div>
                          <div className="mt-1 text-xs">
                            {u.emailVerified ? (
                              <span className="text-prs-700">Email verified</span>
                            ) : (
                              <span className="text-amber-700">Email not verified</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{roleLabel(u.role)}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={u.status} />
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {[u.phone, u.taxNumber, u.location]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {u.status !== "APPROVED" && (
                              <button
                                type="button"
                                disabled={busyId === u.id}
                                onClick={() => void act(u.id, "approve")}
                                className="rounded-md bg-prs-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-prs-700 disabled:opacity-60"
                              >
                                Approve
                              </button>
                            )}
                            {u.status !== "SUSPENDED" && (
                              <button
                                type="button"
                                disabled={busyId === u.id}
                                onClick={() => void act(u.id, "suspend")}
                                className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-700 disabled:opacity-60"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
                onPageSizeChange={changePageSize}
                itemLabel="users"
              />
            </>
          )}
        </div>
      </Page>
    </Shell>
  );
}

function StatusPill({ status }: { status: UserStatus }) {
  const styles: Record<UserStatus, string> = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    APPROVED: "bg-prs-50 text-prs-800 border-prs-200",
    SUSPENDED: "bg-red-50 text-red-800 border-red-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

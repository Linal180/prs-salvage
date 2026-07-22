export type Role = "ADMIN" | "INSURANCE" | "DEALER" | "PRIVATE_SELLER";
export type UserStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export type User = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  displayName: string;
  phone: string | null;
  taxNumber: string | null;
  location: string | null;
  policyAcceptedAt: string | null;
  emailVerifiedAt: string | null;
  emailVerified: boolean;
  approvedAt: string | null;
  createdAt: string;
};

/** Shared pagination payload — same shape for every future list API. */
export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type ApiError = {
  error: string;
  status?: UserStatus;
  details?: { path: string; message: string }[];
  fields?: Record<string, string>;
};

const JSON_HEADERS = { "Content-Type": "application/json" };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body !== undefined && init.body !== null;
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...(hasBody ? JSON_HEADERS : {}),
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw data as ApiError;
  }
  return data as T;
}

export function paginationQuery(page: number, pageSize: number) {
  return `page=${page}&pageSize=${pageSize}`;
}

export const api = {
  me: () => request<{ user: User }>("/api/me"),
  login: (body: { email: string; password: string }) =>
    request<{ user: User; message: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: Record<string, unknown>) =>
    request<{
      user: User;
      message: string;
      emailVerificationSent?: boolean;
      devVerificationUrl?: string;
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () =>
    request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  verifyEmail: (token: string) =>
    request<{ user: User; message: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  resendVerification: () =>
    request<{
      ok: boolean;
      message: string;
      alreadyVerified?: boolean;
      emailVerificationSent?: boolean;
      devVerificationUrl?: string;
      user?: User;
    }>("/api/auth/resend-verification", { method: "POST" }),
  adminUsers: (status: string = "ALL", page = 1, pageSize = 10) =>
    request<{
      users: User[];
      pagination: PaginationMeta;
      counts: { pending: number; approved: number; suspended: number };
    }>(`/api/admin/users?status=${status}&${paginationQuery(page, pageSize)}`),
  adminUserAction: (id: string, action: "approve" | "suspend") =>
    request<{ user: User; message: string }>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),
};

export function roleLabel(role: Role) {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "INSURANCE":
      return "Insurance Company";
    case "DEALER":
      return "Salvage Dealer";
    case "PRIVATE_SELLER":
      return "Private Seller";
  }
}

export function statusLabel(status: UserStatus) {
  switch (status) {
    case "PENDING":
      return "Pending approval";
    case "APPROVED":
      return "Approved";
    case "SUSPENDED":
      return "Suspended";
  }
}

export function homePathFor(user: User) {
  if (user.role === "ADMIN") return "/admin";
  if (user.status === "SUSPENDED") return "/login";
  if (!user.emailVerified) return "/verify-email";
  if (user.status === "PENDING") return "/pending";
  return "/dashboard";
}

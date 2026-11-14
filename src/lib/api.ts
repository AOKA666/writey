import {
  defaultEntitlement,
  loadLocalEntitlement,
  saveLocalEntitlement,
  type Entitlement,
  type PlanId,
} from "@/lib/quota";

export type SessionResponse = {
  ok: true;
  entitlement: Entitlement;
  backend: "d1" | "local_fallback";
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  const data = (await res.json()) as T | ApiError;
  if (!res.ok || (data && typeof data === "object" && "ok" in data && data.ok === false)) {
    const err = data as ApiError;
    throw new Error(err.error?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export async function fetchSession(): Promise<SessionResponse> {
  try {
    return await request<SessionResponse>("/api/session");
  } catch {
    const local = loadLocalEntitlement() ?? defaultEntitlement();
    saveLocalEntitlement(local);
    return { ok: true, entitlement: local, backend: "local_fallback" };
  }
}

export async function consumeQuota(input: {
  kind: "pages" | "jobs" | "previews";
  pages?: number;
}): Promise<SessionResponse> {
  try {
    return await request<SessionResponse>("/api/quota/consume", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    const current = loadLocalEntitlement() ?? defaultEntitlement();
    if (input.kind === "pages") {
      current.pages_used += input.pages ?? 0;
      current.jobs_used_today += 1;
    } else if (input.kind === "jobs") {
      current.jobs_used_today += 1;
    } else {
      current.previews_used_today += 1;
    }
    saveLocalEntitlement(current);
    return { ok: true, entitlement: current, backend: "local_fallback" };
  }
}

export async function login(email: string, password: string): Promise<SessionResponse> {
  return request<SessionResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
): Promise<SessionResponse> {
  return request<SessionResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  try {
    await request("/api/auth/logout", { method: "POST", body: "{}" });
  } catch {
    // still clear local guest state? keep quota
  }
}

export async function checkout(): Promise<{
  ok: true;
  state: "payments_closed";
  message: string;
}> {
  try {
    return await request("/api/payments/checkout", {
      method: "POST",
      body: "{}",
    });
  } catch {
    return {
      ok: true,
      state: "payments_closed",
      message:
        "Payments are not open yet. We will not charge your account. You can keep using the Free plan or ask to be notified at support@[DOMAIN].",
    };
  }
}

export async function joinWaitlist(input: {
  kind: "teams_education" | "payments_open";
  name?: string;
  email: string;
  organisation?: string;
  message?: string;
}): Promise<{ ok: true }> {
  try {
    return await request("/api/waitlist", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: true };
  }
}

export function applyPlanOverride(current: Entitlement, plan: PlanId): Entitlement {
  const next = defaultEntitlement({ ...current, plan_id: plan });
  next.pages_used = current.pages_used;
  next.jobs_used_today = current.jobs_used_today;
  next.previews_used_today = current.previews_used_today;
  if (plan === "pro") {
    next.watermark = false;
    next.plan_id = "pro";
    const { pages_limit, jobs_limit, previews_limit, pages_per_preview_limit } =
      // re-read limits
      {
        pages_limit: next.pages_limit,
        jobs_limit: next.jobs_limit,
        previews_limit: next.previews_limit,
        pages_per_preview_limit: next.pages_per_preview_limit,
      };
    next.pages_limit = pages_limit;
    next.jobs_limit = jobs_limit;
    next.previews_limit = previews_limit;
    next.pages_per_preview_limit = pages_per_preview_limit;
  }
  saveLocalEntitlement(next);
  return next;
}

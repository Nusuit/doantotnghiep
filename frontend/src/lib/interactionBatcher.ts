import { API_BASE_API_URL } from "@/lib/config";

interface ViewPayload {
  articleId: number;
  timeSpentMs?: number;
  scrollDepthPercent?: number;
}

const pending = new Map<number, ViewPayload>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

function getCsrfToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
}

async function flush(keepalive = false) {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const entries = Array.from(pending.values());
  pending.clear();

  if (entries.length === 0) return;

  const csrf = getCsrfToken();
  const url = `${API_BASE_API_URL}/interactions/batch`;
  const body = {
    interactions: entries.map((entry) => ({
      articleId: entry.articleId,
      type: "VIEW",
      timeSpentMs: entry.timeSpentMs,
      scrollDepthPercent: entry.scrollDepthPercent,
    })),
  };

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    credentials: "include",
    body: JSON.stringify(body),
    keepalive,
  }).catch(() => null);
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flush().catch(() => null);
  }, 3000);
}

function ensureLifecycleHooks() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("visibilitychange", () => {
    if (document.hidden) flush(true).catch(() => null);
  });

  window.addEventListener("beforeunload", () => {
    flush(true).catch(() => null);
  });
}

export function enqueueView(payload: ViewPayload) {
  ensureLifecycleHooks();

  const existing = pending.get(payload.articleId);
  if (existing) {
    pending.set(payload.articleId, {
      articleId: payload.articleId,
      timeSpentMs: Math.max(existing.timeSpentMs || 0, payload.timeSpentMs || 0),
      scrollDepthPercent: Math.max(existing.scrollDepthPercent || 0, payload.scrollDepthPercent || 0),
    });
  } else {
    pending.set(payload.articleId, payload);
  }

  scheduleFlush();
}

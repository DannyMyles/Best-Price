"use client";

const STORAGE_KEY = "bestprice-recently-viewed";
const MAX_ITEMS = 8;

export function recordView(slug: string) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...existing.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}

export function readViewed(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

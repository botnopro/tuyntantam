"use client";

import { useSyncExternalStore } from "react";

/** Danh sách BĐS yêu thích / so sánh lưu ở localStorage (không cần tài khoản). */
type ListKey = "tt-favorites" | "tt-compare";
export const COMPARE_MAX = 4;

const listeners = new Set<() => void>();
const EMPTY: string[] = [];
const cache = new Map<ListKey, { raw: string | null; value: string[] }>();

function read(key: ListKey): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;
  let value: string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    value = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string").slice(0, 50) : EMPTY;
  } catch {
    value = EMPTY;
  }
  cache.set(key, { raw, value });
  return value;
}

function write(key: ListKey, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // bộ nhớ trình duyệt bị chặn — bỏ qua
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("tt-")) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedList(key: ListKey) {
  const list = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );
  return {
    list,
    has: (slug: string) => list.includes(slug),
    toggle: (slug: string) => {
      const current = read(key);
      if (current.includes(slug)) {
        write(
          key,
          current.filter((s) => s !== slug),
        );
        return false;
      }
      if (key === "tt-compare" && current.length >= COMPARE_MAX) return null;
      write(key, [...current, slug]);
      return true;
    },
    clear: () => write(key, []),
  };
}

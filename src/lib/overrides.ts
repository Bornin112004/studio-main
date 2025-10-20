import type { Department, Kpi } from "@/lib/types";

const KEY = "kpi-overrides:v1";

export type KpiOverrides = Partial<Record<Department, Kpi[]>>;

export function saveOverrides(data: KpiOverrides) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function loadOverrides(): KpiOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KpiOverrides) : {};
  } catch {
    return {};
  }
}

export function clearOverrides() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

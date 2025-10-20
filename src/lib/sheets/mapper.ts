import type { Department, Kpi } from "@/lib/types";
import { kpisByDepartment } from "@/lib/kpis-by-department";
import { kpis as roleKpis } from "@/lib/data";

// All valid departments including roles
export const DEPARTMENTS: Department[] = ["Marketing", "Engineering", "Testing", "CEO", "Manager", "Employee"];

function coerceNumber(s: string | undefined): number | null {
  const raw = String(s ?? "").replace(/[, $]/g, "");
  const m = raw.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function synthesizeTrend(currentStr: string, changeStr: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const current = coerceNumber(currentStr) ?? 0;
  const changeNum = coerceNumber(changeStr) ?? 0;
  const positive = /(^\+)|increase/i.test(changeStr) || changeNum > 0;
  const start = positive ? current * 0.85 : current * 1.15;
  const step = (current - start) / (months.length - 1);
  return months.map((m, i) => ({ month: m, value: Math.round((start + step * i) * 100) / 100 }));
}

export function indexDefaultsById() {
  const map: Record<string, Kpi> = {};

  // Index department KPIs
  for (const dept of ["Marketing", "Engineering", "Testing"] as const) {
    for (const k of kpisByDepartment[dept]) map[k.id] = k;
  }

  // Index role-based KPIs
  for (const role of ["CEO", "Manager", "Employee"] as const) {
    for (const k of roleKpis[role]) map[k.id] = k;
  }

  return map;
}

export function mergeWithDefaults(base: Kpi[], overrides: Kpi[]): Kpi[] {
  const byId = new Map(base.map(b => [b.id, b] as const));
  return overrides.map(o => {
    const def = byId.get(o.id);
    return {
      ...def,
      ...o,
      trendData: o.trendData && o.trendData.length ? o.trendData : def?.trendData ?? synthesizeTrend(o.value, o.change),
      comments: o.comments ?? def?.comments ?? [],
    } as Kpi;
  });
}

export function mapSheetValuesToKpis(values: string[][]): { all: Kpi[]; byDepartment: Partial<Record<Department, Kpi[]>> } {
  if (!values?.length) return { all: [], byDepartment: {} };

  const [header, ...rows] = values;
  const key = (s: string) => String(s ?? "").trim().toLowerCase();
  const col = (n: string) => header.findIndex(h => key(h) === n);

  const c = {
    id: col("id"),
    department: col("department"),
    title: col("title"),
    value: col("value"),
    change: col("change"),
    changeType: col("changetype"),
    status: col("status"),
    description: col("description"),
    icon: col("icon"),
    chartType: col("charttype"),
    trendData: col("trenddata"),
    comments: col("comments"),
    roles: col("roles"),
  } as const;

  const defaults = indexDefaultsById();

  const kpis: Kpi[] = rows
    .filter(r => r?.some(cell => String(cell ?? "").trim().length > 0))
    .map((r) => {
      const g = (i: number) => (i >= 0 ? String(r[i] ?? "").trim() : "");
      const id = g(c.id);
      const def = defaults[id];

      const change = g(c.change);
      const changeType = (g(c.changeType) || ((coerceNumber(change) ?? 0) >= 0 ? "increase" : "decrease")) as "increase" | "decrease";
      const roles = (g(c.roles) || "").split(",").map(s => s.trim()).filter(Boolean);

      // Parse trendData from JSON if provided
      let trendData: Array<{ month: string; value: number }> = [];
      if (c.trendData >= 0 && g(c.trendData)) {
        try {
          const parsed = JSON.parse(g(c.trendData));
          if (Array.isArray(parsed)) {
            trendData = parsed.map(item => ({
              month: String(item.month || ""),
              value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0
            }));
          }
        } catch (e) {
          console.warn(`Row with ID ${id}: Invalid trendData JSON, will synthesize`);
        }
      }

      // Parse comments from JSON if provided
      let comments: Array<{ id: number; author: string; avatar: string; text: string; timestamp: string }> = [];
      if (c.comments >= 0 && g(c.comments)) {
        try {
          const parsed = JSON.parse(g(c.comments));
          if (Array.isArray(parsed)) {
            comments = parsed.map(comment => ({
              id: typeof comment.id === 'number' ? comment.id : parseInt(comment.id, 10) || 0,
              author: String(comment.author || ""),
              avatar: String(comment.avatar || ""),
              text: String(comment.text || ""),
              timestamp: String(comment.timestamp || "")
            }));
          }
        } catch (e) {
          console.warn(`Row with ID ${id}: Invalid comments JSON`);
        }
      }

      const base: Kpi = def ?? {
        id,
        title: g(c.title),
        value: g(c.value),
        change,
        changeType,
        status: (g(c.status) || "on-track") as Kpi["status"],
        description: g(c.description) || "",
        icon: (g(c.icon) || "TrendingUp") as Kpi["icon"],
        chartType: (g(c.chartType) || "line") as Kpi["chartType"],
        trendData: [],
        comments: [],
        roles: roles as any,
      };

      const merged: Kpi = {
        ...base,
        id,
        title: g(c.title) || base.title,
        value: g(c.value) || base.value,
        change,
        changeType,
        status: (g(c.status) || base.status) as Kpi["status"],
        description: g(c.description) || base.description,
        icon: (g(c.icon) || base.icon) as Kpi["icon"],
        chartType: (g(c.chartType) || base.chartType) as Kpi["chartType"],
        roles: roles.length ? (roles as Kpi["roles"]) : base.roles,
      };

      // Use parsed trendData if available, otherwise use default or synthesize
      merged.trendData = trendData.length > 0
        ? trendData
        : (def?.trendData?.length ? def.trendData : synthesizeTrend(merged.value, merged.change));

      merged.comments = comments.length > 0 ? comments : (def?.comments ?? []);

      return merged;
    });

  const byDepartment: Partial<Record<Department, Kpi[]>> = {};
  for (const dept of DEPARTMENTS) byDepartment[dept] = [];

  for (const r of rows) {
    const dept = String(r[c.department] ?? "").trim() as Department;
    const id = String(r[c.id] ?? "").trim();
    const kpi = kpis.find(k => k.id === id);
    if (kpi && (DEPARTMENTS as string[]).includes(dept)) {
      byDepartment[dept as Department]!.push(kpi);
    }
  }

  return { all: kpis, byDepartment };
}

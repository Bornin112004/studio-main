"use client";

import { useKpiData } from "@/context/kpi-data-context";
import { KpiCard } from "@/components/dashboard/kpi-card";

export function EmployeeDashboard() {
  const { kpiData } = useKpiData();
  
  // Check for Employee-specific KPIs
  const employeeKpis = kpiData.Employee || [];

  return (
    <div className="space-y-6">
      {employeeKpis.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No Employee KPIs available. Load data from integrations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employeeKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

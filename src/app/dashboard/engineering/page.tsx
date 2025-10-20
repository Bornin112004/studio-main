"use client";

import { useKpiData } from "@/context/kpi-data-context";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PerformanceAnalysisDialog } from "@/components/dashboard/performance-analysis-dialog";
import { DepartmentSummaryDialog } from "@/components/dashboard/department-summary-dialog";

export default function EngineeringDashboard() {
  const { kpiData } = useKpiData();
  const engineeringKpis = kpiData.Engineering || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Engineering Dashboard</h1>
        <div className="flex gap-2">
          <DepartmentSummaryDialog departmentName="Engineering" kpis={engineeringKpis} />
          <PerformanceAnalysisDialog departmentName="Engineering" kpis={engineeringKpis} />
        </div>
      </div>
      
      {engineeringKpis.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No engineering KPIs available. Load data from integrations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {engineeringKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

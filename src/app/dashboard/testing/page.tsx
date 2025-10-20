"use client";

import { useKpiData } from "@/context/kpi-data-context";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PerformanceAnalysisDialog } from "@/components/dashboard/performance-analysis-dialog";
import { DepartmentSummaryDialog } from "@/components/dashboard/department-summary-dialog";

export default function TestingDashboard() {
  const { kpiData } = useKpiData();
  const testingKpis = kpiData.Testing || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Testing Dashboard</h1>
        <div className="flex gap-2">
          <DepartmentSummaryDialog departmentName="Testing" kpis={testingKpis} />
          <PerformanceAnalysisDialog departmentName="Testing" kpis={testingKpis} />
        </div>
      </div>
      
      {testingKpis.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No testing KPIs available. Load data from integrations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testingKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

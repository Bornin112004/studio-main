"use client";

import { useKpiData } from "@/context/kpi-data-context";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PerformanceAnalysisDialog } from "@/components/dashboard/performance-analysis-dialog";
import { DepartmentSummaryDialog } from "@/components/dashboard/department-summary-dialog";

export function CeoDashboard() {
  const { kpiData } = useKpiData();

  // Get all departments including CEO-specific KPIs
  const departments = Object.keys(kpiData);
  
  // Prioritize CEO department if it exists
  const ceoKpis = kpiData.CEO || [];
  const otherDepts = departments.filter(d => d !== "CEO");

  return (
    <div className="space-y-6">
      {ceoKpis.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Executive Metrics</h3>
            <div className="flex gap-2">
              <DepartmentSummaryDialog departmentName="CEO" kpis={ceoKpis} />
              <PerformanceAnalysisDialog departmentName="CEO" kpis={ceoKpis} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ceoKpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      )}
      
      {otherDepts.map((dept) => {
        const deptKpis = kpiData[dept] || [];
        return (
          <div key={dept}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{dept}</h3>
              <div className="flex gap-2">
                <DepartmentSummaryDialog departmentName={dept} kpis={deptKpis} />
                <PerformanceAnalysisDialog departmentName={dept} kpis={deptKpis} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deptKpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

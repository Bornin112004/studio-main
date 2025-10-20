"use client";

import { useKpiData } from "@/context/kpi-data-context";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { PerformanceAnalysisDialog } from "@/components/dashboard/performance-analysis-dialog";
import { DepartmentSummaryDialog } from "@/components/dashboard/department-summary-dialog";

export function ManagerDashboard() {
  const { kpiData } = useKpiData();
  
  const managerKpis = kpiData.Manager || [];
  const hasDepartmentKpis = managerKpis.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>Key metrics for your team's performance.</CardDescription>
            </div>
            {hasDepartmentKpis && (
              <div className="flex gap-2">
                <DepartmentSummaryDialog departmentName="Manager" kpis={managerKpis} />
                <PerformanceAnalysisDialog departmentName="Manager" kpis={managerKpis} />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasDepartmentKpis ? (
            <div className="text-center py-10 text-muted-foreground">
              No Manager KPIs available. Load data from integrations.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {managerKpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Monthly Report</CardTitle>
            <CardDescription>Auto-generated report for the previous month.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <p className="font-semibold">June 2024 Performance Report</p>
                    <p className="text-sm text-muted-foreground">Ready for review</p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/reports">View Report</Link>
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Data Integrations</CardTitle>
            <CardDescription>Connect your data sources to automate KPI tracking.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                    <div data-ai-hint="google sheets logo" className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="24px" height="24px"><path fill="#169154" d="M29,6H19c-1.7,0-3,1.3-3,3v30c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3V9C32,7.3,30.7,6,29,6z"/><path fill="#00e575" d="M19,39h10c1.7,0,3-1.3,3-3V9c0-1.7-1.3-3-3-3h-2v36h-8V6h-2c-1.7,0-3,1.3-3,3v30C16,37.7,17.3,39,19,39z"/><path fill="#b0bec5" d="M21,6h6v3h-6z"/><path fill="#fff" d="M24.5,25h-5c-0.3,0-0.5-0.2-0.5-0.5v-5c0-0.3,0.2-0.5,0.5-0.5h5c0.3,0,0.5,0.2,0.5,0.5v5C25,24.8,24.8,25,24.5,25z M20,24h4v-4h-4V24z"/><path fill="#fff" d="M24.5,32h-5c-0.3,0-0.5-0.2-0.5-0.5v-5c0-0.3,0.2-0.5,0.5-0.5h5c0.3,0,0.5,0.2,0.5,0.5v5C25,31.8,24.8,32,24.5,32z M20,31h4v-4h-4V31z"/><path fill="#fff" d="M30,17H18v-3h12V17z"/></svg>
                    </div>
                    <div>
                        <p className="font-semibold">Google Sheets</p>
                        <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                </div>
                <Button variant="outline">Manage</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

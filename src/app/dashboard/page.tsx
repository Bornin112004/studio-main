"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { CeoDashboard } from "@/components/dashboard/ceo-dashboard";
import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import type { Role } from "@/lib/types";

export default function DashboardPage() {
  const [role, setRole] = useState<Role>("CEO");

  const renderDashboard = () => {
    switch (role) {
      case "CEO":
        return <CeoDashboard />;
      case "Manager":
        return <ManagerDashboard />;
      case "Employee":
        return <EmployeeDashboard />;
      default:
        return <CeoDashboard />;
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DashboardHeader role={role} setRole={setRole} />
      <main className="flex-1 p-4 md:p-6">
        {renderDashboard()}
      </main>
    </div>
  );
}

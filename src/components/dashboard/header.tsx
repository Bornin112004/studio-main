"use client";

import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Role } from "@/lib/types";
import { KpiSuggester } from "./kpi-suggester";
import { NotificationsPopover } from "./notifications-popover";

interface DashboardHeaderProps {
  role: Role;
  setRole: (role: Role) => void;
}

export function DashboardHeader({ role, setRole }: DashboardHeaderProps) {
  const pageTitle = `${role} Dashboard`;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="w-36">
          <Select value={role} onValueChange={(value: Role) => setRole(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CEO">CEO</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <KpiSuggester role={role}>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Lightbulb className="mr-2 h-4 w-4" />
            Suggest KPIs
          </Button>
        </KpiSuggester>
        
        <NotificationsPopover />
      </div>
    </header>
  );
}

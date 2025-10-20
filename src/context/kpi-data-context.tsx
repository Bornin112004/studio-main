"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Kpi } from "@/lib/types";
import { kpisByDepartment as defaultKpis } from "@/lib/kpis-by-department";
import { mapSheetValuesToKpis } from "@/lib/sheets/mapper";

interface KpiDataContextType {
  kpiData: Record<string, Kpi[]>;
  loadKpiData: (rawData: string[][]) => { success: boolean; message: string };
}

const KpiDataContext = createContext<KpiDataContextType | undefined>(undefined);

export function KpiDataProvider({ children }: { children: ReactNode }) {
  const [kpiData, setKpiData] = useState<Record<string, Kpi[]>>(defaultKpis);

  const loadKpiData = (rawData: string[][]): { success: boolean; message: string } => {
    console.log("=== loadKpiData called ===");
    console.log("rawData:", rawData);

    // Validate input
    if (!rawData || !Array.isArray(rawData)) {
      return { success: false, message: "Invalid data format" };
    }

    if (rawData.length < 2) {
      return { success: false, message: "Need at least a header row and one data row. Current rows: " + rawData.length };
    }

    try {
      // Use the proper mapper that handles all the complexity
      const { all: kpis, byDepartment } = mapSheetValuesToKpis(rawData);
      
      if (kpis.length === 0) {
        return { success: false, message: "No valid KPIs found in the spreadsheet" };
      }

      // Convert byDepartment to include all departments
      const grouped: Record<string, Kpi[]> = {};
      
      // Copy department-based KPIs
      Object.entries(byDepartment).forEach(([dept, kpisArray]) => {
        if (kpisArray && kpisArray.length > 0) {
          grouped[dept] = kpisArray;
        }
      });

      // Update state
      setKpiData(grouped);
      
      const message = `Successfully loaded ${kpis.length} KPIs across ${Object.keys(grouped).length} departments`;
      console.log(message);
      console.log("Loaded KPI data:", grouped);
      
      return { success: true, message };
    } catch (error) {
      console.error("Error parsing spreadsheet data:", error);
      return { 
        success: false, 
        message: `Error parsing data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  return (
    <KpiDataContext.Provider value={{ kpiData, loadKpiData }}>
      {children}
    </KpiDataContext.Provider>
  );
}

export function useKpiData() {
  const context = useContext(KpiDataContext);
  if (!context) {
    throw new Error("useKpiData must be used within KpiDataProvider");
  }
  return context;
}

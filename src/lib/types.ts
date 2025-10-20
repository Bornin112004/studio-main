import type { LucideIcon } from "lucide-react";

export type Role = "CEO" | "Manager" | "Employee";
export type Department = "Marketing" | "Engineering" | "Testing" | "CEO" | "Manager" | "Employee";

export type KpiStatus = "on-track" | "at-risk" | "off-track";

export type Trend = {
  month: string;
  value: number;
};

export type Comment = {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
};

export type Kpi = {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  status: KpiStatus;
  description: string;
  icon: keyof typeof import("lucide-react");
  trendData: Trend[];
  comments: Comment[];
  chartType: "line" | "bar";
  roles?: Role[];
};

export type Notification = {
  id: string;
  kpiTitle: string;
  message: string;
  timestamp: string;
  read: boolean;
};

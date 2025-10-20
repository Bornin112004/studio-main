"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import * as LucideIcons from "lucide-react";
import {
  MessageSquare,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

interface KpiCardProps {
  kpi: Kpi;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const statusColors: Record<Kpi["status"], string> = {
    "on-track": "border-green-500/50 hover:border-green-500",
    "at-risk": "border-yellow-500/50 hover:border-yellow-500",
    "off-track": "border-red-500/50 hover:border-red-500",
  };

  const TrendIcon = kpi.changeType === "increase" ? TrendingUp : TrendingDown;
  const trendColor =
    kpi.changeType === "increase" ? "text-green-600" : "text-red-600";

  const IconComponent = LucideIcons[kpi.icon] as LucideIcons.LucideIcon;

  const renderChart = () => {
    if (kpi.chartType === "bar") {
      return (
        <BarChart data={kpi.trendData}>
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <RechartsTooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }

    return (
      <AreaChart data={kpi.trendData}>
        <defs>
          <linearGradient id={`color-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <RechartsTooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill={`url(#color-${kpi.id})`}
          strokeWidth={2}
        />
      </AreaChart>
    );
  };

  return (
    <Card
      className={cn(
        "flex flex-col transition-all",
        statusColors[kpi.status]
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {IconComponent && <IconComponent className="h-6 w-6" />}
          </div>
          <CardTitle className="text-base font-medium">{kpi.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-3xl font-bold">{kpi.value}</div>
        <div className="mt-1 flex items-center gap-1 text-sm">
          <TrendIcon className={cn("h-4 w-4", trendColor)} />
          <span className={cn("font-medium", trendColor)}>{kpi.change}</span>
          <span className="text-muted-foreground">{kpi.description}</span>
        </div>
        <div className="mt-4 h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <Collapsible className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{kpi.comments.length > 0 ? `${kpi.comments.length} Comments` : "Add Comment"}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-3">
              {kpi.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>
                      {comment.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="font-semibold">{comment.author}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {comment.timestamp}
                    </span>
                    <p className="text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex w-full items-center space-x-2">
              <Input type="text" placeholder="Add a comment..." />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
}

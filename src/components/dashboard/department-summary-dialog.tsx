"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText } from "lucide-react";
import type { Kpi } from "@/lib/types";
import { getDepartmentSummaryAction } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type DepartmentSummaryDialogProps = {
  departmentName: string;
  kpis: Kpi[];
};

export function DepartmentSummaryDialog({ departmentName, kpis }: DepartmentSummaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ strengths: string; weaknesses: string } | null>(null);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setLoading(true);
    setSummary(null);
    const result = await getDepartmentSummaryAction({ departmentName, kpis });
    setLoading(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Summary Failed",
        description: result.error,
      });
    } else if (result.data) {
      setSummary(result.data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleGenerateSummary}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          AI Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Department Summary: {departmentName}</DialogTitle>
          <DialogDescription>
            An AI-generated overview of the department's performance.
          </DialogDescription>
        </DialogHeader>
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-4 text-muted-foreground">Generating summary...</p>
          </div>
        )}
        {summary && (
          <div className="mt-4 space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <AlertTitle className="text-green-800 font-semibold">💪 Strengths</AlertTitle>
              <AlertDescription className="text-green-700 mt-2">
                {summary.strengths}
              </AlertDescription>
            </Alert>
            
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTitle className="text-amber-800 font-semibold">⚠️ Areas for Improvement</AlertTitle>
              <AlertDescription className="text-amber-700 mt-2">
                {summary.weaknesses}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

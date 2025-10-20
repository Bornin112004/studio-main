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
import { Loader2, Sparkles, CheckCircle } from "lucide-react";
import type { Kpi } from "@/lib/types";
import { analyzeDepartmentPerformanceAction } from "@/lib/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AnalysisResult = {
    kpiTitle: string;
    rootCause: string;
    suggestions: string[];
};

type PerformanceAnalysisDialogProps = {
  departmentName: string;
  kpis: Kpi[];
};

export function PerformanceAnalysisDialog({ departmentName, kpis }: PerformanceAnalysisDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult[] | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    const result = await analyzeDepartmentPerformanceAction({ departmentName, kpis });
    setLoading(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: result.error,
      });
    } else if (result.data) {
      setAnalysis(result.data.analysis);
    }
  };

  const hasUnderperformingKpis = kpis.some(kpi => kpi.status === 'at-risk' || kpi.status === 'off-track');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleAnalyze}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Performance Analysis for {departmentName}</DialogTitle>
          <DialogDescription>
            An AI-generated analysis of underperforming KPIs with actionable suggestions.
          </DialogDescription>
        </DialogHeader>
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-4 text-muted-foreground">Analyzing KPIs...</p>
          </div>
        )}
        {analysis && (
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {analysis.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                {analysis.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-semibold text-lg">{item.kpiTitle}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-1">Potential Root Cause</h4>
                            <p className="text-muted-foreground">{item.rootCause}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Suggestions for Improvement</h4>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {item.suggestions.map((suggestion, sIndex) => (
                                    <li key={sIndex}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            ) : (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>All KPIs are on track!</AlertTitle>
                    <AlertDescription>
                        Great job! There are no underperforming KPIs in the {departmentName} department at the moment.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

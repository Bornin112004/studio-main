"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { kpis } from "@/lib/data";
import { ChevronDown, Download } from "lucide-react";
import { generateReportPDF } from "@/lib/generate-report";

export default function ReportsPage() {
  const managerKpis = kpis.Manager;
  const ceoKpis = kpis.CEO;

  const handleDownloadReport = () => {
    // Generate CSV content
    const csvContent = generateCSVReport(ceoKpis, managerKpis);
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Performance_Report_June_2024.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    const html = await generateReportPDF();
    
    // Open in new window for printing to PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const generateCSVReport = (ceoKpis: any[], managerKpis: any[]) => {
    let csv = 'June 2024 Performance Report\n\n';
    
    // Executive Summary
    csv += 'Executive Summary\n';
    csv += '"Overall performance in June was strong, with notable growth in ARR and continued efficiency gains in customer acquisition."\n\n';
    
    // Company-Level KPIs
    csv += 'Company-Level KPIs\n';
    csv += 'KPI,Value,Change,Status,Description\n';
    ceoKpis.forEach(kpi => {
      csv += `"${kpi.title}","${kpi.value}","${kpi.change}","${kpi.status}","${kpi.description}"\n`;
    });
    
    csv += '\n';
    
    // Team & Project KPIs
    csv += 'Team & Project KPIs\n';
    csv += 'KPI,Value,Change,Status,Description\n';
    managerKpis.forEach(kpi => {
      csv += `"${kpi.title}","${kpi.value}","${kpi.change}","${kpi.status}","${kpi.description}"\n`;
    });
    
    return csv;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Monthly Reports</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <span>June 2024</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>June 2024</DropdownMenuItem>
              <DropdownMenuItem>May 2024</DropdownMenuItem>
              <DropdownMenuItem>April 2024</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>June 2024 Performance Report</CardTitle>
            <CardDescription>A summary of key metrics for the previous month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <section>
                <h3 className="text-lg font-semibold">Executive Summary</h3>
                <p className="text-muted-foreground">
                  Overall performance in June was strong, with notable growth in ARR and continued efficiency gains in customer acquisition. While market share growth is slightly behind target, the overall outlook remains positive. Team velocity is up, but project completion rates require attention.
                </p>
              </section>
              <section>
                <h3 className="text-lg font-semibold">Company-Level KPIs</h3>
                <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                  {ceoKpis.map(kpi => (
                    <li key={kpi.id}>
                      <span className="font-semibold text-foreground">{kpi.title}:</span> {kpi.value} ({kpi.change} {kpi.description}) - Status: <span className={`font-medium ${kpi.status === 'on-track' ? 'text-green-600' : kpi.status === 'at-risk' ? 'text-yellow-600' : 'text-red-600'}`}>{kpi.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-lg font-semibold">Team & Project KPIs</h3>
                <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                    {managerKpis.map(kpi => (
                        <li key={kpi.id}>
                        <span className="font-semibold text-foreground">{kpi.title}:</span> {kpi.value} ({kpi.change} {kpi.description}) - Status: <span className={`font-medium ${kpi.status === 'on-track' ? 'text-green-600' : kpi.status === 'at-risk' ? 'text-yellow-600' : 'text-red-600'}`}>{kpi.status}</span>
                        </li>
                    ))}
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

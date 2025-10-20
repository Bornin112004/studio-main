"use server";

import { kpis } from "@/lib/data";

export async function generateReportPDF() {
  // In a real app, you'd use a library like jsPDF or PDFKit
  // For now, we'll return HTML that can be printed to PDF
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>June 2024 Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #333; border-bottom: 2px solid #333; }
    h2 { color: #666; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .on-track { color: green; font-weight: bold; }
    .at-risk { color: orange; font-weight: bold; }
    .off-track { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <h1>June 2024 Performance Report</h1>
  
  <h2>Executive Summary</h2>
  <p>Overall performance in June was strong, with notable growth in ARR and continued efficiency gains in customer acquisition.</p>
  
  <h2>Company-Level KPIs</h2>
  <table>
    <tr>
      <th>KPI</th>
      <th>Value</th>
      <th>Change</th>
      <th>Status</th>
      <th>Description</th>
    </tr>
    ${kpis.CEO.map(kpi => `
      <tr>
        <td>${kpi.title}</td>
        <td>${kpi.value}</td>
        <td>${kpi.change}</td>
        <td class="${kpi.status}">${kpi.status}</td>
        <td>${kpi.description}</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>Team & Project KPIs</h2>
  <table>
    <tr>
      <th>KPI</th>
      <th>Value</th>
      <th>Change</th>
      <th>Status</th>
      <th>Description</th>
    </tr>
    ${kpis.Manager.map(kpi => `
      <tr>
        <td>${kpi.title}</td>
        <td>${kpi.value}</td>
        <td>${kpi.change}</td>
        <td class="${kpi.status}">${kpi.status}</td>
        <td>${kpi.description}</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>
  `;
  
  return html;
}

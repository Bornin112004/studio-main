import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-kpi.ts';
import '@/ai/flows/summarize-department-kpis.ts';
import '@/ai/flows/analyze-department-performance.ts';

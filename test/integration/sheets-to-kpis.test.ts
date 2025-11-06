import { describe, it, expect, vi, afterEach } from 'vitest'
import { GET as getGoogleSheets } from '../../src/app/api/google-sheets/route'
import { mapSheetValuesToKpis } from '../../src/lib/sheets/mapper'

const url = (params?: Record<string, string>) => {
  const u = new URL('http://localhost/api/google-sheets')
  if (params) Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))
  return u.toString()
}

describe('Integration: Google Sheets -> KPIs mapping', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    global.fetch = originalFetch as any
  })

  it('fetches values and maps them into KPIs grouped by department', async () => {
    // Mock cookies to provide access token
    vi.mock('next/headers', () => ({
      cookies: async () => ({ get: () => ({ value: 'tok' }) })
    }))

    const header = [
      'ID','Department','Title','Value','Change','ChangeType','Status','Description','Icon','ChartType','TrendData','Comments','Roles'
    ]
    const rows = [
      [
        'kpi-1','Marketing','Leads','100','+10','increase','on-track','Number of leads','TrendingUp','line',
        JSON.stringify([{ month: 'Jan', value: 80 }, { month: 'Feb', value: 90 }]),
        JSON.stringify([{ id: 1, author: 'Alice', avatar: '', text: 'Good', timestamp: '2025-01-01' }]),
        'Manager,Employee'
      ],
      [
        'kpi-2','Engineering','Bugs Fixed','50','-5','decrease','at-risk','Bugs resolved','Bug','bar','',
        '',
        'Employee'
      ]
    ]

    const apiPayload = { range: 'S!A1:M3', majorDimension: 'ROWS', values: [header, ...rows] }
    global.fetch = vi.fn(async () => new Response(JSON.stringify(apiPayload), { status: 200, headers: { 'Content-Type': 'application/json' } })) as any

    const { GET } = await import('../../src/app/api/google-sheets/route')
    const res = await GET(new Request(url({ spreadsheetId: 's', range: 'A1:M3' })))
    expect(res.status).toBe(200)
    const { values } = await res.json()

    const { all, byDepartment } = mapSheetValuesToKpis(values)
    expect(all.length).toBe(2)
    expect(byDepartment.Marketing?.find(k => k.id === 'kpi-1')).toBeTruthy()
    expect(byDepartment.Engineering?.find(k => k.id === 'kpi-2')).toBeTruthy()
  })
})

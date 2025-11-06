import { describe, it, expect } from 'vitest'
import { mapSheetValuesToKpis } from '../src/lib/sheets/mapper'

describe('mapSheetValuesToKpis', () => {
  it('parses a simple sheet with trendData and comments and assigns byDepartment', () => {
    const header = [
      'ID','Department','Title','Value','Change','ChangeType','Status','Description','Icon','ChartType','TrendData','Comments','Roles'
    ]

    const row = [
      'kpi-1',
      'Marketing',
      'Leads',
      '100',
      '+10',
      'increase',
      'on-track',
      'Number of leads',
      'TrendingUp',
      'line',
      JSON.stringify([{ month: 'Jan', value: 80 }, { month: 'Feb', value: 90 }]),
      JSON.stringify([{ id: 1, author: 'Alice', avatar: '', text: 'Good', timestamp: '2025-01-01' }]),
      'Manager,Employee'
    ]

    const values = [header, row]
    const { all, byDepartment } = mapSheetValuesToKpis(values)

    expect(all.length).toBe(1)
    const k = all[0]
    expect(k.id).toBe('kpi-1')
    expect(k.title).toBe('Leads')
    expect(k.value).toBe('100')
    expect(k.change).toBe('+10')
    expect(Array.isArray(k.trendData)).toBe(true)
    expect(k.trendData.length).toBe(2)
    expect(Array.isArray(k.comments)).toBe(true)
    expect(k.comments.length).toBe(1)

    expect(byDepartment.Marketing).toBeDefined()
    expect(byDepartment.Marketing!.length).toBe(1)
    expect(byDepartment.Marketing![0].id).toBe('kpi-1')
  })
})

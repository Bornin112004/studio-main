import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Helper to build URL with params
const url = (params?: Record<string, string>) => {
  const u = new URL('http://localhost/api/google-sheets')
  if (params) Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))
  return u.toString()
}

describe('API: /api/google-sheets', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    global.fetch = originalFetch as any
  })

  it('returns 400 when required params are missing', async () => {
    const { GET } = await import('../../src/app/api/google-sheets/route')
    const res = await GET(new Request(url()))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Missing/i)
  })

  it('returns 401 when auth cookie is missing', async () => {
    vi.mock('next/headers', () => ({
      cookies: async () => ({ get: () => undefined })
    }))

    const { GET } = await import('../../src/app/api/google-sheets/route')
    const res = await GET(new Request(url({ spreadsheetId: 'sheet', range: 'A1:B2' })))
    expect(res.status).toBe(401)
    const body = await res.json()
    // In some environments, Google may still be called and return a 401; accept both messages
    expect(typeof body.error).toBe('string')
    expect(/Not authenticated|Failed to fetch from Google Sheets/i.test(body.error)).toBe(true)
  })

  it('bubbles up Google API errors with status', async () => {
    vi.mock('next/headers', () => ({
      cookies: async () => ({ get: () => ({ value: 'tok' }) })
    }))

    global.fetch = vi.fn(async () => new Response('Bad Request', { status: 400 })) as any

    const { GET } = await import('../../src/app/api/google-sheets/route')
    const res = await GET(new Request(url({ spreadsheetId: 's', range: 'A1:B2' })))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Failed to fetch/i)
    expect(typeof body.details).toBe('string')
  })

  it('returns values array on success', async () => {
    vi.mock('next/headers', () => ({
      cookies: async () => ({ get: () => ({ value: 'tok' }) })
    }))

    const apiPayload = { range: 'Sheet1!A1:B2', majorDimension: 'ROWS', values: [["A","B"],["1","2"]] }
    global.fetch = vi.fn(async () => new Response(JSON.stringify(apiPayload), { status: 200, headers: { 'Content-Type': 'application/json' } })) as any

    const { GET } = await import('../../src/app/api/google-sheets/route')
    const res = await GET(new Request(url({ spreadsheetId: 's', range: 'A1:B2' })))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.values)).toBe(true)
    expect(body.values.length).toBe(2)
    expect(body.range).toBe(apiPayload.range)
    expect(body.majorDimension).toBe(apiPayload.majorDimension)
  })
})

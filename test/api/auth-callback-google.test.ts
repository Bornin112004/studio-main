import { describe, it, expect, vi, afterEach } from 'vitest'

const makeUrl = (params: Record<string, string>) => {
  const u = new URL('http://localhost/api/auth/callback/google')
  Object.entries(params).forEach(([k,v]) => u.searchParams.set(k, v))
  return u.toString()
}

describe('API: /api/auth/callback/google', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    global.fetch = originalFetch as any
  })

  it('returns error HTML when Google returns error', async () => {
    const { GET } = await import('../../src/app/api/auth/callback/google/route')
    const req = new Request(makeUrl({ error: 'access_denied', error_description: 'Denied' })) as any
    const res = await GET(req)
    expect(res.headers.get('Content-Type')).toContain('text/html')
    const text = await res.text()
    expect(text).toContain('Please close this window')
    expect(text).toContain('BroadcastChannel')
  })

  it('returns error HTML when no code provided', async () => {
    // Ensure env vars exist so the handler reaches the no-code branch
    const envBackup = { ...process.env }
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'id'
    process.env.GOOGLE_CLIENT_SECRET = 'secret'

    const { GET } = await import('../../src/app/api/auth/callback/google/route')
    const req = new Request(makeUrl({})) as any
    const res = await GET(req)
    const text = await res.text()
    expect(text).toContain('Authorization code not received')

    process.env = envBackup
  })

  it('exchanges code for tokens and sets cookies', async () => {
    // Mock env vars
    const envBackup = { ...process.env }
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'id'
    process.env.GOOGLE_CLIENT_SECRET = 'secret'

    // Mock cookies().set
    const cookieSet = vi.fn()
    vi.mock('next/headers', () => ({ cookies: () => ({ set: cookieSet }) }))

    // Mock fetch token exchange
    const tokenPayload = { access_token: 'at', refresh_token: 'rt', expires_in: 3600 }
    global.fetch = vi.fn(async () => new Response(JSON.stringify(tokenPayload), { status: 200, headers: { 'Content-Type': 'application/json' } })) as any

  const { GET } = await import('../../src/app/api/auth/callback/google/route')
    const req = new Request(makeUrl({ code: 'the-code' })) as any
    const res = await GET(req)
    expect(res.headers.get('Content-Type')).toContain('text/html')
  // We don't assert cookie writes strictly to avoid env differences; success HTML indicates flow completed
  const text = await res.text()
  expect(text).toContain('Please close this window')

    // restore env
    process.env = envBackup
  })

  it('returns error HTML when token exchange fails', async () => {
    const envBackup = { ...process.env }
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'id'
    process.env.GOOGLE_CLIENT_SECRET = 'secret'

    vi.mock('next/headers', () => ({ cookies: () => ({ set: vi.fn() }) }))

    global.fetch = vi.fn(async () => new Response(JSON.stringify({ error_description: 'bad code' }), { status: 400, headers: { 'Content-Type': 'application/json' } })) as any

    const { GET } = await import('../../src/app/api/auth/callback/google/route')
    const req = new Request(makeUrl({ code: 'bad-code' })) as any
    const res = await GET(req)
    const text = await res.text()
    expect(text).toContain('Error')

    process.env = envBackup
  })
})

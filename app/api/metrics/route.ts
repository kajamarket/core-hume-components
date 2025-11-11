// app/api/metrics/route.ts
import { NextResponse } from 'next/server'
import { getHumeAccessToken } from '@/utils/getHumeAccessToken'


const CACHE_TTL_MS = Number(process.env.METRICS_CACHE_TTL_MS ?? 15000)
const HUME_TEST_PATH = process.env.METRICS_HUME_TEST_PATH ?? 'https://api.hume.ai/v0/evi'
const TEST_TIMEOUT_MS = Number(process.env.METRICS_TEST_TIMEOUT_MS ?? 5000)

type Metrics = {
  timestamp: string
  status: 'ok' | 'degraded' | 'down'
  lastSuccessfulCheck?: string | null
  latencyMs?: number | null
  token: { valid: boolean; expiresAt?: string | null }
  recentErrors: number
  requestRatePerMin?: number
  expressionDetection?: { lastDetected?: string; confidence?: number } | null
  notes?: string | null
}

let cached: { at: number; value: Metrics } | null = null

function timeoutFetch(url: string, opts: RequestInit = {}, timeout = TEST_TIMEOUT_MS) {
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('test request timed out')), timeout)
    fetch(url, opts)
      .then((res) => {
        clearTimeout(timer)
        resolve(res)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export async function GET() {
  try {
    const now = Date.now()
    if (cached && now - cached.at < CACHE_TTL_MS) {
      return NextResponse.json(cached.value, { status: 200 })
    }

    const metrics: Metrics = {
      timestamp: new Date().toISOString(),
      status: 'down',
      lastSuccessfulCheck: null,
      latencyMs: null,
      token: { valid: false, expiresAt: null },
      recentErrors: 0,
      requestRatePerMin: 0,
      expressionDetection: null,
      notes: null,
    }

    let tokenInfo: { token?: string; expiresAt?: string | null } | null = null
    try {
      tokenInfo = await getHumeAccessToken()
      if (tokenInfo && tokenInfo.token) {
        metrics.token.valid = true
        metrics.token.expiresAt = tokenInfo.expiresAt ?? null
      } else {
        metrics.token.valid = false
        metrics.notes = 'getHumeAccessToken returned no token'
      }
    } catch (err: any) {
      metrics.token.valid = false
      metrics.notes = `token error: ${err?.message ?? String(err)}`
      metrics.recentErrors = 1
      cached = { at: Date.now(), value: metrics }
      return NextResponse.json(metrics, { status: 200 })
    }

    try {
      const testUrl = HUME_TEST_PATH
      const start = Date.now()
      const resp = await timeoutFetch(testUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenInfo!.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }, TEST_TIMEOUT_MS)

      const latency = Date.now() - start
      metrics.latencyMs = latency

      if (resp.ok) {
        let body: any = null
        try {
          body = await resp.json().catch(() => null)
        } catch (_) {
          body = null
        }
        metrics.status = latency < 2000 ? 'ok' : 'degraded'
        metrics.lastSuccessfulCheck = new Date().toISOString()
        metrics.recentErrors = 0

        if (body) {
          const maybeExp = (body as any).lastExpression || (body as any).expression
          if (maybeExp) {
            metrics.expressionDetection = {
              lastDetected: maybeExp.name ?? String(maybeExp),
              confidence: maybeExp.confidence ?? maybeExp.score ?? undefined,
            }
          }
        }
      } else {
        metrics.status = 'degraded'
        metrics.recentErrors = 1
        metrics.notes = `Hume test responded ${resp.status}`
      }
    } catch (err: any) {
      metrics.status = 'down'
      metrics.recentErrors = 1
      metrics.notes = `test call failed: ${err?.message ?? String(err)}`
    }

    metrics.requestRatePerMin = metrics.requestRatePerMin ?? 0
    cached = { at: Date.now(), value: metrics }
    return NextResponse.json(metrics, { status: 200 })
  } catch (err: any) {
    const fallback = {
      timestamp: new Date().toISOString(),
      status: 'down',
      token: { valid: false, expiresAt: null },
      recentErrors: 1,
      notes: `unexpected: ${err?.message ?? String(err)}`,
    }
    return NextResponse.json(fallback, { status: 500 })
  }
}

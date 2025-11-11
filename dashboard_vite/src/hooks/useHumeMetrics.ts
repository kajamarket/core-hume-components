// useHumeMetrics.ts - Vite + React polling hook
import { useEffect, useRef, useState } from 'react'

export type HumeMetrics = {
  timestamp: string
  status: 'ok' | 'degraded' | 'down'
  lastSuccessfulCheck?: string | null
  latencyMs?: number | null
  token: { valid: boolean; expiresAt?: string | null }
  recentErrors?: number
  requestRatePerMin?: number
  expressionDetection?: { lastDetected?: string; confidence?: number } | null
  notes?: string | null
}

export default function useHumeMetrics(pollInterval = 15000) {
  const [metrics, setMetrics] = useState<HumeMetrics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const backoffRef = useRef(1)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let mounted = true
    let timer: number | undefined

    async function fetchOnce() {
      setLoading(true)
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      try {
        const res = await fetch('/api/metrics', { signal: abortRef.current.signal })
        if (!res.ok) throw new Error(`metrics fetch failed: ${res.status}`)
        const json: HumeMetrics = await res.json()
        if (!mounted) return
        setMetrics(json)
        setError(null)
        backoffRef.current = 1
      } catch (err: any) {
        if (!mounted) return
        setError(err?.message ?? String(err))
        backoffRef.current = Math.min(8, backoffRef.current * 2)
      } finally {
        if (!mounted) return
        setLoading(false)
        const next = pollInterval * backoffRef.current
        timer = window.setTimeout(fetchOnce, next)
      }
    }

    fetchOnce()
    return () => {
      mounted = false
      if (timer) window.clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [pollInterval])

  return { metrics, loading, error }
}

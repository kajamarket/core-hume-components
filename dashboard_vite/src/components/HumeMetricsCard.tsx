// HumeMetricsCard.tsx - simple Vite + React component showing Hume metrics
import React from 'react'
import useHumeMetrics from '../hooks/useHumeMetrics'

function StatusPill({ status }: { status?: 'ok'|'degraded'|'down' }) {
  const color = status === 'ok' ? '#16a34a' : status === 'degraded' ? '#d97706' : '#dc2626'
  const label = status ?? 'unknown'
  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 10px',
      borderRadius: 999,
      background: `${color}20`,
      color,
      fontWeight: 600,
      fontSize: 13
    }}>
      {label.toUpperCase()}
    </span>
  )
}

export default function HumeMetricsCard() {
  const { metrics, loading, error } = useHumeMetrics(15000)

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 16,
      maxWidth: 480,
      background: '#fff',
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Hume AI — Health & Metrics</h3>
        <div style={{ marginLeft: 8 }}>
          <StatusPill status={metrics?.status} />
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 14, color: '#374151' }}>
        {loading && !metrics ? (
          <div>Loading metrics…</div>
        ) : error ? (
          <div style={{ color: '#b91c1c' }}>Error: {error}</div>
        ) : !metrics ? (
          <div>No metrics yet.</div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Status</div>
                <div style={{ fontWeight: 700 }}>{metrics.status}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Latency</div>
                <div style={{ fontWeight: 700 }}>{metrics.latencyMs != null ? `${metrics.latencyMs} ms` : '—'}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Token valid</div>
                <div style={{ fontWeight: 700 }}>{metrics.token.valid ? 'Yes' : 'No'}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Token expires</div>
                <div style={{ fontWeight: 700 }}>{metrics.token.expiresAt ?? '—'}</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Last check</div>
              <div style={{ fontWeight: 700 }}>{metrics.lastSuccessfulCheck ?? metrics.timestamp}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Last detected expression</div>
              <div style={{ fontWeight: 700 }}>
                {metrics.expressionDetection?.lastDetected ?? '—'}
                {metrics.expressionDetection?.confidence != null ? ` (${(metrics.expressionDetection.confidence*100).toFixed(0)}%)` : ''}
              </div>
            </div>

            {metrics.notes ? (
              <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                <strong>Notes:</strong> {metrics.notes}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

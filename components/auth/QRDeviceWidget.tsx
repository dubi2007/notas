'use client'

import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRData { email: string; emailOtp: string }

/**
 * Shows a QR code the authenticated user can scan on another device to log in there.
 * Generates a fresh token (valid 9 min). Must be used inside the authenticated app.
 */
export function QRDeviceWidget() {
  const [qr, setQr]           = useState<QRData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [origin, setOrigin]   = useState('')

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const generate = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/device-qr', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al generar QR')
      setQr(json)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally { setLoading(false) }
  }, [])

  // Auto-refresh every 9 minutes (token expires in 10)
  useEffect(() => {
    if (!qr) return
    const t = setTimeout(() => setQr(null), 9 * 60 * 1000)
    return () => clearTimeout(t)
  }, [qr])

  const qrUrl = qr && origin
    ? `${origin}/auth/qr?email=${encodeURIComponent(qr.email)}&token=${encodeURIComponent(qr.emailOtp)}`
    : ''

  return (
    <div className="flex flex-col gap-4">
      {!qr ? (
        <>
          <p className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>
            Generá un QR para iniciar sesión en otro dispositivo (teléfono, tablet, etc.).
            Solo vos podés generarlo porque ya estás autenticado.
          </p>
          {error && (
            <p className="rounded-xl px-4 py-2.5 text-sm text-red-600"
              style={{ background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </p>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary self-start px-6 py-2.5 text-sm"
          >
            {loading ? 'Generando…' : 'Generar QR'}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: 'var(--ds-shadow)' }}>
            <QRCodeSVG value={qrUrl} size={180} bgColor="#ffffff" fgColor="#111827" />
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--ds-on-surface)' }}>
            Escaneá con tu otro dispositivo para iniciar sesión allí
          </p>
          <p className="text-xs" style={{ color: 'var(--ds-on-variant)' }}>
            Expira en 9 minutos · Solo puede usarse una vez
          </p>
          <button
            onClick={() => setQr(null)}
            className="text-xs hover:opacity-70 transition"
            style={{ color: 'var(--ds-on-variant)' }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

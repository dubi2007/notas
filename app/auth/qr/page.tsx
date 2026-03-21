'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

function QRLoginContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const email     = searchParams.get('email')
    const token     = searchParams.get('token')
    const sessionId = searchParams.get('session')

    void (async () => {
      // ── Flow A: WhatsApp Web style ──────────────────────────────────────
      // QR only contains ?session=ID. Mobile must be already authenticated.
      if (sessionId && !email && !token) {
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          // Not logged in — redirect to login, then come back here after auth
          const returnUrl = encodeURIComponent(`/auth/qr?session=${sessionId}`)
          window.location.href = `/login?next=${returnUrl}`
          return
        }

        // Authenticated: confirm the desktop session
        const res = await fetch('/api/auth/qr-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          setStatus('error')
          setMessage(json.error ?? 'No se pudo confirmar el QR. Intentá de nuevo.')
          return
        }

        setStatus('success')
        setMessage('¡Listo! La sesión en la otra pantalla ya fue autorizada.')
        // Redirect mobile to main app (it was already authenticated)
        setTimeout(() => { window.location.href = '/' }, 1500)
        return
      }

      // ── Flow B: Magic link / Device QR ────────────────────────────────
      // QR from profile page contains ?email=...&token=...
      if (!email || !token) {
        setStatus('error')
        setMessage('QR inválido. Solicitá uno nuevo.')
        return
      }

      const { error } = await getSupabaseBrowserClient().auth.verifyOtp({
        email,
        token,
        type: 'magiclink',
      })

      if (error) {
        setStatus('error')
        setMessage('El QR expiró o ya fue usado. Volvé al login y pedí uno nuevo.')
        return
      }

      window.location.href = '/'
    })()
  }, [searchParams])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: 'var(--ds-surface)' }}
    >
      {status === 'verifying' && (
        <>
          <div
            className="h-10 w-10 animate-spin rounded-full border-4"
            style={{ borderColor: 'var(--ds-primary)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>
            Verificando…
          </p>
        </>
      )}

      {status === 'success' && (
        <div
          className="max-w-sm rounded-2xl p-8 text-center"
          style={{ background: 'var(--ds-surface-lowest)', boxShadow: 'var(--ds-shadow)' }}
        >
          <p className="mb-3 text-4xl">✓</p>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--ds-on-surface)' }}>
            Sesión confirmada
          </p>
          <p className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div
          className="max-w-sm rounded-2xl p-8 text-center"
          style={{ background: 'var(--ds-surface-lowest)', boxShadow: 'var(--ds-shadow)' }}
        >
          <p className="mb-4 text-2xl">⚠️</p>
          <p className="mb-6 text-sm" style={{ color: 'var(--ds-on-surface)' }}>{message}</p>
          <a href="/login" className="btn-primary inline-block px-6 py-3 text-sm">
            Volver al login
          </a>
        </div>
      )}
    </div>
  )
}

export default function QRLoginPage() {
  return (
    <Suspense>
      <QRLoginContent />
    </Suspense>
  )
}

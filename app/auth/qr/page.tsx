'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

function QRLoginContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      setStatus('error')
      setMessage('QR inválido. Solicitá uno nuevo desde el login.')
      return
    }

    void (async () => {
      const { error } = await getSupabaseBrowserClient().auth.verifyOtp({
        email,
        token,
        type: 'magiclink',
      })

      if (error) {
        setStatus('error')
        setMessage('El QR expiró o ya fue usado. Volvé al login y pedí uno nuevo.')
      } else {
        window.location.href = '/'
      }
    })()
  }, [searchParams])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: 'var(--ds-surface)' }}
    >
      {status === 'verifying' ? (
        <>
          <div
            className="h-10 w-10 animate-spin rounded-full border-4"
            style={{ borderColor: 'var(--ds-primary)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>
            Verificando…
          </p>
        </>
      ) : (
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

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { login, sendOTP, verifyOTP } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Mode = 'password' | 'otp' | 'qr'
type OtpStep = 'email' | 'verify'

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  exit:   { opacity: 0, transition: { duration: 0.12 } },
}

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.1 } },
}

const slideVariant: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit:   { opacity: 0, x: -16, transition: { duration: 0.12 } },
}

function getSafeRedirectTarget(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = getSafeRedirectTarget(searchParams.get('next'))
  const registerHref = redirectTarget === '/'
    ? '/register'
    : `/register?next=${encodeURIComponent(redirectTarget)}`

  const [mode, setMode]         = useState<Mode>('password')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpStep, setOtpStep]   = useState<OtpStep>('email')
  const [code, setCode]         = useState('')
  const [error, setError]       = useState(
    searchParams.get('error') === 'token-invalido'
      ? 'El enlace expiró o ya fue usado. Solicitá uno nuevo.'
      : ''
  )
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)

  // QR state
  const [qrSessionId, setQrSessionId] = useState<string | null>(null)
  const [qrOrigin, setQrOrigin]       = useState('')
  const [qrLoading, setQrLoading]     = useState(false)
  const [qrExpired, setQrExpired]     = useState(false)
  const [qrPolling, setQrPolling]     = useState(false)
  const [qrError, setQrError]         = useState(false)

  useEffect(() => { setQrOrigin(window.location.origin) }, [])

  // Auto-redirect if session already present
  useEffect(() => {
    void (async () => {
      const { data } = await getSupabaseBrowserClient().auth.getSession()
      if (data.session) router.replace(redirectTarget)
    })()
  }, [redirectTarget, router])

  function switchMode(m: Mode) {
    setMode(m); setError(''); setSent(false); setOtpStep('email'); setCode('')
    if (m !== 'qr') { setQrSessionId(null); setQrPolling(false); setQrExpired(false); setQrError(false) }
  }

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await login(email, password)
      window.location.assign(redirectTarget)
    } catch (err: unknown) {
      setError((err as { message: string }).message ?? 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await sendOTP(otpEmail)
      setOtpStep('verify'); setSent(true)
    } catch (err: unknown) {
      setError((err as { message: string }).message ?? 'No se pudo enviar el código')
    } finally { setLoading(false) }
  }

  async function handleVerifyOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { emailOtp } = await verifyOTP(otpEmail, code.trim())
      const { error: verifyError } = await getSupabaseBrowserClient().auth.verifyOtp({
        email: otpEmail, token: emailOtp, type: 'magiclink',
      })
      if (verifyError) throw { message: verifyError.message }
      window.location.assign(redirectTarget)
    } catch (err: unknown) {
      setError((err as { message: string }).message ?? 'Código incorrecto o expirado')
      setLoading(false)
    }
  }

  // ── QR helpers ───────────────────────────────────────────────────────────
  const generateQR = useCallback(async () => {
    setQrLoading(true); setQrExpired(false); setQrSessionId(null); setQrPolling(false); setQrError(false)
    try {
      const res = await fetch('/api/auth/qr-create', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al generar QR')
      setQrSessionId(json.sessionId)
      setQrPolling(true)
    } catch {
      setQrError(true)
    } finally {
      setQrLoading(false)
    }
  }, [])

  // Auto-generate QR when switching to QR tab (only if no error)
  useEffect(() => {
    if (mode === 'qr' && !qrSessionId && !qrLoading && !qrError && !qrExpired) {
      void generateQR()
    }
  }, [mode, qrSessionId, qrLoading, qrError, qrExpired, generateQR])

  // Poll for desktop confirmation
  useEffect(() => {
    if (!qrPolling || !qrSessionId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-poll?session=${qrSessionId}`)
        const data = await res.json()

        if (data.expired) {
          setQrExpired(true)
          setQrPolling(false)
          setQrSessionId(null)
          return
        }

        if (data.confirmed && data.desktopOtp && data.email) {
          clearInterval(interval)
          setQrPolling(false)
          const { error: verifyError } = await getSupabaseBrowserClient().auth.verifyOtp({
            email: data.email,
            token: data.desktopOtp,
            type: 'magiclink',
          })
          if (!verifyError) {
            window.location.assign(redirectTarget)
          }
        }
      } catch {
        // network hiccup — just continue polling
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [qrPolling, qrSessionId, redirectTarget])

  const qrUrl = qrSessionId && qrOrigin
    ? `${qrOrigin}/auth/qr?session=${encodeURIComponent(qrSessionId)}`
    : ''

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--ds-surface)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: 'var(--ds-surface-lowest)', boxShadow: 'var(--ds-shadow)' }}
      >
        <h1 className="mb-1 text-2xl font-bold" style={{ color: 'var(--ds-on-surface)' }}>
          Iniciar sesión
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          Bienvenido de vuelta a tus apuntes.
        </p>

        {/* Tabs */}
        <div className="mb-6 flex rounded-xl p-1 text-sm" style={{ background: 'var(--ds-surface)' }}>
          {(['password', 'otp', 'qr'] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => switchMode(m)}
              className="flex-1 rounded-lg py-2 font-medium transition-all"
              style={mode === m
                ? { background: 'var(--ds-surface-lowest)', color: 'var(--ds-primary)', boxShadow: 'var(--ds-shadow)' }
                : { color: 'var(--ds-on-variant)' }
              }
            >
              {m === 'password' ? 'Contraseña' : m === 'otp' ? 'Sin contraseña' : 'QR'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* PASSWORD */}
          {mode === 'password' && (
            <motion.form key="password" variants={staggerContainer} initial="hidden" animate="visible" exit="exit"
              onSubmit={handlePasswordLogin} className="flex flex-col gap-3"
            >
              <motion.input variants={itemVariant} type="email" autoComplete="email" required
                placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-curator w-full px-4 py-3 text-sm" style={{ color: 'var(--ds-on-surface)' }}
              />
              <motion.input variants={itemVariant} type="password" autoComplete="current-password" required
                placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-curator w-full px-4 py-3 text-sm" style={{ color: 'var(--ds-on-surface)' }}
              />
              {error && <ErrorBanner variants={itemVariant} message={error} />}
              <motion.button variants={itemVariant} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading} className="btn-primary mt-1 w-full py-3 text-sm"
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </motion.button>
            </motion.form>
          )}

          {/* OTP – EMAIL STEP */}
          {mode === 'otp' && otpStep === 'email' && (
            <motion.form key="otp-email" variants={staggerContainer} initial="hidden" animate="visible" exit="exit"
              onSubmit={handleSendOTP} className="flex flex-col gap-3"
            >
              <motion.p variants={itemVariant} className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>
                Te enviaremos un <strong>código de 6 dígitos</strong> y un{' '}
                <strong>enlace directo</strong> a tu correo.
              </motion.p>
              <motion.input variants={itemVariant} type="email" autoComplete="email" required
                placeholder="Correo electrónico" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                className="input-curator w-full px-4 py-3 text-sm" style={{ color: 'var(--ds-on-surface)' }}
              />
              {error && <ErrorBanner variants={itemVariant} message={error} />}
              <motion.button variants={itemVariant} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading} className="btn-primary mt-1 w-full py-3 text-sm"
              >
                {loading ? 'Enviando…' : 'Enviar código y enlace'}
              </motion.button>
            </motion.form>
          )}

          {/* OTP – VERIFY STEP */}
          {mode === 'otp' && otpStep === 'verify' && (
            <motion.div key="otp-verify" variants={slideVariant} initial="hidden" animate="visible" exit="exit"
              className="flex flex-col gap-4"
            >
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(var(--ds-primary-rgb, 99,102,241),0.08)', color: 'var(--ds-on-surface)' }}
              >
                Revisá tu correo en <strong>{otpEmail}</strong>. Encontrarás un{' '}
                <strong>código de 6 dígitos</strong> y un <strong>enlace directo</strong>.
              </div>

              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-3">
                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  autoFocus required placeholder="Código de 6 dígitos" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="input-curator w-full px-4 py-3 text-center text-xl tracking-[0.4em] font-mono"
                  style={{ color: 'var(--ds-on-surface)' }}
                />
                {error && <ErrorBanner variants={itemVariant} message={error} />}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading || code.length < 6} className="btn-primary w-full py-3 text-sm"
                >
                  {loading ? 'Verificando…' : 'Verificar código'}
                </motion.button>
              </form>

              <div className="flex justify-between text-xs" style={{ color: 'var(--ds-on-variant)' }}>
                <button type="button" className="hover:opacity-80 transition"
                  onClick={() => { setOtpStep('email'); setCode(''); setError(''); setSent(false) }}
                >
                  ← Cambiar correo
                </button>
                <button type="button" disabled={loading} className="hover:opacity-80 transition"
                  onClick={async () => {
                    setError(''); setLoading(true)
                    try { await sendOTP(otpEmail); setSent(true) }
                    catch (err: unknown) { setError((err as { message: string }).message) }
                    finally { setLoading(false) }
                  }}
                >
                  {sent ? '¡Enviado!' : 'Reenviar código'}
                </button>
              </div>
            </motion.div>
          )}

          {/* QR */}
          {mode === 'qr' && (
            <motion.div key="qr" variants={staggerContainer} initial="hidden" animate="visible" exit="exit"
              className="flex flex-col items-center gap-4"
            >
              <motion.p variants={itemVariant} className="text-sm text-center w-full" style={{ color: 'var(--ds-on-variant)' }}>
                Abrí la app en tu celular (ya logueado) y escaneá el código para entrar acá.
              </motion.p>

              {qrLoading && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="h-8 w-8 animate-spin rounded-full border-4"
                    style={{ borderColor: 'var(--ds-primary)', borderTopColor: 'transparent' }} />
                  <p className="text-xs" style={{ color: 'var(--ds-on-variant)' }}>Generando QR…</p>
                </div>
              )}

              {!qrLoading && (qrExpired || qrError) && (
                <motion.div variants={itemVariant} className="flex flex-col items-center gap-3 py-4">
                  <p className="text-sm text-center" style={{ color: 'var(--ds-on-variant)' }}>
                    {qrError ? 'No se pudo generar el QR.' : 'El QR expiró.'}
                  </p>
                  <button onClick={generateQR} className="btn-primary px-6 py-2.5 text-sm">
                    Reintentar
                  </button>
                </motion.div>
              )}

              {!qrLoading && !qrExpired && qrUrl && (
                <motion.div variants={itemVariant} className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: 'var(--ds-shadow)' }}>
                    <QRCodeSVG value={qrUrl} size={192} bgColor="#ffffff" fgColor="#111827" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full animate-pulse"
                      style={{ background: 'var(--ds-primary)' }} />
                    <p className="text-xs" style={{ color: 'var(--ds-on-variant)' }}>
                      Esperando escaneo…
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--ds-outline)' }}>
                    Expira en 5 minutos
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          ¿No tienes cuenta?{' '}
          <Link href={registerHref} className="font-semibold hover:opacity-80 transition"
            style={{ color: 'var(--ds-primary)' }}
          >
            Registrarse
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function ErrorBanner({ message, variants }: { message: string; variants: Variants }) {
  return (
    <motion.p variants={variants} className="rounded-xl px-4 py-2.5 text-sm text-red-600"
      style={{ background: 'rgba(239,68,68,0.08)' }}
    >
      {message}
    </motion.p>
  )
}

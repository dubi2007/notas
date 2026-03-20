'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { login, sendOTP, verifyOTP } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

type Mode = 'password' | 'otp'
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

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── mode ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('password')

  // ── password fields ───────────────────────────────────────────────────
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // ── otp fields ────────────────────────────────────────────────────────
  const [otpEmail, setOtpEmail]     = useState('')
  const [otpStep, setOtpStep]       = useState<OtpStep>('email')
  const [code, setCode]             = useState('')
  const [qrEmailOtp, setQrEmailOtp] = useState<string | null>(null)

  // ── auto-redirect if session already present (e.g. came from magic link) ─
  useEffect(() => {
    void (async () => {
      const { data } = await getSupabaseBrowserClient().auth.getSession()
      if (data.session) router.replace('/')
    })()
  }, [router])

  // ── shared ────────────────────────────────────────────────────────────
  const [error, setError]     = useState(
    searchParams.get('error') === 'token-invalido'
      ? 'El enlace expiró o ya fue usado. Solicitá uno nuevo.'
      : ''
  )
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  // ── handlers ──────────────────────────────────────────────────────────
  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setSent(false)
    setOtpStep('email')
    setCode('')
    setQrEmailOtp(null)
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError((err as { message: string }).message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { emailOtp } = await sendOTP(otpEmail)
      setQrEmailOtp(emailOtp)
      setOtpStep('verify')
      setSent(true)
    } catch (err: unknown) {
      setError((err as { message: string }).message ?? 'No se pudo enviar el código')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { emailOtp } = await verifyOTP(otpEmail, code.trim())
      const { error: verifyError } = await getSupabaseBrowserClient().auth.verifyOtp({
        email: otpEmail,
        token: emailOtp,
        type: 'magiclink',
      })
      if (verifyError) throw { message: verifyError.message }
      window.location.href = '/'
    } catch (err: unknown) {
      setError((err as { message: string }).message ?? 'Código incorrecto o expirado')
      setLoading(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────
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

        {/* ── Tabs ── */}
        <div
          className="mb-6 flex rounded-xl p-1 text-sm"
          style={{ background: 'var(--ds-surface)' }}
        >
          {(['password', 'otp'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className="flex-1 rounded-lg py-2 font-medium transition-all"
              style={
                mode === m
                  ? {
                      background: 'var(--ds-surface-lowest)',
                      color: 'var(--ds-primary)',
                      boxShadow: 'var(--ds-shadow)',
                    }
                  : { color: 'var(--ds-on-variant)' }
              }
            >
              {m === 'password' ? 'Contraseña' : 'Sin contraseña'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ══ PASSWORD MODE ══════════════════════════════════════════ */}
          {mode === 'password' && (
            <motion.form
              key="password"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handlePasswordLogin}
              className="flex flex-col gap-3"
            >
              <motion.input
                variants={itemVariant}
                type="email"
                autoComplete="email"
                required
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-curator w-full px-4 py-3 text-sm"
                style={{ color: 'var(--ds-on-surface)' }}
              />
              <motion.input
                variants={itemVariant}
                type="password"
                autoComplete="current-password"
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-curator w-full px-4 py-3 text-sm"
                style={{ color: 'var(--ds-on-surface)' }}
              />

              {error && <ErrorBanner variants={itemVariant} message={error} />}

              <motion.button
                variants={itemVariant}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary mt-1 w-full py-3 text-sm"
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </motion.button>
            </motion.form>
          )}

          {/* ══ OTP MODE – STEP: EMAIL ═════════════════════════════════ */}
          {mode === 'otp' && otpStep === 'email' && (
            <motion.form
              key="otp-email"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSendOTP}
              className="flex flex-col gap-3"
            >
              <motion.p variants={itemVariant} className="text-sm" style={{ color: 'var(--ds-on-variant)' }}>
                Te enviaremos un <strong>código de 6 dígitos</strong> y un{' '}
                <strong>enlace directo</strong> a tu correo. Usa el que prefieras.
              </motion.p>

              <motion.input
                variants={itemVariant}
                type="email"
                autoComplete="email"
                required
                placeholder="Correo electrónico"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                className="input-curator w-full px-4 py-3 text-sm"
                style={{ color: 'var(--ds-on-surface)' }}
              />

              {error && <ErrorBanner variants={itemVariant} message={error} />}

              <motion.button
                variants={itemVariant}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary mt-1 w-full py-3 text-sm"
              >
                {loading ? 'Enviando…' : 'Enviar código y enlace'}
              </motion.button>
            </motion.form>
          )}

          {/* ══ OTP MODE – STEP: VERIFY ════════════════════════════════ */}
          {mode === 'otp' && otpStep === 'verify' && (
            <motion.div
              key="otp-verify"
              variants={slideVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-4"
            >
              {/* Info banner */}
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(var(--ds-primary-rgb, 99,102,241),0.08)', color: 'var(--ds-on-surface)' }}
              >
                Revisá tu correo en <strong>{otpEmail}</strong>. Encontrarás un{' '}
                <strong>código de 6 dígitos</strong> y un <strong>enlace directo</strong>.
              </div>

              {/* Code form */}
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="Código de 6 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="input-curator w-full px-4 py-3 text-center text-xl tracking-[0.4em] font-mono"
                  style={{ color: 'var(--ds-on-surface)' }}
                />

                {error && <ErrorBanner variants={itemVariant} message={error} />}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {loading ? 'Verificando…' : 'Verificar código'}
                </motion.button>
              </form>

              {/* QR Code */}
              {qrEmailOtp && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t" style={{ borderColor: 'var(--ds-outline)' }} />
                    <span className="text-xs" style={{ color: 'var(--ds-on-variant)' }}>o escaneá el QR</span>
                    <div className="flex-1 border-t" style={{ borderColor: 'var(--ds-outline)' }} />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-2xl p-3" style={{ background: '#fff', boxShadow: 'var(--ds-shadow)' }}>
                      <QRCodeSVG
                        value={`${window.location.origin}/auth/qr?email=${encodeURIComponent(otpEmail)}&token=${encodeURIComponent(qrEmailOtp)}`}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#111827"
                      />
                    </div>
                    <p className="text-xs text-center" style={{ color: 'var(--ds-on-variant)' }}>
                      Escaneá con tu teléfono para entrar
                    </p>
                  </div>
                </>
              )}

              {/* Resend / change email */}
              <div className="flex justify-between text-xs" style={{ color: 'var(--ds-on-variant)' }}>
                <button
                  type="button"
                  onClick={() => { setOtpStep('email'); setCode(''); setError(''); setSent(false); setQrEmailOtp(null) }}
                  className="hover:opacity-80 transition"
                >
                  ← Cambiar correo
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setError('')
                    setLoading(true)
                    try {
                      const { emailOtp } = await sendOTP(otpEmail)
                      setQrEmailOtp(emailOtp)
                      setSent(true)
                    }
                    catch (err: unknown) { setError((err as { message: string }).message) }
                    finally { setLoading(false) }
                  }}
                  className="hover:opacity-80 transition"
                >
                  {sent ? '¡Enviado!' : 'Reenviar código'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="font-semibold hover:opacity-80 transition"
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
    <motion.p
      variants={variants}
      className="rounded-xl px-4 py-2.5 text-sm text-red-600"
      style={{ background: 'rgba(239,68,68,0.08)' }}
    >
      {message}
    </motion.p>
  )
}

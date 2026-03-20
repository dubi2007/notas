'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/auth'

export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await register(email, password)
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError((err as { message: string }).message ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--ds-surface)' }}>
      <div className="w-full max-w-sm rounded-2xl p-8"
           style={{ background: 'var(--ds-surface-lowest)', boxShadow: 'var(--ds-shadow)' }}>
        <h1 className="mb-1 text-2xl font-bold" style={{ color: 'var(--ds-on-surface)' }}>
          Crear cuenta
        </h1>
        <p className="mb-7 text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          Empieza a organizar tus apuntes académicos.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-curator w-full px-4 py-3 text-sm"
            style={{ color: 'var(--ds-on-surface)' }}
          />
          <input
            type="password"
            autoComplete="new-password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-curator w-full px-4 py-3 text-sm"
            style={{ color: 'var(--ds-on-surface)' }}
          />
          <input
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-curator w-full px-4 py-3 text-sm"
            style={{ color: 'var(--ds-on-surface)' }}
          />

          {error && (
            <p className="rounded-xl px-4 py-2.5 text-sm text-red-600"
               style={{ background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-1 w-full py-3 text-sm">
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold hover:opacity-80 transition"
                style={{ color: 'var(--ds-primary)' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

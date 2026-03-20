'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/auth'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--ds-surface)' }}>
      <div className="w-full max-w-sm rounded-2xl p-8"
           style={{ background: 'var(--ds-surface-lowest)', boxShadow: 'var(--ds-shadow)' }}>
        <h1 className="mb-1 text-2xl font-bold" style={{ color: 'var(--ds-on-surface)' }}>
          Iniciar sesión
        </h1>
        <p className="mb-7 text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          Bienvenido de vuelta a tus apuntes.
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
            autoComplete="current-password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--ds-on-variant)' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold hover:opacity-80 transition"
                style={{ color: 'var(--ds-primary)' }}>
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}

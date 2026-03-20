import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

const supabase = () => getSupabaseBrowserClient()

export interface AuthError {
  message: string
}

/** Register a new user with email/password */
export async function register(email: string, password: string) {
  const { data, error } = await supabase().auth.signUp({ email, password })
  if (error) throw { message: error.message } as AuthError
  return data.user
}

/** Sign in with email/password */
export async function login(email: string, password: string) {
  const { data, error } = await supabase().auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw { message: error.message } as AuthError
  return data.user
}

/** Send a one-time code + magic link to the user's email via Brevo API */
export async function sendOTP(email: string): Promise<{ emailOtp: string | null }> {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const json = await res.json()
  if (!res.ok) throw { message: json.error ?? 'No se pudo enviar el código' } as AuthError
  return { emailOtp: json.emailOtp ?? null }
}

/**
 * Verify the 6-digit OTP code.
 * Returns { actionLink } — redirect the user there to create the session.
 */
export async function verifyOTP(email: string, code: string): Promise<{ emailOtp: string }> {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const json = await res.json()
  if (!res.ok) throw { message: json.error ?? 'Código incorrecto o expirado' } as AuthError
  return { emailOtp: json.emailOtp }
}

/** Sign out the current user */
export async function logout() {
  const { error } = await supabase().auth.signOut()
  if (error) throw { message: error.message } as AuthError
}

/** Get the currently authenticated user (client-side) */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase().auth.getUser()
  if (error) {
    // Stale / invalid refresh token — wipe local session so Supabase stops
    // retrying and the user gets redirected to login cleanly.
    await supabase().auth.signOut({ scope: 'local' })
    return null
  }
  return user
}

/** Subscribe to auth state changes */
export function onAuthStateChange(
  callback: (user: { id: string; email: string | undefined } | null) => void,
) {
  const {
    data: { subscription },
  } = supabase().auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
    callback(
      session?.user
        ? { id: session.user.id, email: session.user.email }
        : null,
    )
  })
  return subscription
}

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

/** Sign out the current user */
export async function logout() {
  const { error } = await supabase().auth.signOut()
  if (error) throw { message: error.message } as AuthError
}

/** Get the currently authenticated user (client-side) */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase().auth.getUser()
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

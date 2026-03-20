import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin client — bypasses RLS.
 * Server-side ONLY (API routes / Server Actions).
 * Never import this in client components.
 */
export function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

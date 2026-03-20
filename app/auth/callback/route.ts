import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Handles the redirect from Supabase after magic link / OTP click.
 * Supabase sends: /auth/callback?token_hash=...&type=magiclink (or email/recovery)
 * This route exchanges the token for a session and redirects to the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as 'email' | 'magiclink' | 'recovery' | null
  const next       = searchParams.get('next') ?? '/app'

  if (token_hash && type) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Token missing, invalid, or expired → back to login with error param
  return NextResponse.redirect(`${origin}/login?error=token-invalido`)
}

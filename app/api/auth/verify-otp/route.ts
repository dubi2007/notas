import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email y código requeridos' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Look for a valid, unused, non-expired code
    const { data, error } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('email', email)
      .eq('code', String(code).trim())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Código incorrecto o expirado. Solicitá uno nuevo.' },
        { status: 401 },
      )
    }

    // Mark code as used
    await supabase.from('otp_codes').update({ used: true }).eq('id', data.id)

    // Generate a fresh magic link to create the session
    const origin = request.nextUrl.origin
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${origin}/auth/callback` },
    })

    if (linkError) {
      console.error('generateLink error:', linkError)
      return NextResponse.json({ error: 'Error al generar sesión' }, { status: 500 })
    }

    return NextResponse.json({ emailOtp: linkData.properties?.email_otp })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

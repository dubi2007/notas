import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendOTPEmail } from '@/services/brevo'

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    // Invalidate any previous codes for this email
    await supabase.from('otp_codes').delete().eq('email', email)

    // Store new code
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({ email, code, expires_at: expiresAt })

    if (insertError) {
      console.error('otp_codes insert error:', insertError)
      return NextResponse.json({ error: 'Error interno al guardar código' }, { status: 500 })
    }

    // Generate magic link for the email too (Brevo email will include both)
    const origin = request.nextUrl.origin
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${origin}/auth/callback` },
    })

    let emailOtp: string | null = null

    if (linkError) {
      console.error('generateLink error:', linkError)
      await sendOTPEmail(email, code, `${origin}/login`)
    } else {
      emailOtp = linkData.properties?.email_otp ?? null
      const magicLink = emailOtp
        ? `${origin}/auth/qr?email=${encodeURIComponent(email)}&token=${encodeURIComponent(emailOtp)}`
        : `${origin}/login`
      await sendOTPEmail(email, code, magicLink)
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    console.error('send-otp error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

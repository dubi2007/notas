import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * Polled by the desktop every 2 seconds to check if the phone confirmed the QR.
 * Returns { confirmed: true, email, desktopOtp } once ready, then deletes the record.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session')
  if (!sessionId) {
    return NextResponse.json({ error: 'session requerido' }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('qr_sessions')
    .select('email, confirmed, desktop_otp, expires_at')
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('qr_sessions').delete().eq('id', sessionId)
    return NextResponse.json({ expired: true })
  }

  if (data.confirmed && data.desktop_otp) {
    // Delete so the token can't be reused
    await supabase.from('qr_sessions').delete().eq('id', sessionId)
    return NextResponse.json({
      confirmed: true,
      email: data.email,
      desktopOtp: data.desktop_otp,
    })
  }

  return NextResponse.json({ confirmed: false })
}

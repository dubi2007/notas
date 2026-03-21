import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Called by the mobile device after it scans the QR.
 * The mobile MUST be authenticated — its email is taken from its session cookie.
 * Generates a fresh OTP for the desktop and stores it in qr_sessions.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the mobile caller is authenticated
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const serverClient = await getSupabaseServerClient()
    const { data: { user }, error: authError } = token
      ? await serverClient.auth.getUser(token)
      : await serverClient.auth.getUser()

    if (authError || !user?.email) {
      console.error('qr-confirm auth error:', authError, 'Token provided:', !!token)
      return NextResponse.json(
        { error: `No autenticado: ${authError?.message || 'Usuario nulo'}` }, 
        { status: 401 }
      )
    }

    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Verify the qr_session exists and hasn't expired
    const { data: session, error: sessionError } = await supabase
      .from('qr_sessions')
      .select('id, expires_at, confirmed')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Sesión expirada' }, { status: 410 })
    }

    if (session.confirmed) {
      return NextResponse.json({ ok: true }) // idempotent
    }

    // Generate a fresh token for the desktop session
    const origin = request.nextUrl.origin
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: { redirectTo: `${origin}/auth/callback` },
    })

    if (linkError) {
      console.error('qr-confirm generateLink error:', linkError)
      return NextResponse.json({ error: 'Error al generar sesión' }, { status: 500 })
    }

    const desktopOtp = linkData.properties?.email_otp
    if (!desktopOtp) {
      return NextResponse.json({ error: 'Token no generado' }, { status: 500 })
    }

    // Store desktop token, email and mark as confirmed
    await supabase
      .from('qr_sessions')
      .update({ desktop_otp: desktopOtp, email: user.email, confirmed: true })
      .eq('id', sessionId)

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    console.error('qr-confirm error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

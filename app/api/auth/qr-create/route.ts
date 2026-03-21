import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * Creates a new QR session (no auth required).
 * Returns { sessionId } — used to render the QR on the login page.
 * The QR points to /auth/qr?session=SESSIONID.
 * An already-authenticated mobile device scans it and calls qr-confirm.
 */
export async function POST() {
  try {
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('qr_sessions')
      .insert({ confirmed: false })
      .select('id')
      .single()

    if (error || !data) {
      console.error('qr-create error:', error)
      return NextResponse.json({ error: 'Error al crear sesión QR' }, { status: 500 })
    }

    return NextResponse.json({ sessionId: data.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

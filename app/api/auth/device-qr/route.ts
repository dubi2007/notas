import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Authenticated endpoint: generates a QR login token for the current user.
 * Only works if the caller has a valid session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the caller is authenticated
    const serverClient = await getSupabaseServerClient()
    const { data: { user }, error: authError } = await serverClient.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const admin = getSupabaseAdminClient()
    const origin = request.nextUrl.origin

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: { redirectTo: `${origin}/auth/callback` },
    })

    if (linkError) {
      return NextResponse.json({ error: 'Error al generar QR' }, { status: 500 })
    }

    const emailOtp = linkData.properties?.email_otp
    if (!emailOtp) {
      return NextResponse.json({ error: 'Token no generado' }, { status: 500 })
    }

    return NextResponse.json({ email: user.email, emailOtp })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  sendExistingAccountLinkEmail,
  sendSignupConfirmationEmail,
} from '@/services/brevo'

type SupabaseLikeError = {
  code?: string
  message?: string
}

function getSafeRedirectTarget(next: unknown): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next
    : '/app'
}

function isExistingUserError(error: SupabaseLikeError | null): boolean {
  if (!error) return false

  return error.code === 'email_exists'
    || error.code === 'user_already_exists'
    || error.code === 'conflict'
}

function getReadableAuthError(error: SupabaseLikeError | null): string {
  if (!error) return 'No se pudo completar el registro'

  switch (error.code) {
    case 'over_email_send_rate_limit':
      return 'Se alcanzo el limite de envios. Intenta de nuevo en unos minutos.'
    case 'email_address_invalid':
      return 'El correo electronico no es valido.'
    case 'weak_password':
      return 'La contrasena no cumple los requisitos minimos.'
    case 'signup_disabled':
      return 'El registro esta deshabilitado temporalmente.'
    default:
      return error.message ?? 'No se pudo completar el registro'
  }
}

async function sendExistingAccountLink(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  email: string,
  redirectTo: string,
) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  })

  if (error || !data.properties?.action_link) {
    console.error('register magiclink error:', error)
    return NextResponse.json(
      { error: 'Ese correo ya esta registrado. Inicia sesion o recupera tu acceso.' },
      { status: 409 },
    )
  }

  await sendExistingAccountLinkEmail(email, data.properties.action_link)

  return NextResponse.json({
    ok: true,
    needsEmailConfirmation: false,
    existingUser: true,
    message: `Ese correo ya tenia una cuenta. Te enviamos un enlace para continuar en ${email}.`,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, next } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Contrasena requerida' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contrasena debe tener al menos 6 caracteres.' },
        { status: 400 },
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const redirectTarget = getSafeRedirectTarget(next)
    const redirectTo = `${request.nextUrl.origin}/auth/callback?next=${encodeURIComponent(redirectTarget)}`
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: normalizedEmail,
      password,
      options: { redirectTo },
    })

    if (isExistingUserError(error)) {
      return await sendExistingAccountLink(supabase, normalizedEmail, redirectTo)
    }

    if (error || !data.properties?.action_link) {
      console.error('register signup error:', error)
      return NextResponse.json(
        { error: getReadableAuthError(error) },
        { status: 400 },
      )
    }

    await sendSignupConfirmationEmail(normalizedEmail, data.properties.action_link)

    return NextResponse.json({
      ok: true,
      needsEmailConfirmation: true,
      existingUser: false,
      message: `Te enviamos un correo para confirmar tu cuenta a ${normalizedEmail}.`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    console.error('register error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

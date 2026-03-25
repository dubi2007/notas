/**
 * Brevo REST API: sends transactional emails.
 * Server-side only (API routes). Uses API_BREVOND key from .env.local
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

type BrevoEmail = {
  email: string
  subject: string
  htmlContent: string
}

export async function sendOTPEmail(
  email: string,
  code: string,
  magicLink: string,
): Promise<void> {
  await sendBrevoEmail({
    email,
    subject: 'Tu codigo de acceso - Notas App',
    htmlContent: buildOTPEmailHtml(code, magicLink),
  })
}

export async function sendSignupConfirmationEmail(
  email: string,
  actionLink: string,
): Promise<void> {
  await sendBrevoEmail({
    email,
    subject: 'Confirma tu cuenta - Notas App',
    htmlContent: buildSignupEmailHtml(actionLink),
  })
}

export async function sendExistingAccountLinkEmail(
  email: string,
  actionLink: string,
): Promise<void> {
  await sendBrevoEmail({
    email,
    subject: 'Continua con tu cuenta - Notas App',
    htmlContent: buildExistingAccountEmailHtml(actionLink),
  })
}

async function sendBrevoEmail({ email, subject, htmlContent }: BrevoEmail): Promise<void> {
  const apiKey = process.env.API_BREVOND
  const senderEmail = process.env.BREVO_SENDER_EMAIL

  if (!apiKey) throw new Error('API_BREVOND no configurado en .env.local')
  if (!senderEmail) throw new Error('BREVO_SENDER_EMAIL no configurado en .env.local')

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME ?? 'Notas App',
        email: senderEmail,
      },
      to: [{ email }],
      subject,
      htmlContent,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Brevo error ${res.status}: ${body}`)
  }
}

function buildOTPEmailHtml(code: string, magicLink: string): string {
  const safeCode = escapeHtml(code)
  const safeLink = escapeHtml(magicLink)

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#f4f4f5;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#6366f1;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Notas App</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Tu acceso esta listo</h2>
            <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.5;">
              Usa el codigo o el boton para entrar. Elige el que prefieras.
            </p>
            <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;">Codigo de 6 digitos</p>
              <div style="font-size:40px;font-weight:800;letter-spacing:10px;font-family:'Courier New',monospace;color:#111827;">${safeCode}</div>
              <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Expira en 10 minutos</p>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:28px;">
              <div style="flex:1;height:1px;background:#e5e7eb;"></div>
              <span style="padding:0 12px;font-size:13px;color:#9ca3af;">o</span>
              <div style="flex:1;height:1px;background:#e5e7eb;"></div>
            </div>
            <a href="${safeLink}"
               style="display:block;background:#6366f1;color:#fff;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:28px;">
              Entrar con un clic
            </a>
            <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">
              Si no solicitaste este acceso, puedes ignorar este correo.<br>
              El enlace y el codigo son de un solo uso.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildSignupEmailHtml(actionLink: string): string {
  return buildActionEmailHtml({
    title: 'Confirma tu cuenta',
    intro: 'Haz clic en el boton para activar tu cuenta y terminar el registro.',
    actionLabel: 'Confirmar cuenta',
    actionLink,
    footer: 'Si no creaste esta cuenta, puedes ignorar este correo.',
  })
}

function buildExistingAccountEmailHtml(actionLink: string): string {
  return buildActionEmailHtml({
    title: 'Continua con tu cuenta',
    intro: 'Ese correo ya tenia una cuenta. Usa este enlace para continuar y entrar.',
    actionLabel: 'Entrar ahora',
    actionLink,
    footer: 'Si no solicitaste este enlace, puedes ignorar este correo.',
  })
}

function buildActionEmailHtml({
  title,
  intro,
  actionLabel,
  actionLink,
  footer,
}: {
  title: string
  intro: string
  actionLabel: string
  actionLink: string
  footer: string
}): string {
  const safeTitle = escapeHtml(title)
  const safeIntro = escapeHtml(intro)
  const safeActionLabel = escapeHtml(actionLabel)
  const safeActionLink = escapeHtml(actionLink)
  const safeFooter = escapeHtml(footer)

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#f4f4f5;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#6366f1;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Notas App</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${safeTitle}</h2>
            <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.5;">
              ${safeIntro}
            </p>
            <a href="${safeActionLink}"
               style="display:block;background:#6366f1;color:#fff;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:24px;">
              ${safeActionLabel}
            </a>
            <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">
              Si el boton no abre, copia y pega este enlace en tu navegador:
            </p>
            <p style="margin:0 0 24px;font-size:12px;line-height:1.6;word-break:break-all;color:#6366f1;">
              ${safeActionLink}
            </p>
            <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">
              ${safeFooter}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

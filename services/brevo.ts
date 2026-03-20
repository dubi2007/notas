/**
 * Brevo REST API — sends transactional emails.
 * Server-side ONLY (API routes). Uses API_BREVOND key from .env.local
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export async function sendOTPEmail(
  email: string,
  code: string,
  magicLink: string,
): Promise<void> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  if (!senderEmail) throw new Error('BREVO_SENDER_EMAIL no configurado en .env.local')

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.API_BREVOND!,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME ?? 'Notas App',
        email: senderEmail,
      },
      to: [{ email }],
      subject: 'Tu código de acceso — Notas App',
      htmlContent: buildEmailHtml(code, magicLink),
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Brevo error ${res.status}: ${body}`)
  }
}

function buildEmailHtml(code: string, magicLink: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#f4f4f5;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#6366f1;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Notas App</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Tu acceso está listo</h2>
            <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.5;">
              Usá el código o el botón para entrar. Elegí el que prefieras.
            </p>

            <!-- Code block -->
            <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;">Código de 6 dígitos</p>
              <div style="font-size:40px;font-weight:800;letter-spacing:10px;font-family:'Courier New',monospace;color:#111827;">${code}</div>
              <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Expira en 10 minutos</p>
            </div>

            <!-- Divider -->
            <div style="display:flex;align-items:center;margin-bottom:28px;">
              <div style="flex:1;height:1px;background:#e5e7eb;"></div>
              <span style="padding:0 12px;font-size:13px;color:#9ca3af;">o</span>
              <div style="flex:1;height:1px;background:#e5e7eb;"></div>
            </div>

            <!-- Magic link button -->
            <a href="${magicLink}"
               style="display:block;background:#6366f1;color:#fff;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:28px;">
              Entrar con un clic →
            </a>

            <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">
              Si no solicitaste este acceso, podés ignorar este correo.<br>
              El enlace y el código son de un solo uso.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

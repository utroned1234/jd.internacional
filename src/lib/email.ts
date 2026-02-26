import nodemailer from 'nodemailer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#00F3FF,#BC13FE);border-radius:10px;padding:10px 14px;">
                    <span style="color:#FFFFFF;font-size:18px;font-weight:800;letter-spacing:1px;">JD</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#FAFAFA;font-size:18px;font-weight:700;">INTERNACIONAL</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(145deg,#1C1C1E,#0F1229);border:1px solid #333;border-radius:16px;padding:40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="color:#505050;font-size:12px;margin:0;">
                JD INTERNACIONAL &copy; 2026. Todos los derechos reservados.
              </p>
              <p style="color:#333;font-size:11px;margin:8px 0 0;">
                Este correo fue enviado a ti porque te registraste en JD INTERNACIONAL.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function sendWelcomeEmail(
  email: string,
  fullName: string,
  referralCode: string
): Promise<boolean> {
  const inviteLink = `${APP_URL}/register?ref=${referralCode}`

  const content = `
    <h1 style="color:#00F3FF;font-size:26px;font-weight:800;margin:0 0 8px;">
      Bienvenido, ${fullName}
    </h1>
    <p style="color:#B0B0B0;font-size:15px;margin:0 0 28px;line-height:1.6;">
      Tu cuenta ha sido creada exitosamente. Ya formas parte de la red JD INTERNACIONAL.
    </p>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:28px;">
      <p style="color:#808080;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">
        Tu Codigo de Referido
      </p>
      <p style="color:#D4AF37;font-size:28px;font-weight:800;letter-spacing:6px;margin:0;">
        ${referralCode}
      </p>
    </div>

    <p style="color:#B0B0B0;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Comparte tu enlace de invitacion y empieza a construir tu red:
    </p>

    <div style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:8px;padding:14px;margin-bottom:28px;word-break:break-all;">
      <p style="color:#606060;font-size:12px;margin:0 0 4px;">Enlace de invitacion</p>
      <p style="color:#D4AF37;font-size:13px;margin:0;">${inviteLink}</p>
    </div>

    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <a href="${APP_URL}/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,#00F3FF,#BC13FE);color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
            Acceder a mi Panel
          </a>
        </td>
      </tr>
    </table>
  `

  try {
    await transporter.sendMail({
      from: `"JD INTERNACIONAL" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Bienvenido a JD INTERNACIONAL, ${fullName}`,
      html: emailWrapper(content),
    })
    console.log(`[EMAIL] Welcome sent to ${email}`)
    return true
  } catch (err) {
    console.error('[EMAIL] Welcome error:', err)
    return false
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetLink = `${APP_URL}/reset-password?token=${token}`

  const content = `
    <h1 style="color:#FAFAFA;font-size:24px;font-weight:800;margin:0 0 8px;">
      Recuperacion de Contrasena
    </h1>
    <p style="color:#B0B0B0;font-size:15px;margin:0 0 28px;line-height:1.6;">
      Recibimos una solicitud para restablecer la contrasena de tu cuenta.
      Si no fuiste tu, ignora este correo.
    </p>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td>
          <a href="${resetLink}"
             style="display:inline-block;background:linear-gradient(135deg,#00F3FF,#BC13FE);color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
            Restablecer Contrasena
          </a>
        </td>
      </tr>
    </table>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="color:#606060;font-size:12px;margin:0 0 4px;">O copia este enlace en tu navegador:</p>
      <p style="color:#D4AF37;font-size:12px;margin:0;word-break:break-all;">${resetLink}</p>
    </div>

    <p style="color:#505050;font-size:13px;margin:0;line-height:1.6;">
      Este enlace expira en <strong style="color:#B0B0B0;">1 hora</strong>.
      Si no solicitaste esto, puedes ignorar este correo con seguridad.
    </p>
  `

  try {
    await transporter.sendMail({
      from: `"JD INTERNACIONAL" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Recuperacion de contrasena - JD INTERNACIONAL',
      html: emailWrapper(content),
    })
    console.log(`[EMAIL] Reset sent to ${email}`)
    return true
  } catch (err) {
    console.error('[EMAIL] Reset error:', err)
    return false
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createTransport } from "nodemailer"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html?: string
  text?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  message?: string
  error?: string
}

function createSmtpTransporter() {
  const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.office365.com'
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
  const smtpUser = Deno.env.get('SMTP_USER') || 'site@cooprosoja.com.br'
  const smtpPass = Deno.env.get('SMTP_PASS') || 'Sje@@2817'
  const smtpFrom = Deno.env.get('SMTP_FROM') || '"Cooprosoja" <site@cooprosoja.com.br>'

  return {
    transporter: createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    }),
    from: smtpFrom,
  }
}

function validateEmailRequest(data: unknown): EmailRequest | null {
  if (!data || typeof data !== 'object') return null
  
  const req = data as Record<string, unknown>
  const to = req.to
  const subject = req.subject
  const html = req.html
  const text = req.text

  if (typeof to !== 'string' || !to.trim()) return null
  if (typeof subject !== 'string' || !subject.trim()) return null
  if (!html && !text) return null
  if (html && typeof html !== 'string') return null
  if (text && typeof text !== 'string') return null

  return { to, subject, html, text } as EmailRequest
}

async function sendEmail(request: EmailRequest): Promise<EmailResponse> {
  const { transporter, from } = createSmtpTransporter()

  const info = await transporter.sendMail({
    from,
    to: request.to,
    subject: request.subject,
    text: request.text,
    html: request.html,
  })

  return {
    success: true,
    messageId: info.messageId,
    message: 'Email enviado com sucesso!'
  }
}

function createErrorResponse(error: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({ success: false, error }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

function createSuccessResponse(data: EmailResponse): Response {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const emailRequest = validateEmailRequest(body)

    if (!emailRequest) {
      return createErrorResponse('Campos obrigatórios: to, subject, e (html ou text)', 400)
    }

    const result = await sendEmail(emailRequest)
    return createSuccessResponse(result)

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar email'
    return createErrorResponse(errorMessage, 500)
  }
})

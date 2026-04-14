import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createTransport } from "npm:nodemailer@6.9.15"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface EmailRequest {
  to: string
  cc?: string | string[]
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

function getEnv(name: string): string | undefined {
  try {
    // Supabase Edge / Deno
    if (typeof Deno !== "undefined" && Deno.env) {
      const value = Deno.env.get(name)
      if (value) return value
    }
  } catch {
    // ignora
  }

  try {
    // Vercel / Node
    if (typeof process !== "undefined" && process.env) {
      const value = process.env[name]
      if (value) return value
    }
  } catch {
    // ignora
  }

  return undefined
}

function createSmtpTransporter() {

  const smtpHost = getEnv("SMTP_HOST") || "smtp.gmail.com"
  const smtpPort = Number(getEnv("SMTP_PORT") || "587")
  const smtpUser = getEnv("SMTP_USER")
  const smtpPass = getEnv("SMTP_PASS")
  const smtpFrom = getEnv("SMTP_FROM") || smtpUser

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_USER e SMTP_PASS precisam estar configurados.")
  }

  const transporter = createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // 587 = STARTTLS
    requireTLS: true,
    auth: {
      user: smtpUser,
      pass: smtpPass, // senha de app do Gmail
    },
  })

  return {
    transporter,
    from: smtpFrom,
  }
}

function validateEmailRequest(data: unknown): EmailRequest | null {
  if (!data || typeof data !== "object") return null

  const req = data as Record<string, unknown>
  const to = req.to
  const cc = req.cc
  const subject = req.subject
  const html = req.html
  const text = req.text

  if (typeof to !== "string" || !to.trim()) return null
  if (typeof subject !== "string" || !subject.trim()) return null
  if (html === undefined && text === undefined) return null
  if (html !== undefined && typeof html !== "string") return null
  if (text !== undefined && typeof text !== "string") return null

  // cc pode ser string, array de strings ou ausente
  let parsedCc: string | string[] | undefined
  if (typeof cc === "string" && cc.trim()) {
    parsedCc = cc.trim()
  } else if (Array.isArray(cc)) {
    parsedCc = cc.filter((c): c is string => typeof c === "string" && !!c.trim())
    if (parsedCc.length === 0) parsedCc = undefined
  }

  return {
    to: to.trim(),
    cc: parsedCc,
    subject: subject.trim(),
    html: typeof html === "string" ? html : undefined,
    text: typeof text === "string" ? text : undefined,
  }
}

async function sendEmail(request: EmailRequest): Promise<EmailResponse> {
  const { transporter, from } = createSmtpTransporter()

  await transporter.verify()

  await transporter.sendMail({
    from,
    to: request.to,
    cc: request.cc,
    subject: request.subject,
    text: request.text,
    html: request.html,
  })

  return {
    success: true,
    message: "Email enviado com sucesso!",
  }
}

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return createJsonResponse(
      { success: false, error: "Método não permitido" },
      405,
    )
  }

  try {
    const body = await req.json()
    const emailRequest = validateEmailRequest(body)

    if (!emailRequest) {
      return createJsonResponse(
        {
          success: false,
          error: "Campos obrigatórios: to, subject, e (html ou text)",
        },
        400,
      )
    }

    const result = await sendEmail(emailRequest)
    return createJsonResponse(result, 200)
  } catch (error) {
    console.error("Erro ao enviar email:", error)

    const errorMessage =
      error instanceof Error ? error.message : "Erro ao enviar email"

    return createJsonResponse(
      {
        success: false,
        error: errorMessage,
      },
      500,
    )
  }
})
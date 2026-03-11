export interface SendEmailParams {
  to: string
  subject: string
  html?: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  message?: string
  error?: string
  templateId?: string
}

export interface IEmailService {
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>
}

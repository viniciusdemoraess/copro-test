import type { IEmailService, SendEmailParams, SendEmailResult } from '@/contracts/IEmailService'
import { supabase } from '@/integrations/supabase/client'

export class EmailService implements IEmailService {
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      })

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to invoke email function',
        }
      }

      if (data && !data.success) {
        return {
          success: false,
          error: data.error || 'Email sending failed',
        }
      }

      return {
        success: true,
        message: data?.message || 'Email sent successfully',
        templateId: data?.templateId,
      }
    } catch (error) {
      console.error('EmailService error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      }
    }
  }
}

export const emailService = new EmailService()

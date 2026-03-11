import { supabase } from '@/integrations/supabase/client'

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
}

export const useEmailService = () => {
  const sendEmail = async (params: SendEmailParams): Promise<SendEmailResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      })

      if (error) {
        return {
          success: false,
          error: error.message || 'Erro ao invocar função de email',
        }
      }

      if (data && !data.success) {
        return {
          success: false,
          error: data.error || 'Erro ao enviar email',
        }
      }

      return {
        success: true,
        message: data?.message || 'Email enviado com sucesso',
        messageId: data?.messageId,
      }
    } catch (error) {
      console.error('Erro no useEmailService:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar email',
      }
    }
  }

  return { sendEmail }
}

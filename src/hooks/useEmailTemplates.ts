import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface EmailTemplate {
  id: string
  name: string
  type: 'user_confirmation' | 'admin_notification' | 'custom'
  subject: string
  html_body: string
  text_body: string | null
  available_variables: string[]
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmailTemplateData {
  name: string
  type: 'user_confirmation' | 'admin_notification' | 'custom'
  subject: string
  html_body: string
  text_body?: string
  available_variables?: string[]
  description?: string
  is_active?: boolean
}

export const useEmailTemplates = () => {
  const queryClient = useQueryClient()

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as EmailTemplate[]
    },
  })

  const createTemplate = useMutation({
    mutationFn: async (templateData: CreateEmailTemplateData) => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...templateData,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('Template criado com sucesso')
    },
    onError: (error) => {
      console.error('Error creating template:', error)
      toast.error('Erro ao criar template')
    },
  })

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailTemplate> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('email_templates')
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('Template atualizado com sucesso')
    },
    onError: (error) => {
      console.error('Error updating template:', error)
      toast.error('Erro ao atualizar template')
    },
  })

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('Template excluído com sucesso')
    },
    onError: (error) => {
      console.error('Error deleting template:', error)
      toast.error('Erro ao excluir template')
    },
  })

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
  }
}

export const useEmailTemplate = (id: string) => {
  return useQuery({
    queryKey: ['email-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as EmailTemplate
    },
    enabled: !!id,
  })
}

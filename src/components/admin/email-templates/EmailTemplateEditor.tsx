import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEmailTemplates, useEmailTemplate, type CreateEmailTemplateData } from '@/hooks/useEmailTemplates'
import { Badge } from '@/components/ui/badge'

interface EmailTemplateEditorProps {
  templateId: string | null
  onClose: () => void
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  templateId,
  onClose,
}) => {
  const { createTemplate, updateTemplate } = useEmailTemplates()
  const { data: existingTemplate } = useEmailTemplate(templateId || '')

  const [formData, setFormData] = useState<CreateEmailTemplateData>({
    name: '',
    type: 'custom',
    subject: '',
    html_body: '',
    text_body: '',
    available_variables: [],
    description: '',
    is_active: true,
  })

  const [newVariable, setNewVariable] = useState('')

  useEffect(() => {
    if (existingTemplate) {
      setFormData({
        name: existingTemplate.name,
        type: existingTemplate.type,
        subject: existingTemplate.subject,
        html_body: existingTemplate.html_body,
        text_body: existingTemplate.text_body || '',
        available_variables: existingTemplate.available_variables || [],
        description: existingTemplate.description || '',
        is_active: existingTemplate.is_active,
      })
    }
  }, [existingTemplate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (templateId) {
        await updateTemplate({ id: templateId, ...formData })
      } else {
        await createTemplate(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleAddVariable = () => {
    if (newVariable && !formData.available_variables?.includes(newVariable)) {
      setFormData({
        ...formData,
        available_variables: [...(formData.available_variables || []), newVariable],
      })
      setNewVariable('')
    }
  }

  const handleRemoveVariable = (variable: string) => {
    setFormData({
      ...formData,
      available_variables: formData.available_variables?.filter((v) => v !== variable) || [],
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {templateId ? 'Editar Template' : 'Novo Template de E-mail'}
          </DialogTitle>
          <DialogDescription>
            Configure o template de e-mail que será enviado automaticamente pelo sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Confirmação de Cadastro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Template</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_confirmation">Confirmação de Usuário</SelectItem>
                  <SelectItem value="admin_notification">Notificação Admin</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descrição do propósito deste template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto do E-mail</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Ex: Bem-vindo à Cooprosoja, {{nome}}!"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="html_body">Corpo HTML</Label>
            <Textarea
              id="html_body"
              value={formData.html_body}
              onChange={(e) => setFormData({ ...formData, html_body: e.target.value })}
              placeholder="Cole aqui o HTML do template..."
              rows={12}
              className="font-mono text-xs"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis no formato: {`{{nome_variavel}}`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text_body">Corpo Texto (opcional)</Label>
            <Textarea
              id="text_body"
              value={formData.text_body}
              onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
              placeholder="Versão em texto puro para clientes que não suportam HTML"
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Variáveis Disponíveis</Label>
            <div className="flex gap-2">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="nome_variavel"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariable())}
              />
              <Button type="button" onClick={handleAddVariable} variant="outline">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.available_variables?.map((variable) => (
                <Badge
                  key={variable}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => handleRemoveVariable(variable)}
                >
                  {`{{${variable}}}`}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Template ativo</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {templateId ? 'Atualizar' : 'Criar'} Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EmailTemplateEditor

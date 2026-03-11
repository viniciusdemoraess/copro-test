import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEmailTemplate } from '@/hooks/useEmailTemplates'
import { Badge } from '@/components/ui/badge'

interface EmailTemplatePreviewProps {
  templateId: string
  onClose: () => void
}

const renderTemplate = (template: string, variables: Record<string, string>): string => {
  let rendered = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    rendered = rendered.replace(regex, value || `{{${key}}}`)
  })

  return rendered
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  templateId,
  onClose,
}) => {
  const { data: template } = useEmailTemplate(templateId)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [previewSubject, setPreviewSubject] = useState('')

  useEffect(() => {
    if (template) {
      const defaultVariables: Record<string, string> = {}

      template.available_variables?.forEach((variable) => {
        switch (variable) {
          case 'nome':
            defaultVariables[variable] = 'João da Silva'
            break
          case 'email':
            defaultVariables[variable] = 'joao.silva@exemplo.com'
            break
          case 'telefone':
            defaultVariables[variable] = '(65) 99999-9999'
            break
          case 'data_envio':
            defaultVariables[variable] = new Date().toLocaleDateString('pt-BR')
            break
          case 'telefone_cooprosoja':
            defaultVariables[variable] = '(65) 3000-0000'
            break
          case 'email_cooprosoja':
            defaultVariables[variable] = 'contato@cooprosoja.com.br'
            break
          case 'admin_url':
            defaultVariables[variable] = window.location.origin + '/admin'
            break
          default:
            defaultVariables[variable] = `[${variable}]`
        }
      })

      setVariables(defaultVariables)
    }
  }, [template])

  useEffect(() => {
    if (template) {
      setPreviewHtml(renderTemplate(template.html_body, variables))
      setPreviewText(template.text_body ? renderTemplate(template.text_body, variables) : '')
      setPreviewSubject(renderTemplate(template.subject, variables))
    }
  }, [template, variables])

  if (!template) {
    return null
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {template.name}</DialogTitle>
          <DialogDescription>
            Visualize como o e-mail será exibido para os destinatários
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Variáveis do Template</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Altere os valores para visualizar diferentes cenários
              </p>
              {template.available_variables?.map((variable) => (
                <div key={variable} className="space-y-1 mb-3">
                  <Label htmlFor={variable} className="text-xs">
                    {`{{${variable}}}`}
                  </Label>
                  <Input
                    id={variable}
                    value={variables[variable] || ''}
                    onChange={(e) =>
                      setVariables({ ...variables, [variable]: e.target.value })
                    }
                    placeholder={variable}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Informações</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline" className="ml-2">
                    {template.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={template.is_active ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <div className="space-y-2 bg-muted p-4 rounded-lg">
              <Label className="text-xs text-muted-foreground">ASSUNTO</Label>
              <p className="font-semibold">{previewSubject}</p>
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">Visualização HTML</TabsTrigger>
                <TabsTrigger value="text">Versão Texto</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="mt-4">
                <div className="border rounded-lg bg-white">
                  <div
                    className="p-4"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <div className="border rounded-lg bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {previewText || 'Nenhuma versão em texto configurada'}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EmailTemplatePreview

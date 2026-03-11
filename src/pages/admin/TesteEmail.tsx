import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useEmailService } from '@/hooks/useEmailService'
import { Code, Eye, Loader2, Send } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const TesteEmail = () => {
  const { sendEmail } = useEmailService()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    to: '',
    subject: 'Email de Teste - Cooprosoja',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2D5016; color: white; padding: 30px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cooprosoja</h1>
      <p>Email de Teste</p>
    </div>
    <div class="content">
      <h2>Olá!</h2>
      <p>Este é um email de teste do sistema Cooprosoja.</p>
      <p>Se você recebeu este email, significa que a configuração SMTP está funcionando corretamente.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: 'Este é um email de teste do sistema Cooprosoja.\n\nSe você recebeu este email, significa que a configuração SMTP está funcionando corretamente.'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.to) {
      toast.error('Por favor, informe o email de destino')
      return
    }

    setLoading(true)

    try {
      const result = await sendEmail({
        to: formData.to,
        subject: formData.subject,
        html: formData.html,
        text: formData.text,
      })

      if (result.success) {
        toast.success('Email enviado com sucesso!', {
          description: result.messageId ? `ID da mensagem: ${result.messageId}` : undefined
        })
        // Limpar apenas o campo de destino após sucesso
        setFormData(prev => ({ ...prev, to: '' }))
      } else {
        toast.error('Erro ao enviar email', {
          description: result.error || 'Erro desconhecido'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao enviar email'
      toast.error('Erro ao enviar email', {
        description: errorMessage
      })
      console.error('Erro detalhado:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Teste de Envio de E-mail</h1>
        <p className="text-muted-foreground mt-1">
          Envie um email de teste para verificar a configuração SMTP
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Email</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para enviar um email de teste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Email de Destino *</Label>
              <Input
                id="to"
                type="email"
                placeholder="seu-email@exemplo.com"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="html">HTML (opcional)</Label>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor" className="gap-2">
                    <Code className="h-4 w-4" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <Textarea
                    id="html"
                    value={formData.html}
                    onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                    rows={10}
                    className="font-mono text-xs"
                    placeholder="Digite o HTML do email aqui..."
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div 
                    className="border rounded-md p-4 bg-white min-h-[200px] max-h-[400px] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: formData.html }}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Texto Simples (opcional)</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={4}
                placeholder="Versão em texto simples do email..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Email de Teste
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TesteEmail

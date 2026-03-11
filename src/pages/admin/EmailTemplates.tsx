import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import EmailTemplateList from '@/components/admin/email-templates/EmailTemplateList'
import EmailTemplateEditor from '@/components/admin/email-templates/EmailTemplateEditor'
import EmailTemplatePreview from '@/components/admin/email-templates/EmailTemplatePreview'

const EmailTemplates = () => {
  const { templates, isLoading } = useEmailTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleCreateNew = () => {
    setSelectedTemplateId(null)
    setIsCreating(true)
  }

  const handleEdit = (id: string) => {
    setSelectedTemplateId(id)
    setIsCreating(false)
  }

  const handlePreview = (id: string) => {
    setSelectedTemplateId(id)
    setShowPreview(true)
  }

  const handleCloseEditor = () => {
    setIsCreating(false)
    setSelectedTemplateId(null)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando templates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Templates de E-mail</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os templates de e-mail enviados automaticamente pelo sistema
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <EmailTemplateList
        templates={templates || []}
        onEdit={handleEdit}
        onPreview={handlePreview}
      />

      {(isCreating || selectedTemplateId) && !showPreview && (
        <EmailTemplateEditor
          templateId={selectedTemplateId}
          onClose={handleCloseEditor}
        />
      )}

      {showPreview && selectedTemplateId && (
        <EmailTemplatePreview
          templateId={selectedTemplateId}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}

export default EmailTemplates

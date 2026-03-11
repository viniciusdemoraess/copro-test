import React, { useState, useRef } from 'react';
import { FileText, Upload, X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUploadTermo, useTermosList, useDeleteTermo, useTermoUrl } from '@/hooks/useTerms';
import { useToast } from '@/hooks/use-toast';

interface TermosUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermosUploadModal({ isOpen, onClose }: TermosUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useUploadTermo();
  const { data: termosList, isLoading: listLoading } = useTermosList();
  const { data: currentTermoUrl } = useTermoUrl();
  const deleteMutation = useDeleteTermo();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          variant: 'destructive',
          title: 'Formato inválido',
          description: 'Apenas arquivos PDF são permitidos.',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB.',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      await deleteMutation.mutateAsync(fileName);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerenciar Termos de Associação
          </DialogTitle>
          <DialogDescription>
            Faça upload de arquivos com os termos de associação. O arquivo será disponibilizado para os participantes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Novo Arquivo</label>
              <div className="mt-2 flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="termo-upload"
                />
                <label htmlFor="termo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivos
                    </span>
                  </Button>
                </label>
                {selectedFile && (
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground flex-1 truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Arquivo
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Current File */}
          {currentTermoUrl && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Arquivo Atual</p>
                    <a
                      href={currentTermoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Visualizar PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Files List */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Arquivos no Sistema</h3>
            {listLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : termosList && termosList.length > 0 ? (
              <div className="space-y-2">
                {termosList.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.metadata?.size ? formatFileSize(Number(file.metadata.size)) : 'Tamanho desconhecido'} •{' '}
                          {file.created_at ? formatDate(file.created_at) : 'Data desconhecida'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.name)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum arquivo encontrado.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

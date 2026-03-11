import React, { useState } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTermoUrl } from '@/hooks/useTerms';

interface TermosViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermosViewModal({ isOpen, onClose }: TermosViewModalProps) {
  const { data: termoUrl, isLoading, error } = useTermoUrl();
  const [iframeLoading, setIframeLoading] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Termos de Associação
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Erro ao carregar termos</p>
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar os termos de associação. Por favor, tente novamente mais tarde.
              </p>
            </div>
          ) : !termoUrl ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Termos não disponíveis</p>
              <p className="text-sm text-muted-foreground">
                Os termos de associação ainda não foram cadastrados.
              </p>
            </div>
          ) : (
            <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted">
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <iframe
                src={termoUrl}
                className="w-full h-full min-h-[500px]"
                onLoad={() => setIframeLoading(false)}
                title="Termos de Associação"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

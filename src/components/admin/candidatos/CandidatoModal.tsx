import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, History, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Candidato, CandidatoStatus, STATUS_CONFIG } from '@/types/candidato';
import { StatusBadge } from './StatusBadge';
import { HistoryTimeline } from './HistoryTimeline';
import { formatCPF, formatPhone, formatDateOnly, formatCEP } from '@/lib/format-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidatoHistory, useUpdateCandidatoStatus, useUpdateCandidatoNotes } from '@/hooks/useCandidatos';

interface CandidatoModalProps {
  candidato: Candidato | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidatoModal({ candidato, isOpen, onClose }: CandidatoModalProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<CandidatoStatus>('novo');
  const [notes, setNotes] = useState('');
  
  const { data: history, isLoading: historyLoading } = useCandidatoHistory(candidato?.id || null);
  const updateStatusMutation = useUpdateCandidatoStatus();
  const updateNotesMutation = useUpdateCandidatoNotes();
  
  useEffect(() => {
    if (candidato) {
      setStatus(candidato.status);
      setNotes(candidato.admin_notes || '');
    }
  }, [candidato]);
  
  if (!candidato) return null;
  
  const handleSaveStatus = () => {
    if (!user) return;
    updateStatusMutation.mutate({
      id: candidato.id,
      status,
      userId: user.id,
    });
  };
  
  const handleSaveNotes = () => {
    if (!user) return;
    updateNotesMutation.mutate({
      id: candidato.id,
      notes,
      userId: user.id,
    });
  };
  
  const phones = candidato.phones || [];
  const secondaryEmails = candidato.secondary_emails || [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-5 h-5" />
            {candidato.full_name}
            <StatusBadge status={candidato.status} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">
                  <User className="w-4 h-4 mr-1" />
                  Pessoal
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <Phone className="w-4 h-4 mr-1" />
                  Contato
                </TabsTrigger>
                <TabsTrigger value="address">
                  <MapPin className="w-4 h-4 mr-1" />
                  Endereço
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="w-4 h-4 mr-1" />
                  Histórico
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">CPF</Label>
                    <p className="font-mono">{formatCPF(candidato.cpf)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">RG</Label>
                    <p>{candidato.rg || '-'} {candidato.rg_orgao && `(${candidato.rg_orgao})`}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nome Completo</Label>
                    <p>{candidato.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data de Nascimento</Label>
                    <p>{formatDateOnly(candidato.birth_date)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nacionalidade</Label>
                    <p>{candidato.nationality || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado Civil</Label>
                    <p>{candidato.marital_status || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Profissão</Label>
                    <p>{candidato.profession || '-'}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div>
                  <Label className="text-muted-foreground">Email Principal</Label>
                  <p>{candidato.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">WhatsApp</Label>
                  <p>{candidato.whatsapp ? formatPhone(candidato.whatsapp) : '-'}</p>
                </div>
                {phones.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Telefones</Label>
                    <ul className="list-disc list-inside">
                      {phones.map((phone, idx) => (
                        <li key={idx}>
                          {formatPhone(phone.numero)}
                          {phone.whatsapp && ' (WhatsApp)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {secondaryEmails.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Emails Secundários</Label>
                    <ul className="list-disc list-inside">
                      {secondaryEmails.map((email, idx) => (
                        <li key={idx}>{email}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="address" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">CEP</Label>
                    <p>{candidato.cep ? formatCEP(candidato.cep) : '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Logradouro</Label>
                    <p>
                      {candidato.street || '-'}
                      {candidato.number && `, ${candidato.number}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Complemento</Label>
                    <p>{candidato.complement || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bairro</Label>
                    <p>{candidato.neighborhood || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Município</Label>
                    <p>{candidato.city || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <p>{candidato.state || '-'}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <HistoryTimeline history={history || []} isLoading={historyLoading} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Selector */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as CandidatoStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSaveStatus}
                disabled={status === candidato.status || updateStatusMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateStatusMutation.isPending ? 'Salvando...' : 'Salvar Status'}
              </Button>
            </div>
            
            {/* Admin Notes */}
            <div className="space-y-3">
              <Label>Notas Internas</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este candidato..."
                rows={6}
                className="resize-none"
              />
              <Button
                variant="outline"
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending}
                className="w-full"
              >
                {updateNotesMutation.isPending ? 'Salvando...' : 'Salvar Notas'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

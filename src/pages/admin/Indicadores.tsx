import React, { useState } from 'react';
import { Plus, Trash2, Edit, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatsIndicatorsAdmin, useCreateStatsIndicator, useUpdateStatsIndicator, useDeleteStatsIndicator, useToggleStatsIndicatorStatus, StatsIndicator } from '@/hooks/useStatsIndicators';
import * as Icons from 'lucide-react';
import { IconPicker } from '@/components/admin/info-cards/IconPicker';

export default function Indicadores() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<StatsIndicator | null>(null);
  const [deletingIndicator, setDeletingIndicator] = useState<StatsIndicator | null>(null);
  const [formIcon, setFormIcon] = useState<string>('MapPin');
  const [formActive, setFormActive] = useState(true);

  const { data: indicators, isLoading } = useStatsIndicatorsAdmin();
  const createMutation = useCreateStatsIndicator();
  const updateMutation = useUpdateStatsIndicator();
  const deleteMutation = useDeleteStatsIndicator();
  const toggleMutation = useToggleStatsIndicatorStatus();

  const activeCount = indicators?.filter(i => i.active).length || 0;
  const canAddMore = activeCount < 3;

  const handleAdd = () => {
    if (!canAddMore) {
      alert('Máximo de 3 indicadores ativos permitidos. Desative um indicador antes de adicionar outro.');
      return;
    }
    setEditingIndicator(null);
    setFormIcon('MapPin');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleEdit = (indicator: StatsIndicator) => {
    setEditingIndicator(indicator);
    setFormIcon(indicator.icon || 'MapPin');
    setFormActive(indicator.active);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingIndicator) {
      await deleteMutation.mutateAsync(deletingIndicator.id);
      setDeletingIndicator(null);
    }
  };

  const handleToggle = (id: string, active: boolean) => {
    toggleMutation.mutate({ id, active });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      value: parseFloat(formData.get('value') as string),
      prefix: formData.get('prefix') as string || '',
      suffix: '',
      label: formData.get('label') as string || '',
      icon: formIcon || 'MapPin',
      active: formActive,
    };

    try {
      if (editingIndicator) {
        await updateMutation.mutateAsync({ id: editingIndicator.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      setEditingIndicator(null);
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Indicadores</h1>
          <p className="text-muted-foreground">
            Gerencie os indicadores exibidos na página inicial (máximo 3 ativos)
          </p>
        </div>
        <Button onClick={handleAdd} disabled={!canAddMore && !editingIndicator}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Indicador
        </Button>
      </div>

      {/* Info sobre limite */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {activeCount} de 3 indicadores ativos
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              {canAddMore
                ? `Você pode adicionar mais ${3 - activeCount} indicador(es)`
                : 'Limite máximo atingido. Desative um indicador para adicionar outro.'}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Indicadores */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {indicators?.map((indicator) => {
            const IconComponent = indicator.icon
              ? (Icons[indicator.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
              : null;
            return (
              <div
                key={indicator.id}
                className="flex items-center justify-between p-5 border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`p-3.5 rounded-full flex-shrink-0 ${indicator.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {IconComponent ? (
                      <IconComponent className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-xl text-foreground">
                        {indicator.prefix}{indicator.value.toLocaleString('pt-BR')}
                      </span>
                      {indicator.active && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          Ativo
                        </span>
                      )}
                    </div>
                    {indicator.label && (
                      <p className="text-sm text-muted-foreground mt-1.5">{indicator.label}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                    <Switch
                      checked={indicator.active}
                      onCheckedChange={(checked) => handleToggle(indicator.id, checked)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {indicator.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(indicator)}
                    className="h-9 w-9"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingIndicator(indicator)}
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {indicators?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum indicador cadastrado. Clique em "Adicionar Indicador" para começar.
            </div>
          )}
        </div>
      )}

      {/* Modal Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setEditingIndicator(null);
          setFormIcon('MapPin');
          setFormActive(true);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl">
                {editingIndicator ? 'Editar Indicador' : 'Adicionar Indicador'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Preencha os dados do indicador. Lembre-se: apenas 3 indicadores podem estar ativos simultaneamente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Valor e Prefixo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor *</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    defaultValue={editingIndicator?.value || ''}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefix">Prefixo</Label>
                  <Input
                    id="prefix"
                    name="prefix"
                    placeholder="Ex: +"
                    defaultValue={editingIndicator?.prefix || ''}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  name="label"
                  placeholder="Ex: Cidades do estado de MT"
                  defaultValue={editingIndicator?.label || ''}
                  className="w-full"
                />
              </div>

              {/* Ícone */}
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone *</Label>
                <IconPicker
                  selected={formIcon}
                  onSelect={setFormIcon}
                  iconColor="#0e873d"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="active" className="text-base font-medium">
                    Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {formActive ? 'Indicador será exibido na página inicial' : 'Indicador não será exibido'}
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingIndicator(null);
                  setFormIcon('MapPin');
                  setFormActive(true);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingIndicator ? 'Salvar Alterações' : 'Criar Indicador'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingIndicator} onOpenChange={() => setDeletingIndicator(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este indicador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

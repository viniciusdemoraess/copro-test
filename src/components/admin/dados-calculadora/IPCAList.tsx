import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { IPCAModal } from './IPCAModal';
import { createIPCA, deleteIPCA, fetchIPCAList, updateIPCA } from '@/services/ipca';
import type { IPCA } from '@/types/ipca';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function IPCAList() {
  const [ipcas, setIPCAs] = useState<IPCA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedIPCA, setSelectedIPCA] = useState<IPCA | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadIPCAs();
  }, []);

  const loadIPCAs = async () => {
    try {
      setIsLoading(true);
      const data = await fetchIPCAList();
      setIPCAs(data);
    } catch (error) {
      toast.error('Erro ao carregar IPCA');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedIPCA(undefined);
    setShowModal(true);
  };

  const handleEdit = (ipca: IPCA) => {
    setSelectedIPCA(ipca);
    setShowModal(true);
  };

  const handleSubmit = async (data: { ano: number; percentual: number }) => {
    try {
      setIsLoading(true);
      if (selectedIPCA) {
        await updateIPCA(selectedIPCA.id, { percentual: data.percentual });
        toast.success('IPCA atualizado com sucesso');
      } else {
        await createIPCA(data);
        toast.success('IPCA criado com sucesso');
      }
      await loadIPCAs();
      setShowModal(false);
    } catch (error) {
      toast.error('Erro ao salvar IPCA');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsLoading(true);
      await deleteIPCA(deleteId);
      toast.success('IPCA removido com sucesso');
      await loadIPCAs();
      setDeleteId(null);
    } catch (error) {
      toast.error('Erro ao remover IPCA');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">IPCA - Índice de Preços ao Consumidor Amplo</h2>
        <Button onClick={handleAddNew} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar IPCA
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Índices Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !ipcas.length ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : ipcas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum IPCA registrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Ano</th>
                    <th className="text-left p-3 font-semibold">Percentual (%)</th>
                    <th className="text-left p-3 font-semibold">Último Acesso</th>
                    <th className="text-right p-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ipcas.map((ipca) => (
                    <tr key={ipca.id} className="border-b hover:bg-muted/50 transition">
                      <td className="p-3 font-semibold">{ipca.ano}</td>
                      <td className="p-3">{ipca.percentual.toFixed(2)}%</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(ipca.updated_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-right space-x-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(ipca)}
                          disabled={isLoading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(ipca.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <IPCAModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={handleSubmit}
        ipca={selectedIPCA}
        isLoading={isLoading}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover IPCA</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o IPCA de {ipcas.find((i) => i.id === deleteId)?.ano}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

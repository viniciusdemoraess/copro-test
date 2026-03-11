import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Candidato } from '@/types/candidato';
import { exportToCSV, exportAllCandidatos } from '@/lib/export-utils';

interface ExportButtonProps {
  currentPageCandidatos: Candidato[];
  selectedCandidatos: Candidato[];
}

export function ExportButton({ currentPageCandidatos, selectedCandidatos }: ExportButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  
  const handleExportPage = () => {
    const filename = `candidatos-pagina-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(currentPageCandidatos, filename);
    toast({ title: 'Exportação concluída' });
  };
  
  const handleExportSelected = () => {
    if (selectedCandidatos.length === 0) {
      toast({ title: 'Nenhum candidato selecionado', variant: 'destructive' });
      return;
    }
    const filename = `candidatos-selecionados-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(selectedCandidatos, filename);
    toast({ title: 'Exportação concluída' });
  };
  
  const handleExportAll = async () => {
    setLoading(true);
    try {
      const all = await exportAllCandidatos(supabase);
      const filename = `candidatos-todos-${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(all, filename);
      toast({ title: 'Exportação concluída' });
    } catch (error) {
      toast({ title: 'Erro ao exportar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPage}>
          Exportar página atual (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportSelected}>
          Exportar selecionados (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportAll}>
          Exportar todos (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

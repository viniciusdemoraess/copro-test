import { Candidato } from '@/types/candidato';
import { formatCPF, formatPhone, formatFullDate, formatDateOnly } from './format-utils';
import { STATUS_CONFIG } from '@/types/candidato';

export function exportToCSV(candidatos: Candidato[], filename: string) {
  const headers = [
    'Nome Completo',
    'CPF',
    'RG',
    'Data de Nascimento',
    'Email',
    'WhatsApp',
    'CEP',
    'Endereço',
    'Bairro',
    'Município',
    'Estado',
    'Status',
    'Data de Cadastro',
  ];
  
  const rows = candidatos.map(c => [
    c.full_name,
    formatCPF(c.cpf),
    c.rg || '',
    formatDateOnly(c.birth_date),
    c.email,
    c.whatsapp ? formatPhone(c.whatsapp) : '',
    c.cep || '',
    c.street ? `${c.street}, ${c.number || 'S/N'}` : '',
    c.neighborhood || '',
    c.city || '',
    c.state || '',
    STATUS_CONFIG[c.status].label,
    formatFullDate(c.created_at),
  ]);
  
  // Build CSV content
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
  ].join('\n');
  
  // Create BOM for UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function exportAllCandidatos(supabase: any): Promise<Candidato[]> {
  const { data, error } = await supabase
    .from('association_forms')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Candidato[];
}

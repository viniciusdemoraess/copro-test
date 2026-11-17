// Format BRL currency: R$ 3.500.000,00
export function formatBRL(value: number | null | undefined): string {
  const num = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format BRL without the currency symbol: 3.500.000,00
export function formatBRLPlain(value: number | null | undefined): string {
  const num = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Parse a BRL/pt-BR formatted string back to a float (unmasking).
// Accepts "R$ 3.500.000,00", "3.500.000,00", "125,00", "60" etc.
export function parseBRL(masked: string): number | null {
  if (!masked) return null;
  const cleaned = masked
    .replace(/[^\d.,-]/g, '') // keep digits, dot, comma, minus
    .replace(/\./g, '') // remove thousand separators
    .replace(',', '.'); // decimal comma -> dot
  if (cleaned === '' || cleaned === '-') return null;
  const value = Number(cleaned);
  return Number.isNaN(value) ? null : value;
}

// Format a plain number with pt-BR grouping (e.g. produtividade 1.234,5 sc/ha)
export function formatNumber(
  value: number | null | undefined,
  maxFractionDigits = 2
): string {
  const num = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}

// Format CPF: 123.456.789-00
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Format phone: (65) 99999-9999
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// Format CEP: 78000-000
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '');
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Format relative date
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}sem`;
  if (days < 365) return `${Math.floor(days / 30)}m`;
  return `${Math.floor(days / 365)}a`;
}

// Format full date: 01/01/2025 14:30
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date only: 01/01/2025
export function formatDateOnly(dateString: string | null): string {
  if (!dateString) return '-';
  // Handle both ISO dates and DD/MM/YYYY format
  if (dateString.includes('/')) return dateString;
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

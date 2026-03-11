// Validação de CPF
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(digits.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.substring(9, 10))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(digits.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.substring(10, 11))) return false;
  
  return true;
}

// Validação de telefone (mínimo 10 dígitos, máximo 11)
export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

// Validação de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Validações adicionais
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  if (localPart.length === 0 || localPart.length > 64) return false;
  if (domain.length === 0 || domain.length > 255) return false;
  
  // Verifica se o domínio tem pelo menos um ponto
  if (!domain.includes('.')) return false;
  
  return true;
}

// Validação de data de nascimento (formato DD/MM/YYYY)
export function validateBirthDate(date: string): { valid: boolean; error?: string } {
  const digits = date.replace(/\D/g, '');
  
  if (digits.length !== 8) {
    return { valid: false, error: 'Data inválida' };
  }
  
  const day = parseInt(digits.substring(0, 2));
  const month = parseInt(digits.substring(2, 4));
  const year = parseInt(digits.substring(4, 8));
  
  // Valida mês
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Mês inválido' };
  }
  
  // Valida dia
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { valid: false, error: 'Dia inválido' };
  }
  
  // Valida ano (deve ser entre 1900 e ano atual)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return { valid: false, error: 'Ano inválido' };
  }
  
  // Valida se a pessoa tem pelo menos 18 anos
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  const dayDiff = today.getDate() - day;
  
  let actualAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    actualAge--;
  }
  
  if (actualAge < 18) {
    return { valid: false, error: 'Você deve ter pelo menos 18 anos para se associar' };
  }
  
  // Valida se a data não é no futuro
  if (birthDate > today) {
    return { valid: false, error: 'Data de nascimento não pode ser no futuro' };
  }
  
  return { valid: true };
}

// Validação de CEP (8 dígitos)
export function validateCEP(cep: string): boolean {
  const digits = cep.replace(/\D/g, '');
  return digits.length === 8;
}

// Validação de nome completo (mínimo 3 palavras, apenas letras e espaços)
export function validateFullName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 5) return false;
  
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2) return false;
  
  // Verifica se contém apenas letras, espaços e caracteres acentuados
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  return nameRegex.test(trimmed);
}

// Validação de texto apenas com letras (para nacionalidade, profissão, etc)
export function validateTextOnly(text: string, minLength: number = 2): boolean {
  const trimmed = text.trim();
  if (trimmed.length < minLength) return false;
  
  const textRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  return textRegex.test(trimmed);
}

// Validação de número de endereço
export function validateAddressNumber(number: string): boolean {
  if (!number || number.trim().length === 0) return true; // Opcional
  const numberRegex = /^[0-9A-Za-z\s\-/]+$/;
  return numberRegex.test(number.trim());
}

// Estados brasileiros
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

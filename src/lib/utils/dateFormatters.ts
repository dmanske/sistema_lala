/**
 * Utilitários para formatação de datas e dados
 */

/**
 * Converte uma string de data (YYYY-MM-DD ou ISO) para objeto Date no fuso horário local
 * Evita o problema de datas UTC (YYYY-MM-DD) voltarem um dia no Brasil
 */
export const parseLocalDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;

  try {
    // Se for string YYYY-MM-DD simples, faz o parse manual para garantir hora 00:00 local
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    // Se tiver hora/timezone, confia no construtor
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return date;
  } catch {
    return null;
  }
};

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  // Se for string DD/MM/YYYY, retorna direto
  if (typeof date === 'string' && date.includes('/')) return date;

  const dateObj = typeof date === 'string' ? parseLocalDate(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC' // Força UTC para evitar deslocamento se a data já foi ajustada ou se queremos a data exata do objeto
  }).format(dateObj).replace(/,/g, '');
};

/**
 * Formata data de nascimento para exibição (Alias para formatDate por compatibilidade)
 */
export const formatBirthDate = (date: string | null | undefined): string => {
  if (!date) return '';
  if (date.includes('/')) return date;

  // Tratamento específico para YYYY-MM-DD strings de data de nascimento
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  return formatDate(date);
};

/**
 * Calcula idade a partir da data de nascimento
 * @param birthDate - Data de nascimento no formato ISO (YYYY-MM-DD) ou DD/MM/YYYY
 * @returns Idade em anos
 */
export const calcularIdade = (birthDate: string | null | undefined): number => {
  if (!birthDate) return 0;

  try {
    const hoje = new Date();
    let nascimento: Date;

    // Se a data está no formato brasileiro DD/MM/YYYY
    if (birthDate.includes('/')) {
      const [dia, mes, ano] = birthDate.split('/');
      nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }
    // Se a data está no formato ISO YYYY-MM-DD
    else {
      const [ano, mes, dia] = birthDate.split('-');
      nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }

    // Verificar se a data é válida
    if (isNaN(nascimento.getTime())) {
      return 0;
    }

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    // Ajustar se ainda não fez aniversário este ano
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  } catch (error) {
    console.error('Erro ao calcular idade:', error);
    return 0;
  }
};

/**
 * Formata número de telefone
 * @param phone - Telefone sem formatação
 * @returns Telefone formatado (XX) XXXXX-XXXX ou string vazia
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';

  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');

  // Se não tem números suficientes, retorna vazio
  if (numbers.length < 10) return phone;

  // Formata (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  return phone;
};

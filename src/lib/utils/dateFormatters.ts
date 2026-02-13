/**
 * Utilitários para formatação de datas e dados
 */

/**
 * Formata data de nascimento para exibição
 * @param date - Data no formato ISO (YYYY-MM-DD) ou null
 * @returns Data formatada (DD/MM/YYYY) ou string vazia
 */
export const formatBirthDate = (date: string | null | undefined): string => {
  if (!date) return '';
  
  try {
    // Se já está no formato DD/MM/YYYY, retorna direto
    if (date.includes('/')) return date;
    
    // Se está no formato ISO YYYY-MM-DD
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
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

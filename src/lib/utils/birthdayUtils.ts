/**
 * Utilitários para verificação de aniversários
 */

/**
 * Verifica se uma data de nascimento corresponde ao aniversário de hoje
 * @param dataNascimento - Data de nascimento no formato ISO (YYYY-MM-DD) ou brasileiro (DD/MM/YYYY)
 * @returns true se for aniversário hoje, false caso contrário
 */
export const isAniversarioHoje = (dataNascimento: string | null | undefined): boolean => {
  if (!dataNascimento) return false;

  try {
    const hoje = new Date();
    let nascimento: Date;

    // Se a data está no formato brasileiro DD/MM/YYYY
    if (dataNascimento.includes('/')) {
      const [dia, mes, ano] = dataNascimento.split('/');
      nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } 
    // Se a data está no formato ISO YYYY-MM-DD
    else if (dataNascimento.includes('-')) {
      const [ano, mes, dia] = dataNascimento.split('-');
      nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } 
    else {
      nascimento = new Date(dataNascimento);
    }

    // Verificar se a data é válida
    if (isNaN(nascimento.getTime())) {
      return false;
    }

    // Comparar apenas dia e mês (ignorar ano)
    return (
      hoje.getDate() === nascimento.getDate() && 
      hoje.getMonth() === nascimento.getMonth()
    );
  } catch (error) {
    console.error('Erro ao verificar aniversário:', error);
    return false;
  }
};

/**
 * Calcula quantos dias faltam para o próximo aniversário
 * @param dataNascimento - Data de nascimento no formato ISO (YYYY-MM-DD) ou brasileiro (DD/MM/YYYY)
 * @returns número de dias até o próximo aniversário, ou null se a data for inválida
 */
export const diasParaProximoAniversario = (dataNascimento: string | null | undefined): number | null => {
  if (!dataNascimento) return null;

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa
    
    let nascimento: Date;

    // Se a data está no formato brasileiro DD/MM/YYYY
    if (dataNascimento.includes('/')) {
      const [dia, mes, ano] = dataNascimento.split('/');
      nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } 
    // Se a data está no formato ISO YYYY-MM-DD
    else if (dataNascimento.includes('-')) {
      const [ano, mes, dia] = dataNascimento.split('-');
      nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } 
    else {
      nascimento = new Date(dataNascimento);
    }

    // Verificar se a data é válida
    if (isNaN(nascimento.getTime())) {
      return null;
    }

    // Criar data do aniversário neste ano
    const aniversarioEsteAno = new Date(
      hoje.getFullYear(), 
      nascimento.getMonth(), 
      nascimento.getDate()
    );
    aniversarioEsteAno.setHours(0, 0, 0, 0);

    // Se o aniversário já passou este ano, calcular para o próximo ano
    if (aniversarioEsteAno < hoje) {
      aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
    }

    // Calcular diferença em dias
    const diffTime = aniversarioEsteAno.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('Erro ao calcular dias para próximo aniversário:', error);
    return null;
  }
};

/**
 * Obtém lista de clientes que fazem aniversário hoje
 * @param clientes - Array de clientes com birthDate ou birth_date
 * @returns Array de clientes aniversariantes
 */
export const getAniversariantesHoje = <T extends { birthDate?: string | null; birth_date?: string | null }>(
  clientes: T[]
): T[] => {
  return clientes.filter(cliente => {
    const dataNascimento = (cliente as any).birth_date || (cliente as any).birthDate;
    return isAniversarioHoje(dataNascimento);
  });
};

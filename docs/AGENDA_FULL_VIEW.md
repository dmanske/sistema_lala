# Visualização Completa da Agenda

## Novos Modos de Visualização

Foram adicionados dois novos modos de visualização para permitir que a cliente veja a agenda completa numa tela só, sem precisar rolar:

### 1. Dia Full (day-compact)
- Mostra o dia inteiro (5h às 23:30) numa única tela
- Altura dos slots reduzida de 80px para 30px por hora
- Cards de agendamento compactados com informações essenciais
- Ideal para ter uma visão geral rápida do dia

### 2. Semana Full (week-compact)
- Mostra a semana inteira (7 dias, 5h às 23:30) numa única tela
- Mesma altura compacta de 30px por hora
- Permite visualizar toda a semana sem scroll
- Perfeito para planejamento semanal

## Características dos Modos Compactos

### Visual
- **Altura reduzida**: 30px por hora (vs 80px no modo normal)
- **Cards menores**: Padding reduzido, fontes menores
- **Informações essenciais**: Horário + nome do cliente (primeiro nome apenas)
- **Sem scroll vertical**: Toda a agenda cabe na tela

### Funcionalidades Mantidas
- ✅ Drag & drop de agendamentos
- ✅ Click para criar novo agendamento
- ✅ Popover com detalhes completos ao clicar no card
- ✅ Indicador de horário atual
- ✅ Cores por status
- ✅ Busca e filtros

### Diferenças nos Cards

**Modo Normal:**
- Altura mínima: 40px
- Mostra: Horário + Avatar + Nome completo + Serviço
- Padding: 8px (p-2)

**Modo Compacto:**
- Altura mínima: 20px
- Mostra: Horário + Primeiro nome (se houver espaço)
- Padding: 4px (p-1)
- Avatar removido para economizar espaço

## Como Usar

Os botões de visualização agora incluem:
- **Dia**: Visualização normal do dia com scroll
- **Dia Full**: Dia completo numa tela só
- **Semana**: Visualização normal da semana com scroll
- **Semana Full**: Semana completa numa tela só
- **Mês**: Visualização mensal (calendário)

## Casos de Uso

### Dia Full
- Recepcionista precisa ver rapidamente todos os horários disponíveis
- Verificar densidade de agendamentos do dia
- Identificar gaps na agenda

### Semana Full
- Planejamento semanal
- Comparar densidade entre dias
- Visão estratégica da semana

## Implementação Técnica

### Constantes
```typescript
const GRID_HOUR_HEIGHT = 80; // Modo normal
const GRID_HOUR_HEIGHT_COMPACT = 30; // Modo compacto
```

### Cálculo Dinâmico
As funções `getTopOffsetPx`, `getCurrentTimeOffsetPx` e `getHeightPx` agora verificam o modo de visualização e ajustam automaticamente a altura.

### Overflow
- Modo normal: `overflow-y-auto` (permite scroll)
- Modo compacto: `overflow-y-hidden` (sem scroll)

## Observações

- A funcionalidade de drag & drop funciona perfeitamente em ambos os modos
- Os popovers com detalhes completos continuam disponíveis
- A busca e filtros funcionam normalmente
- O indicador de horário atual se ajusta automaticamente

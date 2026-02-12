# Melhorias na Página de Caixa - Requirements

**Feature:** Cash Page Improvements
**Status:** Requirements Approved
**Created:** 2026-02-12
**Priority:** High

## 1. Overview

A página de Caixa atual apresenta limitações significativas na navegação temporal, visualização de transações agrupadas e contexto das movimentações. Este documento especifica melhorias para tornar o Livro Caixa mais intuitivo, informativo e funcional.

## 2. Problem Statement

### Problemas Identificados:

1. **Filtros de Data Limitados**
   - Apenas 3 opções fixas (Hoje, 7 Dias, Mês Atual)
   - Sem feedback visual do período ativo
   - Impossível navegar para meses/dias anteriores facilmente
   - Não há seletor de data customizado

2. **Visualização de Pagamentos Múltiplos**
   - Vendas com múltiplos métodos de pagamento aparecem como linhas separadas
   - Difícil identificar que pertencem à mesma transação
   - Sem agrupamento visual ou hierarquia

3. **Falta de Contexto**
   - Descrições genéricas sem nome do cliente/fornecedor
   - Sem link para transação original
   - Impossível ver detalhes completos da movimentação

4. **Navegação Temporal Deficiente**
   - Não permite ver períodos passados facilmente
   - Sem navegação tipo "< Anterior | Próximo >"
   - Difícil comparar períodos diferentes

5. **Filtros Insuficientes**
   - Não permite filtrar por tipo (Entrada/Saída)
   - Não permite filtrar por método de pagamento
   - Não permite buscar por cliente/fornecedor

## 3. User Stories

### US-1: Navegação Temporal Melhorada
**Como** usuário do sistema
**Quero** navegar facilmente entre diferentes períodos (dias, meses, anos)
**Para que** eu possa consultar o histórico financeiro de qualquer período

**Acceptance Criteria:**
- AC1.1: Sistema exibe botões "< Mês Anterior" e "Mês Próximo >"
- AC1.2: Sistema mostra claramente o período selecionado (ex: "Janeiro 2026")
- AC1.3: Usuário pode selecionar data customizada via calendário
- AC1.4: Filtros rápidos incluem: Hoje, Ontem, 7 Dias, 30 Dias, Mês Atual, Ano Atual
- AC1.5: Filtro ativo tem feedback visual (botão destacado)

### US-2: Agrupamento de Pagamentos por Venda
**Como** usuário do sistema
**Quero** ver pagamentos múltiplos da mesma venda agrupados
**Para que** eu possa entender facilmente transações com split payment

**Acceptance Criteria:**
- AC2.1: Vendas com múltiplos pagamentos aparecem como grupo expansível
- AC2.2: Linha principal mostra: Cliente, Total da Venda, Ícone de expansão
- AC2.3: Ao expandir, mostra cada método de pagamento com valor individual
- AC2.4: Troco é exibido quando aplicável
- AC2.5: Grupo tem visual diferenciado (borda, cor de fundo)
- AC2.6: Compras também são agrupadas quando têm múltiplos itens

### US-3: Detalhes e Contexto das Transações
**Como** usuário do sistema
**Quero** ver detalhes completos de cada movimentação
**Para que** eu possa auditar e entender cada transação

**Acceptance Criteria:**
- AC3.1: Cada movimentação tem botão "Ver Detalhes"
- AC3.2: Modal de detalhes mostra:
  - Cliente/Fornecedor
  - Data e hora completa
  - Método(s) de pagamento
  - Itens vendidos/comprados (se aplicável)
  - Observações
  - Link para venda/compra original
- AC3.3: Descrições incluem nome do cliente/fornecedor
- AC3.4: Link clicável para ir direto ao checkout/compra

### US-4: Filtros Avançados
**Como** usuário do sistema
**Quero** filtrar movimentações por múltiplos critérios
**Para que** eu possa encontrar transações específicas rapidamente

**Acceptance Criteria:**
- AC4.1: Filtro por tipo: Todas, Entradas, Saídas
- AC4.2: Filtro por método: Todos, PIX, Cartão, Dinheiro, Transferência
- AC4.3: Filtro por origem: Todas, Venda, Compra, Estorno, Manual, Crédito
- AC4.4: Busca por texto (cliente, fornecedor, descrição)
- AC4.5: Filtros podem ser combinados
- AC4.6: Contador mostra quantas movimentações correspondem aos filtros

### US-5: Seletor de Data com Calendário
**Como** usuário do sistema
**Quero** selecionar datas específicas usando um calendário visual
**Para que** eu possa consultar qualquer período de forma intuitiva

**Acceptance Criteria:**
- AC5.1: Botão "Selecionar Período" abre calendário
- AC5.2: Calendário permite selecionar data inicial e final
- AC5.3: Calendário destaca período selecionado
- AC5.4: Botão "Aplicar" confirma seleção
- AC5.5: Período customizado é exibido claramente (ex: "15/01 - 20/01/2026")

### US-6: Exportação e Relatórios
**Como** usuário do sistema
**Quero** exportar dados do caixa
**Para que** eu possa gerar relatórios externos e fazer backup

**Acceptance Criteria:**
- AC6.1: Botão "Exportar" disponível no topo da página
- AC6.2: Opções de exportação: PDF, Excel (CSV)
- AC6.3: Exportação inclui período selecionado e filtros ativos
- AC6.4: PDF formatado com logo, período, resumo e lista de movimentações
- AC6.5: Excel/CSV com todas as colunas para análise

### US-7: Resumo por Método de Pagamento
**Como** usuário do sistema
**Quero** ver resumo de entradas/saídas por método de pagamento
**Para que** eu possa entender a distribuição dos pagamentos

**Acceptance Criteria:**
- AC7.1: Card adicional mostra "Resumo por Método"
- AC7.2: Lista cada método com total de entradas
- AC7.3: Gráfico de pizza ou barras mostra distribuição visual
- AC7.4: Resumo respeita filtros de período ativos

## 4. Technical Requirements

### 4.1. Data Structure Changes
- Nenhuma mudança no banco de dados necessária
- Agrupamento feito no frontend baseado em `source_id` (sale_id)

### 4.2. New Components Needed
- `DateRangePicker` - Seletor de período com calendário
- `CashMovementGroup` - Componente para agrupar pagamentos
- `CashMovementDetails` - Modal com detalhes completos
- `CashFilters` - Barra de filtros avançados
- `PaymentMethodSummary` - Card com resumo por método
- `ExportDialog` - Modal para exportação

### 4.3. API/Use Cases
- Nenhuma mudança necessária nos use cases existentes
- Filtros aplicados no frontend sobre dados retornados

### 4.4. UI/UX Considerations
- Manter design glassmorphism consistente
- Animações suaves para expansão de grupos
- Feedback visual claro para filtros ativos
- Responsivo em mobile

## 5. Out of Scope (Future Enhancements)

- Gráficos de evolução temporal (linha do tempo)
- Comparação entre períodos
- Previsão de fluxo de caixa
- Integração com contabilidade externa
- Conciliação bancária automática
- Alertas de movimentações suspeitas

## 6. Success Metrics

- Redução de 50% no tempo para encontrar uma transação específica
- Aumento de 80% na clareza de vendas com múltiplos pagamentos
- 100% dos usuários conseguem navegar para meses anteriores
- Feedback positivo sobre facilidade de uso

## 7. Dependencies

- Biblioteca de calendário: `react-day-picker` (já disponível via shadcn/ui)
- Exportação PDF: `jspdf` ou `react-pdf`
- Exportação Excel: `xlsx` ou `papaparse` (CSV)

## 8. Timeline Estimate

- **Fase 1** (Filtros e Navegação): 1 dia
- **Fase 2** (Agrupamento): 1 dia
- **Fase 3** (Detalhes e Links): 1 dia
- **Fase 4** (Filtros Avançados): 1 dia
- **Fase 5** (Exportação): 1 dia
- **Fase 6** (Resumo por Método): 1 dia

**Total Estimado:** 6 dias de desenvolvimento

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance com muitas movimentações | Alto | Implementar paginação e virtualização |
| Complexidade do agrupamento | Médio | Testar com dados reais diversos |
| Exportação de grandes volumes | Médio | Limitar período de exportação |
| Compatibilidade mobile | Baixo | Testar em dispositivos reais |

## 10. Approval

- [x] Product Owner: Approved
- [ ] Tech Lead: Pending Review
- [ ] Design: Pending Review

---

**Next Steps:** Criar design document com implementação detalhada

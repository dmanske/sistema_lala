# 🗺️ Implementation Roadmap - Sistema Financeiro Completo

**Data de Criação:** 2026-02-12  
**Status:** Pronto para Execução  
**Estimativa Total:** 9-10 dias de desenvolvimento

---

## 📋 Visão Geral

Este documento consolida a ordem exata de execução de todas as tasks para implementar o sistema financeiro completo do Sistema Lala, incluindo:

1. **Sistema de Contas Bancárias** (bank-accounts) - 3-4 dias
2. **Melhorias na Página de Caixa** (cash-improvements) - 6 dias

**IMPORTANTE:** As tasks devem ser executadas na ordem apresentada, pois há dependências entre elas.

---

## 🎯 Fase 1: Sistema de Contas Bancárias (Dias 1-4)

### **Dia 1: Database e Domain Layer**

#### ✅ Task 1.1: Create bank_accounts table migration
**Arquivo:** `supabase/migrations/[timestamp]_create_bank_accounts.sql`

```sql
-- Criar tabela bank_accounts
-- Adicionar colunas: id, tenant_id, name, type, initial_balance, is_active, created_at, updated_at
-- Adicionar CHECK constraints para type
-- Criar índices para tenant_id
-- Configurar RLS policies
-- Adicionar trigger para updated_at
```

**Validação:** Migration aplica sem erros no Supabase

---

#### ✅ Task 1.2: Add bank_account_id column to cash_movements
**Arquivo:** `supabase/migrations/[timestamp]_add_bank_account_to_cash_movements.sql`

```sql
-- Adicionar coluna bank_account_id (nullable inicialmente)
-- Adicionar foreign key para bank_accounts
-- Criar índice em bank_account_id + occurred_at
```

**Validação:** Migration aplica sem erros

---

#### ✅ Task 1.3: Create default account migration
**Arquivo:** `supabase/migrations/[timestamp]_create_default_accounts.sql`

```sql
-- Inserir "Caixa Geral" para cada tenant
-- Atualizar cash_movements existentes para linkar à conta padrão
-- Tornar bank_account_id NOT NULL
```

**Validação:** Todas as movimentações existentes têm conta vinculada

---

#### ✅ Task 2.1: Create BankAccount domain model
**Arquivo:** `src/core/domain/BankAccount.ts`

```typescript
// Definir interfaces: BankAccount, BankAccountWithBalance, AccountStatement
// Exportar todos os tipos
```

**Validação:** Arquivo compila sem erros TypeScript

---

#### ✅ Task 2.2: Update CashMovement domain model
**Arquivo:** `src/core/domain/CashMovement.ts`

```typescript
// Adicionar campo bankAccountId (required)
```

**Validação:** Arquivo compila sem erros TypeScript

---

### **Dia 2: Repository e Use Cases**

#### ✅ Task 3.1: Create BankAccountRepository interface
**Arquivo:** `src/core/repositories/BankAccountRepository.ts`

```typescript
// Definir interface com todos os métodos
// create, update, deactivate, activate, getById, list, listWithBalances, getStatement, hasMovements
```

**Validação:** Interface definida corretamente

---

#### ✅ Task 3.2: Implement SupabaseBankAccountRepository
**Arquivo:** `src/infrastructure/repositories/supabase/SupabaseBankAccountRepository.ts`

```typescript
// Implementar create, update, deactivate, activate, getById, list
// Injetar tenant_id automaticamente
```

**Validação:** Testes unitários passam (se implementados)

---

#### ✅ Task 3.3: Implement balance calculation methods
**Arquivo:** `src/infrastructure/repositories/supabase/SupabaseBankAccountRepository.ts`

```typescript
// Implementar listWithBalances com cálculo de saldo
// Implementar getStatement com join de movements
// Calcular balance after transaction
// Implementar summary (initial, totalIn, totalOut, current)
```

**Validação:** Saldos calculados corretamente

---

#### ✅ Task 3.4: Implement hasMovements validation method
**Arquivo:** `src/infrastructure/repositories/supabase/SupabaseBankAccountRepository.ts`

```typescript
// Query cash_movements para verificar se existem movimentações
```

**Validação:** Retorna boolean correto

---

#### ✅ Task 4.1: Implement CreateBankAccountUseCase
**Arquivo:** `src/core/usecases/bank-accounts/CreateBankAccount.ts`

```typescript
// Validar name (1-100 chars, não vazio)
// Validar type (BANK, CARD, WALLET)
// Default initial_balance = 0
```

**Validação:** Validações funcionam corretamente

---

#### ✅ Task 4.3: Implement UpdateBankAccountUseCase
**Arquivo:** `src/core/usecases/bank-accounts/UpdateBankAccount.ts`

```typescript
// Permitir atualizar apenas name e type
// Validações de name e type
```

**Validação:** Update funciona, initial_balance não muda

---

#### ✅ Task 4.5: Implement DeactivateBankAccountUseCase
**Arquivo:** `src/core/usecases/bank-accounts/DeactivateBankAccount.ts`

```typescript
// Verificar se conta existe
// Chamar repository.deactivate
```

**Validação:** Conta é desativada, não deletada

---

#### ✅ Task 4.7: Implement ListBankAccountsUseCase
**Arquivo:** `src/core/usecases/bank-accounts/ListBankAccounts.ts`

```typescript
// Chamar repository.listWithBalances
// Suportar filtro isActive opcional
```

**Validação:** Lista retorna contas com saldos

---

#### ✅ Task 4.9: Implement GetAccountStatementUseCase
**Arquivo:** `src/core/usecases/bank-accounts/GetAccountStatement.ts`

```typescript
// Chamar repository.getStatement
// Suportar filtro de data
```

**Validação:** Extrato retorna movimentações corretas

---

### **Dia 3: Integração com Cash Movements e RPC Functions**

#### ✅ Task 5.1: Update CashMovementRepository interface
**Arquivo:** `src/core/repositories/CashMovementRepository.ts`

```typescript
// Adicionar bankAccountId ao método create (required)
// Adicionar bankAccountId aos filtros de list e getSummary
```

**Validação:** Interface atualizada

---

#### ✅ Task 5.2: Update SupabaseCashMovementRepository implementation
**Arquivo:** `src/infrastructure/repositories/supabase/SupabaseCashMovementRepository.ts`

```typescript
// Atualizar create para exigir bankAccountId
// Validar que conta existe e está ativa
// Atualizar list e getSummary com filtro de conta
```

**Validação:** Movimentações exigem conta válida

---

#### ✅ Task 6.1: Update pay_sale function
**Arquivo:** `supabase/migrations/[timestamp]_update_pay_sale_with_account.sql`

```sql
-- Adicionar parâmetro p_bank_account_id UUID (required)
-- Validar que conta existe e está ativa
-- Passar bank_account_id ao inserir cash_movements
```

**Validação:** Função atualizada, testes passam

---

#### ✅ Task 6.2: Update create_purchase_with_movements function
**Arquivo:** `supabase/migrations/[timestamp]_update_purchase_with_account.sql`

```sql
-- Adicionar parâmetro p_bank_account_id UUID (required)
-- Validar conta
-- Passar bank_account_id ao inserir cash_movements
```

**Validação:** Função atualizada

---

#### ✅ Task 6.3: Update add_client_credit function
**Arquivo:** `supabase/migrations/[timestamp]_update_credit_with_account.sql`

```sql
-- Adicionar parâmetro p_bank_account_id UUID (required)
-- Validar conta
-- Passar bank_account_id ao inserir cash_movements
```

**Validação:** Função atualizada

---

#### ✅ **CHECKPOINT 1:** Ensure backend tests pass
- Rodar migrations no Supabase
- Testar criação de conta
- Testar criação de movimentação com conta
- Verificar validações

---

### **Dia 4: UI Components e Integração**

#### ✅ Task 8.1: Create AccountSelector component
**Arquivo:** `src/components/bank-accounts/AccountSelector.tsx`

```typescript
// Usar shadcn/ui Select
// Carregar contas ativas com saldos
// Exibir nome + saldo formatado (R$ 1.234,56)
```

**Validação:** Componente renderiza e seleciona conta

---

#### ✅ Task 9.1: Create BankAccountsList component
**Arquivo:** `src/components/bank-accounts/BankAccountsList.tsx`

```typescript
// Tabela com colunas: name, type, balance, status
// Ações: edit, deactivate/activate
// Glassmorphism design
```

**Validação:** Lista exibe contas corretamente

---

#### ✅ Task 9.2: Create BankAccountDialog component
**Arquivo:** `src/components/bank-accounts/BankAccountDialog.tsx`

```typescript
// Formulário create/edit
// Campos: name, type, initial_balance (apenas create)
// react-hook-form + validações
```

**Validação:** Formulário valida e salva

---

#### ✅ Task 10.1: Create AccountStatementView component
**Arquivo:** `src/components/bank-accounts/AccountStatementView.tsx`

```typescript
// Detalhes da conta no topo
// Filtro de data (start, end)
// Tabela de movimentações
// Card de resumo (initial, totalIn, totalOut, current)
```

**Validação:** Extrato exibe movimentações

---

#### ✅ Task 10.2: Add charts to AccountStatementView (OPTIONAL)
**Arquivo:** `src/components/bank-accounts/AccountStatementView.tsx`

```typescript
// Gráfico de linha: Evolução do saldo ao longo do tempo
// Gráfico de barras: Entradas vs Saídas por período
// Gráfico de pizza: Distribuição por tipo de movimentação
// Usar recharts (já instalado)
// Charts respeitam filtro de data
```

**Validação:** Gráficos aparecem e atualizam com filtros

---

#### ✅ Task 11.1: Create bank accounts list page
**Arquivo:** `src/app/(app)/contas/page.tsx`

```typescript
// Usar BankAccountsList
// Botão "Nova Conta"
// Handlers para create, update, deactivate
```

**Validação:** Página funciona end-to-end

---

#### ✅ Task 11.2: Create account detail/statement page
**Arquivo:** `src/app/(app)/contas/[id]/page.tsx`

```typescript
// Usar AccountStatementView
// Carregar dados da conta e extrato
// Botão voltar
```

**Validação:** Página de extrato funciona

---

#### ✅ Task 12.1: Update PaymentDialog component
**Arquivo:** `src/components/sales/PaymentDialog.tsx`

```typescript
// Adicionar AccountSelector para cada método de pagamento
// Tornar seleção obrigatória
// Passar bank_account_id para pay_sale
```

**Validação:** Checkout exige seleção de conta

---

#### ✅ Task 13.1: Update purchase payment form
**Arquivo:** `src/components/purchases/PurchaseForm.tsx` (ou equivalente)

```typescript
// Adicionar AccountSelector
// Tornar obrigatório
// Passar bank_account_id para create_purchase_with_movements
```

**Validação:** Compra exige seleção de conta

---

#### ✅ Task 14.1: Update credit recharge dialog
**Arquivo:** `src/components/clients/RegisterCreditDialog.tsx`

```typescript
// Adicionar AccountSelector
// Tornar obrigatório
// Passar bank_account_id para add_client_credit
```

**Validação:** Recarga exige seleção de conta

---

#### ✅ Task 15.1: Update manual cash movement dialog
**Arquivo:** `src/components/cash/NewTransactionDialog.tsx`

```typescript
// Adicionar AccountSelector
// Tornar obrigatório
// Passar bank_account_id ao criar movimento
```

**Validação:** Movimento manual exige conta

---

#### ✅ Task 16.1: Update cash movements list to show account
**Arquivo:** `src/components/cash/CashList.tsx`

```typescript
// Adicionar coluna "Conta"
// Adicionar filtro por conta
```

**Validação:** Lista mostra conta de cada movimento

---

#### ✅ Task 17.1: Add bank accounts to navigation menu
**Arquivo:** `src/components/layout/Navigation.tsx` (ou equivalente)

```typescript
// Adicionar item "Contas" linkando para /contas
// Ícone apropriado (Wallet ou Building)
```

**Validação:** Menu tem link para contas

---

#### ✅ **CHECKPOINT 2:** Integration testing
- Criar nova conta bancária
- Processar venda com seleção de conta
- Registrar compra com seleção de conta
- Adicionar crédito com seleção de conta
- Criar movimento manual com seleção de conta
- Ver extrato da conta
- Filtrar movimentações por conta
- Desativar conta
- Verificar que conta inativa não recebe novos movimentos

---

## 🎯 Fase 2: Melhorias na Página de Caixa (Dias 5-10)

### **Dia 5: Enhanced Date Navigation**

#### ✅ Task 1.1: Create DateNavigator component
**Arquivo:** `src/components/cash/DateNavigator.tsx`

```typescript
// Exibição de mês/ano (ex: "Janeiro 2026")
// Botões Previous/Next month
// useRouter + useSearchParams para URL
```

**Validação:** Navegação de mês funciona

---

#### ✅ Task 1.2: Implement quick filter buttons
**Arquivo:** `src/components/cash/DateNavigator.tsx`

```typescript
// Botões: Hoje, Ontem, 7 Dias, 30 Dias, Mês Atual, Ano Atual
// Highlight do filtro ativo
// Calcular ranges com date-fns
```

**Validação:** Filtros rápidos funcionam

---

#### ✅ Task 1.3: Integrate date range picker
**Arquivo:** `src/components/cash/DateNavigator.tsx`

```typescript
// Botão "Selecionar Período"
// shadcn/ui Calendar (react-day-picker)
// Seleção de range (start, end)
// Botão "Aplicar"
```

**Validação:** Seleção customizada funciona

---

#### ✅ Task 1.5: Update cash page to use DateNavigator
**Arquivo:** `src/app/(app)/cash/page.tsx`

```typescript
// Substituir DateFilter por DateNavigator
// Passar start/end dates como props
```

**Validação:** Página usa novo navegador

---

### **Dia 6: Payment Grouping**

#### ✅ Task 2.1: Create grouping utility function
**Arquivo:** `src/lib/cash/groupMovements.ts`

```typescript
// Agrupar por sourceId
// Apenas SALE e PURCHASE com múltiplos pagamentos
// Retornar array misto (MovementGroup | CashMovement)
// Ordenar por data (mais recente primeiro)
```

**Validação:** Agrupamento funciona corretamente

---

#### ✅ Task 2.3: Create CashMovementGroup component
**Arquivo:** `src/components/cash/CashMovementGroup.tsx`

```typescript
// Header expansível com cliente/fornecedor, total, ícone
// Estados collapsed/expanded
// Linhas filhas com indentação
// Mostrar troco quando aplicável
// Visual diferenciado (borda, background)
```

**Validação:** Grupo expande/colapsa

---

#### ✅ Task 2.4: Fetch customer/supplier names for groups
**Arquivo:** `src/lib/cash/fetchNames.ts` (ou dentro do componente)

```typescript
// Helper para buscar nome do cliente por sale_id
// Helper para buscar nome do fornecedor por purchase_id
// Tratar dados faltantes ("Cliente não encontrado")
// Cache de nomes
```

**Validação:** Nomes aparecem nos grupos

---

#### ✅ Task 2.6: Refactor CashList to handle grouped movements
**Arquivo:** `src/components/cash/CashList.tsx`

```typescript
// Aceitar dados agrupados
// Renderizar CashMovementGroup para grupos
// Renderizar linhas normais para singles
// Adicionar coluna "Conta"
```

**Validação:** Lista mostra grupos e conta

---

#### ✅ **CHECKPOINT 3:** Verify grouping and navigation
- Testar navegação de datas
- Testar agrupamento de pagamentos múltiplos
- Verificar exibição de contas

---

### **Dia 7: Transaction Details**

#### ✅ Task 4.1: Create CashMovementDetailsDialog component
**Arquivo:** `src/components/cash/CashMovementDetailsDialog.tsx`

```typescript
// shadcn/ui Dialog
// Exibir: cliente/fornecedor, data/hora, método, valor, itens, notas
// Link clicável para venda/compra original
```

**Validação:** Modal mostra detalhes completos

---

#### ✅ Task 4.2: Add "Ver Detalhes" button to movement rows
**Arquivo:** `src/components/cash/CashList.tsx`

```typescript
// Botão em cada linha
// onClick abre dialog
// Passar movimento selecionado
```

**Validação:** Botão abre modal

---

#### ✅ Task 4.3: Enhance movement descriptions
**Arquivo:** `src/lib/cash/enrichDescriptions.ts`

```typescript
// Utility para enriquecer descrições
// Buscar nome cliente/fornecedor por sourceId
// Formato: "Venda - João Silva"
// Tratar nomes faltantes
```

**Validação:** Descrições incluem nomes

---

### **Dia 8: Advanced Filters**

#### ✅ Task 5.1: Create CashFilters component
**Arquivo:** `src/components/cash/CashFilters.tsx`

```typescript
// Estado: type, method, source, searchText, bankAccountId
// UI: dropdowns/button groups
// AccountSelector para filtro por conta
// Text search com debounce (300ms)
// Contador de resultados
// Botão "Limpar Filtros"
```

**Validação:** Filtros funcionam

---

#### ✅ Task 5.2: Implement filtering logic
**Arquivo:** `src/lib/cash/filterMovements.ts`

```typescript
// Filtro por type (ALL, IN, OUT)
// Filtro por method (ALL, CASH, PIX, CARD, TRANSFER, WALLET)
// Filtro por source (ALL, SALE, REFUND, PURCHASE, MANUAL)
// Filtro por account (ALL, ou ID específico)
// Text search (case-insensitive)
// Combinar com AND logic
// useMemo para performance
```

**Validação:** Filtros combinam corretamente

---

#### ✅ Task 5.4: Integrate filters with CashList
**Arquivo:** `src/app/(app)/cash/page.tsx`

```typescript
// Incluir CashFilters
// Passar movements para filtros
// CashList recebe filtered movements
// Agrupamento funciona com dados filtrados
```

**Validação:** Filtros integrados

---

#### ✅ **CHECKPOINT 4:** Verify filtering functionality
- Testar cada filtro individualmente
- Testar combinação de filtros
- Verificar contador de resultados

---

### **Dia 9: Export Functionality**

#### ✅ Task 7.1: Install export dependencies
**Arquivo:** `package.json`

```bash
npm install jspdf jspdf-autotable papaparse
npm install -D @types/papaparse
```

**Validação:** Dependências instaladas

---

#### ✅ Task 7.2: Create ExportButton component
**Arquivo:** `src/components/cash/ExportButton.tsx`

```typescript
// Dropdown menu: PDF, Excel/CSV
// Lazy loading (dynamic imports)
// Loading state
// Trigger browser download
```

**Validação:** Botão funciona

---

#### ✅ Task 7.3: Implement PDF export
**Arquivo:** `src/lib/cash/exportToPDF.ts`

```typescript
// jspdf + jspdf-autotable
// Logo (se disponível)
// Header com período
// Resumo (totalIn, totalOut, balance)
// Resumo por conta (breakdown)
// Tabela de movimentações (incluindo coluna conta)
// Formato brasileiro (R$ 1.234,56)
```

**Validação:** PDF gerado corretamente

---

#### ✅ Task 7.4: Implement CSV export
**Arquivo:** `src/lib/cash/exportToCSV.ts`

```typescript
// papaparse
// Colunas: date, time, description, method, source, type, amount, account
// Delimitador: ponto-e-vírgula
// Datas: DD/MM/YYYY
// Valores: vírgula como decimal
```

**Validação:** CSV gerado corretamente

---

#### ✅ Task 7.7: Add ExportButton to CashHeader
**Arquivo:** `src/components/cash/CashHeader.tsx`

```typescript
// Adicionar ExportButton ao lado dos botões de transação
// Passar filtered movements, summary, period
```

**Validação:** Exportação funciona na página

---

### **Dia 10: Payment Method and Account Summary**

#### ✅ Task 8.1: Install chart library
**Arquivo:** `package.json`

```bash
npm install recharts
```

**Validação:** Biblioteca instalada

---

#### ✅ Task 8.2: Create PaymentMethodSummary component
**Arquivo:** `src/components/cash/PaymentMethodSummary.tsx`

```typescript
// Card com glassmorphism
// Lista de métodos com totais
// Bar chart ou pie chart (recharts)
// Respeita filtered movements
```

**Validação:** Card mostra resumo por método

---

#### ✅ Task 8.3: Create AccountSummary component
**Arquivo:** `src/components/cash/AccountSummary.tsx`

```typescript
// Card com glassmorphism
// Lista de contas com totais (IN, OUT, balance)
// Bar chart mostrando balance por conta
// Respeita filtered movements
// Link para extrato (/contas/[id])
```

**Validação:** Card mostra resumo por conta

---

#### ✅ Task 8.4: Implement aggregation logic
**Arquivo:** `src/lib/cash/aggregateByMethod.ts`

```typescript
// Agrupar por payment method
// Calcular total por método (sum de IN)
// Ordenar por total (maior primeiro)
```

**Validação:** Agregação correta

---

#### ✅ Task 8.5: Implement account aggregation logic
**Arquivo:** `src/lib/cash/aggregateByAccount.ts`

```typescript
// Agrupar por bank account
// Calcular totalIn, totalOut, balance por conta
// Ordenar por balance (maior primeiro)
```

**Validação:** Agregação por conta correta

---

#### ✅ Task 8.8: Add summary components to cash page
**Arquivo:** `src/app/(app)/cash/page.tsx`

```typescript
// Adicionar PaymentMethodSummary abaixo de CashSummaryCards
// Adicionar AccountSummary abaixo de PaymentMethodSummary
// Passar filtered movements para ambos
// Layout responsivo (grid)
```

**Validação:** Ambos os cards aparecem

---

### **Final Integration and Polish**

#### ✅ Task 9.1: Update cash page with all components
**Arquivo:** `src/app/(app)/cash/page.tsx`

```typescript
// Integrar todos os novos componentes
// Verificar data flow server → client
// Testar URL params
// Verificar glassmorphism consistency
```

**Validação:** Página completa funciona

---

#### ✅ Task 9.2: Add error boundaries and loading states
**Arquivos:** Vários componentes

```typescript
// Error boundary para client components
// Loading skeletons
// Toast notifications para erros
// Tratar edge cases (empty data, network errors)
```

**Validação:** Erros tratados gracefully

---

#### ✅ Task 9.3: Responsive design verification
**Teste Manual:**

- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)
- Filtros colapsáveis em mobile
- Tabelas com scroll horizontal

**Validação:** Responsivo em todos os tamanhos

---

#### ✅ **CHECKPOINT 5:** Complete testing and review
- Testar fluxo completo de filtros
- Testar exportação (PDF e CSV)
- Testar navegação de datas
- Testar agrupamento com filtros
- Verificar integração com contas em todos os lugares

---

## 📊 Atualização de Documentação

### ✅ Task FINAL-1: Update PRD
**Arquivo:** `docs/PRD_LALA_TESTSPRITE.md`

**Adicionar:**
- Seção sobre Sistema de Contas Bancárias
- Atualizar seção de Gestão Financeira
- Adicionar melhorias do Caixa ao changelog
- Atualizar versão para 2.2

---

### ✅ Task FINAL-2: Update Inventory
**Arquivo:** `INVENTARIO_COMPLETO.md`

**Adicionar:**
- Nova seção "SISTEMA DE CONTAS BANCÁRIAS (V2.4)"
- Atualizar seção "MELHORIAS DO CAIXA (V2.4)"
- Listar todas as novas funcionalidades
- Atualizar versão para V2.4

---

## 📈 Resumo de Progresso

### Fase 1: Sistema de Contas Bancárias
- [ ] Dia 1: Database e Domain Layer (8 tasks)
- [ ] Dia 2: Repository e Use Cases (9 tasks)
- [ ] Dia 3: Integração Cash Movements e RPC (6 tasks)
- [ ] Dia 4: UI Components e Integração (11 tasks)

**Total Fase 1:** 34 tasks principais

### Fase 2: Melhorias do Caixa
- [ ] Dia 5: Enhanced Date Navigation (4 tasks)
- [ ] Dia 6: Payment Grouping (4 tasks)
- [ ] Dia 7: Transaction Details (3 tasks)
- [ ] Dia 8: Advanced Filters (3 tasks)
- [ ] Dia 9: Export Functionality (5 tasks)
- [ ] Dia 10: Summaries (6 tasks)
- [ ] Final: Integration and Polish (3 tasks)

**Total Fase 2:** 28 tasks principais

### Documentação
- [ ] Atualizar PRD
- [ ] Atualizar Inventário

**Total Geral:** 64 tasks principais

---

## 🎯 Como Usar Este Documento

1. **Siga a ordem exata** - As tasks têm dependências
2. **Marque cada task como completa** - Use os checkboxes
3. **Valide cada task** - Critérios de validação estão descritos
4. **Não pule checkpoints** - Eles garantem que tudo está funcionando
5. **Peça ajuda quando travar** - Mencione o número da task

---

## 🚀 Começar Agora

Para iniciar a implementação, diga:

```
"Executar Task 1.1"
```

Ou para executar todas as tasks de um dia:

```
"Executar todas as tasks do Dia 1"
```

Ou para executar tudo automaticamente:

```
"Executar todas as tasks do roadmap"
```

---

**Boa sorte! 🎉**


---

## 📊 Tasks Opcionais de Analytics (Gráficos)

### Task 10.2: Add charts to AccountStatementView (OPTIONAL)
**Arquivo:** `src/components/bank-accounts/AccountStatementView.tsx`

**Gráficos:**
- Linha: Evolução do saldo ao longo do tempo
- Barras: Entradas vs Saídas por período (dia/semana/mês)
- Pizza: Distribuição por tipo de movimentação (vendas, compras, etc)

**Validação:** Gráficos aparecem e atualizam com filtros de data

---

### Task 16.3: Add financial analytics to client profile (OPTIONAL)
**Arquivo:** `src/app/(app)/clients/[id]/page.tsx`

**Gráficos:**
- Linha: Gastos ao longo do tempo
- Barras: Serviços mais consumidos
- Pizza: Distribuição serviços vs produtos
- Linha: Evolução do saldo de crédito

**Validação:** Gráficos aparecem na aba "Visão Geral" ou nova aba "Analytics"

---

### Task 16.4: Add financial analytics to supplier profile (OPTIONAL)
**Arquivo:** `src/app/(app)/suppliers/[id]/page.tsx`

**Gráficos:**
- Linha: Compras ao longo do tempo
- Barras: Produtos mais comprados deste fornecedor
- Linha: Evolução do gasto total

**Validação:** Gráficos aparecem na página do fornecedor

---

**Nota:** Todas as tasks de analytics são OPCIONAIS e usam a biblioteca recharts que já será instalada para as melhorias do Caixa. Podem ser implementadas após o sistema básico estar funcionando.


# 📋 INVENTÁRIO COMPLETO DO SISTEMA LALA
**Data:** 13/02/2026
**Status:** CONSOLIDADO V2.6.0 (13/02/2026) - ESTATÍSTICAS E GRÁFICOS DE CLIENTES IMPLEMENTADOS + EXTRATO DE CONTA MELHORADO + UPLOAD DE FOTO DO CLIENTE + SISTEMA FINANCEIRO EM DESENVOLVIMENTO

---

## 🎯 VISÃO GERAL

Sistema de gestão para salão de beleza desenvolvido em **Next.js 15** com **TypeScript**, com backend **Supabase** ativo (PostgreSQL).
- **Persistência:** Repositórios Supabase 100% migrados e operacionais em Multi-Tenant.
- **Autenticação:** Supabase Auth SSR com Middleware (`proxy.ts`), Context API (`AuthProvider`), e RLS (Row Level Security) validado por Tenant.

**Arquitetura:** Clean Architecture com separação clara entre domínio, casos de uso, repositórios e infraestrutura.

## 📏 DIRETRIZES E REGRAS GLOBAIS

### UI/UX e Design
- **Responsividade:** Mobile-first, sem scroll horizontal em nenhuma resolução. Sidebar vira Drawer/Sheet no mobile.
- **Interação:** Proibido uso de janelas nativas (`alert`, `confirm`, `prompt`). Usar Dialogs/Toasts do shadcn/ui.
- **Formatação:** Padrão brasileiro (R$, DD/MM/AAAA, (XX) XXXXX-XXXX). Timezone correto.

### Desenvolvimento
- **Padrão de Código:** Clean Architecture (Domain, UseCases, Repositories).
- **Fases de Módulo:** Cadastro -> Ações -> Integrações -> Validação.
- **Qualidade:** Limpeza constante de código morto e mocks deprecated.
- **Skills:** Utilizar biblioteca (`~/.agent/skills`) e workflow `/consult-skills` para padrões.

---

## 🏗️ DECISÕES ESTRUTURAIS DEFINIDAS

### 1. Navegação e Sidebar
- **Fornecedores:** Localizado em **Financeiro > Compras** (Decisão Oficial).
  - O menu "Compras" agrupa a gestão de aquisições e a base de fornecedores.
  - Não deve constar em "Pessoas".

### 2. Estoque e Produtos
- **Fonte de Verdade:** As **Movimentações (`ProductMovement`)** são a única fonte de verdade auditável do sistema.
- **currentStock:** O campo na entidade `Product` atua exclusivamente como **CACHE DE LEITURA** para performance.
  - Deve ser atualizado atomicamente a cada movimentação.
- **Relacionamento:** Produto e Fornecedor são independentes. Vínculo apenas na Compra.

### 3. Agenda e Conflitos
- **Overbooking:** PERMITIDO. O sistema aceita múltiplos agendamentos no mesmo horário (encaixes/múltiplos profissionais).
- **Bloqueios:** RESTRITIVOS. Horários com status `BLOCKED` impedem novos agendamentos.

---

## 🧭 ESTRUTURA OFICIAL DA SIDEBAR

> A estrutura abaixo é a definição canônica de produto.

### 1. OPERAÇÃO
- **Dashboard** (`/dashboard`)
- **Agenda** (`/agenda`)
- **Caixa** (`/cash`)

### 2. PESSOAS
- **Clientes** (`/clients`)
- **Profissionais** (`/professionals`)

### 3. CATÁLOGO
- **Serviços** (`/services`)
- **Produtos** (`/products`)

---

## 📦 MÓDULOS REMOVIDOS DO ESCOPO

Os seguintes módulos foram removidos da estrutura do sistema:

### ❌ COMISSÕES
**Status:** Removido do escopo  
**Motivo:** Funcionalidade simplificada. O sistema mantém apenas o campo de comissão percentual no cadastro de Profissionais e Serviços, sem módulo dedicado para gestão e pagamento de comissões.

**O que foi planejado mas não será implementado:**
- Relatórios de comissões por profissional
- Histórico de pagamentos de comissões
- Cálculo automático de comissões a pagar
- Gestão de períodos de comissionamento

**Alternativa:** Comissões são registradas como percentual nos cadastros de Profissionais e Serviços, e podem ser calculadas manualmente através dos relatórios de vendas.

### ❌ SISTEMA (Configurações Avançadas)
**Status:** Removido do escopo  
**Motivo:** Configurações essenciais foram integradas nos módulos existentes. Configurações avançadas de sistema foram adiadas para versões futuras.

**O que foi planejado mas não será implementado:**
- Relatórios avançados customizáveis
- Configurações gerais do sistema
- Cadastros gerais (categorias, tags, etc)
- Gestão de permissões e roles avançadas

**Alternativa:** Configurações básicas estão disponíveis nos próprios módulos (ex: status de clientes, tipos de conta bancária, etc).

---

## 📦 MÓDULOS EXISTENTES

### 0. **AUTENTICAÇÃO** ✅ Completo (NOVO)
**Status:** Implementado e funcional (SSR)
**Localização:** `/login`, `/signup`, `src/lib/supabase`

#### O que está implementado:
- ✅ **Login:** Email/Senha com validação server-side com design glassmorphism
- ✅ **Signup:** Criação de conta + Criação automática de Tenant e Profile (Transação Atômica via RPC)
- ✅ **Logout:** Server Action para destruir sessão
- ✅ **Middleware:** Proteção de rotas privadas e refresh de token (SSR)
- ✅ **Contexto:** `AuthProvider` global expondo User, Profile, Role e TenantId
- ✅ **RLS:** Policies de segurança ativas no banco de dados

### 1. **CLIENTES** ✅ Completo + Estatísticas Avançadas
**Status:** Implementado e funcional com análise completa  
**Localização:** `/clients`  
**Última atualização:** 13/02/2026 - Estatísticas e gráficos implementados

#### O que está implementado:
- ✅ Listagem de clientes (grid padrão e tabela)
- ✅ Busca por nome/telefone
- ✅ Filtro por status (ACTIVE, INACTIVE, ATTENTION)
- ✅ Colunas extras: Última Visita e Próximo Agendamento (Calculados)
- ✅ Paginação (10 itens por página)
- ✅ Criação de novo cliente
- ✅ Edição de cliente
- ✅ Exclusão de cliente (com validação de histórico)
- ✅ Perfil detalhado do cliente com 4 abas:
  - **Visão Geral:** ⭐ COMPLETO COM ESTATÍSTICAS E GRÁFICOS
    - 8 cards de métricas principais:
      - Total Gasto (Lifetime Value)
      - Total de Visitas
      - Ticket Médio
      - Frequência Média (dias entre visitas)
      - Gasto em Produtos
      - Cancelamentos
      - Cliente Desde (dias como cliente)
      - Última Visita (dias atrás)
    - Card especial: Próximo Agendamento (quando existe)
    - Sistema de Alertas (3 tipos):
      - Cliente Inativo (30+ dias sem visita) - Warning
      - Aniversário Próximo (7 dias) ou Hoje - Info
      - Saldo de Crédito Negativo - Error
    - Gráficos Interativos (Recharts):
      - Evolução de Gastos (últimos 6 meses) - Linha
      - Top 5 Serviços Mais Consumidos - Barras
      - Top 5 Produtos Mais Comprados - Barras
    - Últimos 5 serviços realizados
  - **Histórico:** Lista de agendamentos passados com status e valores
  - **Crédito:** Movimentações de crédito (adicionar/debitar)
  - **Produtos:** Produtos consumidos pelo cliente
- ✅ Saldo de crédito visível com **destaque vermelho para Fiado/Dívida**
- ✅ Ação rápida de agendamento direto do perfil
- ✅ Campo destacado de "Observações Gerais"
- ✅ Aba "Histórico" (antiga Agenda) com detalhes financeiros
- ✅ Design responsivo premium
- ✅ **Upload de foto funcional com Supabase Storage:**
  - Componente PhotoUpload com preview circular
  - Validação de tipo (JPG, PNG, WEBP) e tamanho (máximo 2MB)
  - Upload para bucket isolado por tenant
  - API route segura com autenticação
  - Exibição da foto no avatar do perfil
  - Fallback com iniciais quando não há foto

#### Campos do cadastro:
```typescript
{
  id: string
  name: string (obrigatório)
  birthDate: string (opcional, formato YYYY-MM-DD)
  phone?: string
  whatsapp?: string
  city: string (obrigatório)
  notes?: string
  photoUrl?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ATTENTION'
  createdAt: string
  creditBalance: number (calculado, read-only)
  hasHistory: boolean (mock flag)
}
```

#### O que NÃO está implementado:
- ❌ Integração com WhatsApp
- ❌ Card de Aniversariantes no Dashboard
- ❌ Filtro de aniversariantes na listagem
- ❌ Exportação de dados
- ❌ Importação em massa
- ❌ Tags e categorias
- ❌ Histórico de comunicações
- ❌ Sistema de indicações
- ❌ Fotos antes/depois

---

### 2. **PRODUTOS** ✅ Completo
**Status:** Implementado e funcional  
**Localização:** `/products`

#### O que está implementado:
- ✅ Listagem de produtos (grid e tabela)
- ✅ Busca por nome
- ✅ Toggle entre visualização grid/lista
- ✅ Criação de produto
- ✅ Edição de produto
- ✅ Exclusão de produto
- ✅ Perfil detalhado do produto com:
  - Informações financeiras (custo, preço, lucro, margem, comissão)
  - Estoque atual
  - Histórico de movimentações (IN/OUT)
- ✅ Movimentação de estoque (entrada/saída)
- ✅ Alertas de estoque crítico (quando <= minStock)
- ✅ Cálculo automático de lucro e margem
- ✅ Integração com Histórico de Compras (links nas movimentações)
- ✅ PDV (Ponto de Venda) - rota `/products/pos`

#### Campos do cadastro:
```typescript
{
  id: string
  name: string (obrigatório)
  cost: number (custo)
  profitAmount: number (lucro em R$)
  profitPercentage: number (% de lucro)
  price: number (preço de venda)
  commission: number (comissão)
  netValue?: number (valor líquido)
  minStock: number (estoque mínimo)
  currentStock: number (calculado via movimentações)
  lastMovement?: string (data ISO)
  createdAt: string
  updatedAt?: string
}
```

#### Movimentações de Estoque:
```typescript
{
  id: string
  productId: string
  type: 'IN' | 'OUT'
  quantity: number
  reason: string (ex: "Compra", "Ajuste", "Uso em Atendimento")
  referenceId?: string (ID do agendamento ou compra)
  referenceType?: 'APPOINTMENT' | 'ADJUSTMENT' | 'PURCHASE' | 'REFUND'
  date: string (ISO)
}
```

#### O que NÃO está implementado:
- ❌ Código de barras
- ❌ Categorias de produtos
- ❌ Vínculo de Fornecedor Padrão (embora exista o módulo de Compras)
- ❌ Controle de lote/validade
- ❌ Relatórios de vendas por produto

---

### 3. **SERVIÇOS** ✅ Completo
**Status:** Implementado e funcional  
**Localização:** `/services`

#### O que está implementado:
- ✅ Listagem de serviços (grid e tabela)
- ✅ Busca por nome
- ✅ Toggle entre visualização grid/lista
- ✅ Criação de serviço
- ✅ Edição de serviço
- ✅ Exclusão de serviço (com Diálogo de segurança ✅)
- ✅ Cálculo automático de lucro e margem
- ✅ Exibição de duração e comissão

#### Campos do cadastro:
```typescript
{
  id: string
  name: string (obrigatório)
  duration: number (minutos, obrigatório)
  cost: number (custo)
  profitAmount: number (lucro em R$)
  profitPercentage: number (% de lucro)
  price: number (preço de venda)
  commission: number (comissão)
  netValue?: number (valor líquido calculado)
  createdAt: string
  updatedAt?: string
}
```

#### O que NÃO está implementado:
- ❌ Categorias de serviços
- ❌ Profissionais específicos por serviço
- ❌ Página de perfil/detalhes do serviço
- ❌ Histórico de execuções
- ❌ Avaliações/feedback

---

---

### 4. **FORNECEDORES** ✅ Completo
**Status:** Implementado e funcional
**Localização:** `/suppliers`

#### O que está implementado:
- ✅ Listagem de fornecedores (grid e tabela)
- ✅ Busca por nome/CNPJ/email
- ✅ Filtro por status (ACTIVE, INACTIVE)
- ✅ Criação de fornecedor
- ✅ Edição de fornecedor
- ✅ Exclusão de fornecedor (com validação de compras vinculadas)
- ✅ Perfil detalhado do fornecedor com:
  - Dados de contato e fiscais
  - Histórico de compras (aba)
  - Estatísticas de total comprado
- ✅ Integração com módulo de Compras

#### Campos do cadastro:
```typescript
{
  id: string
  name: string (obrigatório)
  cnpj?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  notes?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}
```

---

### 5. **COMPRAS** ✅ Funcional → 🔄 Melhorias Propostas
**Status:** Implementado e operacional, com melhorias identificadas  
**Localização:** `/purchases`

#### O que está implementado:
- ✅ Listagem de compras (tabela) com filtro por fornecedor/ID
- ✅ Registro de nova compra (Master-Detail):
  - Seleção de fornecedor
  - Adição dinâmica de múltiplos produtos
  - Definição de quantidade e custo unitário
  - Cálculo automático de totais
- ✅ Visualização de detalhes da compra (read-only)
- ✅ **Integração com Estoque:** Criação automática de movimentações de entrada (IN) ao registrar compra
- ✅ Link reverso de movimentação de produto para detalhes da compra
- ✅ **Registro de Pagamento Imediato:**
  - Checkbox "Registrar Pagamento"
  - Seleção de forma de pagamento
  - Seleção de conta bancária de origem
  - Gera saída automática no caixa
- ✅ Observações opcionais
- ✅ Avatar do fornecedor com iniciais
- ✅ Loading states e empty states

#### Campos do cadastro:
```typescript
{
  id: string
  supplierId: string
  date: string (YYYY-MM-DD)
  items: PurchaseItem[]
  total: number (calculado)
  notes?: string
  
  // Payment info
  paymentMethod?: "CASH" | "PIX" | "CARD" | "TRANSFER" | "WALLET"
  paidAmount?: number
  paidAt?: string (ISO)
  
  createdAt: string
  updatedAt: string
}

PurchaseItem {
  productId: string
  quantity: number
  unitCost: number
}
```

#### O que NÃO está implementado (Gaps Identificados):

**PRIORIDADE ALTA (Essencial):**
- ❌ **Gestão de Pagamentos Parciais:**
  - Status de pagamento (PENDING, PARTIAL, PAID)
  - Múltiplos pagamentos para mesma compra
  - Histórico de pagamentos
  - Filtro por status de pagamento
  - Card "Contas a Pagar" no dashboard
  - Ação "Registrar Pagamento" em compras pendentes
- ❌ **Edição de Compras:**
  - Botão "Editar" na página de detalhes
  - Permitir alterar data, observações, itens
  - Ajuste automático de estoque ao editar
  - Validações de integridade
- ❌ **Exclusão de Compras:**
  - Botão "Excluir" com confirmação
  - Reversão de movimentações de estoque
  - Reversão de pagamentos no caixa
  - Soft delete

**PRIORIDADE MÉDIA (Melhoria de Experiência):**
- ❌ **Filtros Avançados:**
  - Filtro por período (date range)
  - Filtro por fornecedor (dropdown)
  - Filtro por status de pagamento
  - Filtro por faixa de valor
  - Ordenação customizável
- ❌ **Estatísticas e Análises:**
  - Cards de resumo (total gasto, quantidade, ticket médio)
  - Gráfico de gastos por fornecedor
  - Gráfico de evolução temporal
  - Comparação entre períodos
- ❌ **Previsão de Reposição:**
  - Cálculo de consumo médio
  - Ponto de pedido por produto
  - Sugestão de quantidade a comprar
  - Lista de "Produtos para Repor"

**PRIORIDADE BAIXA (Nice to Have):**
- ❌ Comparação de preços entre fornecedores
- ❌ Templates de compras recorrentes
- ❌ Importação de NF-e (XML)
- ❌ Anexos e documentos

#### Melhorias Propostas (Roadmap):

**Fase 1: Gestão Financeira (3 dias) - RECOMENDADO:**
1. Gestão de Pagamentos Parciais
   - Tabela `purchase_payments`
   - Status de pagamento
   - Múltiplos pagamentos
   - Histórico completo
   - Integração com dashboard

**Fase 2: Operacional (2 dias) - RECOMENDADO:**
1. Edição de Compras (com ajuste de estoque)
2. Exclusão de Compras (com reversões)

**Fase 3: Filtros e Análises (2 dias) - OPCIONAL:**
1. Filtros avançados na listagem
2. Estatísticas e gráficos

**Fase 4: Inteligência (3 dias) - OPCIONAL:**
1. Previsão de reposição
2. Análise de consumo

**Total Recomendado (Fase 1+2):** 5 dias de desenvolvimento

**Documentação Completa:**
- `.kiro/specs/purchases-improvements/ANALISE_E_PROPOSTAS.md`
- Análise detalhada com 10 propostas priorizadas
- Roadmap de implementação em 4 fases
- Comparação antes/depois

---

### 6. **AGENDA** ✅ Completo
**Status:** Funcional, Polido e Otimizado  
**Localização:** `/agenda`

#### O que está implementado:
- ✅ Visualização em 5 modos: Dia, Dia Full, Semana, Semana Full, Mês
- ✅ Navegação entre períodos
- ✅ Criação de agendamento com modal inline de cliente
- ✅ Edição de agendamento
- ✅ Alteração de status (PENDING, CONFIRMED, CANCELED, NO_SHOW, DONE)
- ✅ Popover com detalhes do agendamento (abre no hover)
- ✅ Busca por cliente ou serviço
- ✅ Grid de horários (5h às 23:30, intervalos de 30min)
- ✅ Suporte a múltiplos agendamentos no mesmo horário
- ✅ Cores diferentes por status
- ✅ Botão "Finalizar Atendimento" que redireciona para checkout
- ✅ Exibição de observações do agendamento (no popover)
- ✅ Bloqueio de horários (indisponibilidade/pessoal)
- ✅ Validação de conflito (impede agendamento em horário bloqueado)
- ✅ Design premium com glassmorphism
- ✅ **Drag & Drop** nativo (Ghost Card + Snap 30min)
- ✅ **Cadastro Inline de Cliente:** Modal integrado para criar cliente sem sair do agendamento
- ✅ **Modos de Visualização Otimizados:**
  - **Dia/Semana:** 55px por hora - mostra mais horas na tela com scroll
  - **Dia Full/Semana Full:** 30px por hora - agenda completa (5h-23:30) numa tela só sem scroll
- ✅ Cards compactos e informativos:
  - Linha 1: Horário + Nome do Cliente + Avatar
  - Linha 2: Serviço
- ✅ Indicador de Tempo atual (linha vermelha)
- ✅ Header dos dias compacto para maximizar espaço da agenda

#### Campos do agendamento:
```typescript
{
  id: string
  clientId: string
  professionalId: string
  services: string[] (IDs dos serviços)
  date: string (YYYY-MM-DD)
  startTime: string (HH:mm)
  durationMinutes: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'NO_SHOW' | 'DONE'
  notes?: string
  serviceLines?: ServiceLine[] (estrutura normalizada)
  
  // Dados de finalização (preenchidos no checkout)
  finalizedAt?: string
  finalizedServices?: Array<{
    serviceId: string
    name: string
    price: number
    professionalId: string
  }>
  usedProducts?: Array<{
    productId: string
    name: string
    price: number
    cost: number
    quantity: number
  }>
  totalServiceValue?: number
  totalProductValue?: number
  totalValue?: number
}
```

#### O que NÃO está implementado:
- ❌ Recorrência de agendamentos
- ❌ Notificações/lembretes
- ❌ Visualização por profissional
- ❌ Integração com calendário externo

---

### 7. **VENDAS/CHECKOUT** ✅ Implementado
**Status:** Funcional  
**Localização:** `/appointments/[id]/checkout`

#### O que está implementado:
- ✅ Criação automática de venda vinculada ao agendamento
- ✅ Adição de produtos à venda
- ✅ Itens de serviço pré-carregados do agendamento
- ✅ Edição de preço unitário dos itens (com recálculo automático)
- ✅ Cálculo de totais e subtotais
- ✅ Pagamento Misto/Split (múltiplos métodos na mesma venda)
- ✅ Opção de "Fiado" (gera dívida na carteira do cliente)
- ✅ Pagamento com saldo de Crédito (parcial ou total)
- ✅ Cálculo automático de Troco para pagamentos em dinheiro
- ✅ Finalização de venda (status: paid)
- ✅ Redução de estoque automática ao pagar
- ✅ Atualização do agendamento com dados finalizados

#### Estrutura de Venda:
```typescript
{
  id: string
  tenantId: string
  customerId?: string
  appointmentId?: string
  status: 'draft' | 'pending_payment' | 'paid' | 'canceled' | 'refunded'
  items: SaleItem[]
  payments: SalePayment[]
  totalAmount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

SaleItem {
  saleId: string
  itemType: 'product' | 'service'
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  professionalId?: string
}

SalePayment {
  saleId: string
  method: 'pix' | 'card' | 'cash' | 'transfer' | 'credit' | 'fiado'
  amount: number
  paidAt: Date
  createdBy: string
}
```

#### O que NÃO está implementado:
- ✅ Fluxo de Estorno/Reembolso completo
- ❌ Vendas avulsas (sem agendamento)
- ❌ Desconto
- ❌ Parcelamento
- ❌ Nota fiscal
- ❌ Relatório de vendas

---

### 8. **DASHBOARD** ✅ Fase 1 Completa → Pronto para MVP
**Status:** Implementado com métricas essenciais completas  
**Localização:** `/dashboard`

#### O que está implementado:
- ✅ Cards de estatísticas (8 cards em 2 linhas):
  - **Linha 1:** Faturamento total, Ticket médio, Lucro estimado, Agendamentos futuros
  - **Linha 2:** Clientes ativos, Taxa de ocupação, Fluxo de caixa, Estoque crítico
- ✅ Filtro por período (mês atual, mês anterior, todo período)
- ✅ Abas de visualização (3 abas):
  - **Visão Geral:** Fluxo de caixa, Top profissionais, Top serviços (receita e popularidade)
  - **Serviços:** Detalhamento de receita (serviços vs produtos)
  - **Estoque:** Alertas de reposição + economia de produtos
- ✅ **Métricas de Clientes (NOVO):**
  - Total de clientes ativos
  - Novos clientes no período
  - Clientes com dívida (Fiado)
- ✅ **Métricas de Agenda (NOVO):**
  - Taxa de ocupação (% de horários preenchidos)
  - Agendamentos futuros (confirmados + pendentes)
- ✅ **Fluxo de Caixa (NOVO):**
  - Card dedicado com entradas, saídas e saldo líquido
  - Cores semânticas (verde/vermelho)
  - Integração com movimentações de caixa
- ✅ **Ranking de Profissionais (NOVO):**
  - Top 5 profissionais por faturamento
  - Total de atendimentos por profissional
  - Indicadores visuais de posição (medalhas)
  - Empty state quando sem dados
- ✅ Gráficos simples:
  - Gráfico de barras horizontal (top 5 serviços)
  - Lista de produtos críticos com destaque visual
  - Cards de resumo financeiro
- ✅ Cálculo de margem de lucro
- ✅ Design glassmorphism consistente
- ✅ Espaçamento reduzido (header compacto)

#### Métricas Calculadas:
**Financeiras:**
- Faturamento total (serviços + produtos)
- Ticket médio por atendimento
- Lucro estimado (com custos e comissões)
- Margem de lucro percentual
- Fluxo de caixa (entradas, saídas, saldo)

**Clientes:**
- Clientes ativos (status ACTIVE)
- Novos clientes no período (filtrado por data de criação)
- Clientes com dívida (creditBalance < 0)

**Agenda:**
- Taxa de ocupação (atendimentos / slots estimados)
- Agendamentos futuros (PENDING + CONFIRMED, data >= hoje)
- Total de atendimentos no período

**Profissionais:**
- Faturamento por profissional
- Atendimentos por profissional
- Ranking top 5

**Estoque:**
- Produtos críticos (currentStock <= minStock)
- Receita de produtos
- Lucro de produtos
- Margem de produtos

#### O que NÃO está implementado (Fase 2 - Opcional):
- ❌ **Gráficos de Evolução Temporal:**
  - Gráfico de linha (evolução de faturamento)
  - Gráfico de área (fluxo de caixa)
  - Comparativo mensal
- ❌ **Distribuição de Pagamentos:**
  - Gráfico de pizza por método
  - Percentuais por método
- ❌ **Comparação com Período Anterior:**
  - Indicadores de variação (↑↓)
  - Percentual de crescimento/queda
- ❌ **Abas Adicionais:**
  - Aba "Financeiro" com detalhamento completo
  - Aba "Equipe" com ranking expandido
  - Aba "Clientes" com métricas de relacionamento
- ❌ **Taxa de Cancelamento:**
  - Cálculo de CANCELED + NO_SHOW
  - Percentual sobre total de agendamentos
- ❌ **Exportação:**
  - PDF com relatório completo
  - Excel com dados detalhados

#### Melhorias Implementadas (Fase 1):
**Data:** 12/02/2026  
**Prioridade:** ALTA - Finalização do MVP  
**Status:** ✅ COMPLETO

**Implementação:**
1. ✅ Adicionados 4 novos cards de métricas
2. ✅ Reorganizado layout em 2 linhas de 4 cards
3. ✅ Criado card de Fluxo de Caixa com breakdown detalhado
4. ✅ Criado card de Ranking de Profissionais top 5
5. ✅ Integrado repositórios de clientes, caixa e profissionais
6. ✅ Implementado cálculo de métricas de clientes
7. ✅ Implementado cálculo de métricas de agenda
8. ✅ Implementado cálculo de fluxo de caixa
9. ✅ Implementado ranking de profissionais
10. ✅ Filtro de período agora afeta todas as métricas
11. ✅ Reduzido espaçamento do header
12. ✅ Build passou sem erros
13. ✅ Documentação atualizada (PRD + Inventário)

**Documentação Completa:**
- `.kiro/specs/dashboard-improvements/ANALISE_E_MELHORIAS_FINAIS.md`
- Proposta detalhada com layout, implementação e timeline
- Fase 1: 100% COMPLETA ✅
- Fase 2: Opcional (melhorias avançadas)

---

### 9. **CRÉDITO** ✅ Implementado
**Status:** Funcional  
**Localização:** Integrado no perfil do cliente

#### O que está implementado:
- ✅ Adicionar crédito manual
- ✅ Debitar crédito
- ✅ Histórico de movimentações
- ✅ Saldo calculado automaticamente
- ✅ Uso de crédito no checkout (como método de pagamento)
- ✅ Origem do crédito (CASH, PIX, CARD, WALLET)

#### Estrutura:
```typescript
{
  id: string
  clientId: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  origin: 'CASH' | 'PIX' | 'CARD' | 'WALLET'
  note?: string
  createdAt: string
}
```

#### O que NÃO está implementado:
- ❌ Validade de crédito
- ❌ Bônus/cashback automático
- ❌ Transferência de crédito entre clientes

---

### 10. **PROFISSIONAIS** ✅ Completo
**Status:** Implementado e funcional
**Localização:** `/professionals`

#### O que está implementado:
- ✅ Listagem de equipe (cards com cores)
- ✅ CRUD completo (Criar, Editar, Excluir)
- ✅ Definição de cor para agenda
- ✅ Definição de comissão padrão
- ✅ Filtro por nome
- ✅ Status Ativo/Inativo

#### Campos do cadastro:
```typescript
{
  id: string
  name: string
  color: string (hex)
  commission: number (%)
  status: 'ACTIVE' | 'INACTIVE'
  phone?: string
  email?: string
}
```

#### O que NÃO está implementado:
- ❌ Metas individuais
- ❌ Horários de trabalho específicos (escala)
- ❌ Histórico de comissões pagas


---

### 11. **CAIXA (MVP)** ✅ Implementado
**Status:** Funcional (Ledger)
**Localização:** `/cash`

#### O que está implementado:
- ✅ Livro Caixa (Ledger) com Entradas e Saídas
- ✅ Dashboard com totais e saldo do período
- ✅ Filtro por data
- ✅ Lançamentos manuais (Nova Entrada / Nova Saída)
- ✅ **Integração Automática (Vendas):**
  - Vendas pagas (`pay_sale`) -> Geram Entrada (CASH, PIX, CARD, TRANSFER, WALLET) automaticamente.
- ✅ **Integração Automática (Compras):**
  - Novas Compras com opção "Pago" marcada -> Geram Saída automaticamente.
- ✅ **Integração Automática (Estornos):**
  - Estornos (`refund_sale`) -> Geram Saída (Reembolso).
- ✅ **Integração Automática (Crédito):**
  - "Adicionar Crédito" ao cliente atualiza o saldo dele e **gera entrada no Caixa** automaticamente (exceto se origem for WALLET).

#### Decisões de Negócio:
- `CREDIT` (Uso de saldo) e `FIADO` **NÃO** entram no Caixa (apenas baixam estoque/geram venda).
- Apenas métodos com fluxo financeiro real (Dinheiro, Pix, Cartão) são registrados no Ledger.
- Recargas de crédito agora lançam entrada no caixa corretamente (via RPC `add_client_credit`).
- **Fiado/Crédito:** Pagamentos do tipo `FIADO` e `CREDIT` (saldo em carteira) **NÃO** geram movimentação no Livro Caixa (cash_movements), pois não há entrada financeira real no momento.
  - `FIADO`: Gera dívida no saldo do cliente (valor negativo) e aparece no histórico do cliente. **Agora exibido em vermelho no perfil.**
  - `CREDIT`: Deduz do saldo existente do cliente.
  - **Reembolso:** Agora permite refazer o pagamento de uma venda estornada.

#### Campos de Movimentação:
- id, type (IN/OUT), amount, method, source_type, description, occurred_at.
- RLS por Tenant.

---

## 🗂️ TELAS IMPLEMENTADAS

### Rotas Principais:
| Rota | Descrição | Status |
|------|-----------|--------|
| `/` | Redireciona para `/clients` | ✅ |
| `/clients` | Listagem de clientes | ✅ |
| `/clients/new` | Criar novo cliente | ✅ |
| `/clients/[id]` | Perfil do cliente | ✅ |
| `/clients/[id]/edit` | Editar cliente | ✅ |
| `/products` | Listagem de produtos | ✅ |
| `/products/[id]` | Perfil do produto | ✅ |
| `/products/pos` | PDV (Ponto de Venda) | ✅ |
| `/services` | Listagem de serviços | ✅ |
| `/agenda` | Agenda/calendário | ✅ |
| `/appointments/[id]/checkout` | Checkout/finalização | ✅ |
| `/dashboard` | Dashboard analítico | ✅ |
| `/suppliers` | Lista de fornecedores | ✅ |
| `/suppliers/[id]` | Detalhes do fornecedor | ✅ |
| `/purchases` | Lista de compras | ✅ |
| `/purchases/[id]` | Detalhes da compra | ✅ |
| `/professionals` | Lista de profissionais | ✅ |
| `/professionals/[id]` | Detalhes/Edição profissional | ✅ |
| `/cash` | Livro Caixa (Ledger) | ✅ |

---

## 📋 CADASTROS EXISTENTES

### 1. Cliente
**Campos obrigatórios:** name, birthDate, city  
**Campos opcionais:** phone, whatsapp, notes, photoUrl  
**Campos calculados:** creditBalance, hasHistory  
**Status:** ACTIVE, INACTIVE, ATTENTION

### 2. Produto
**Campos obrigatórios:** name, price, minStock  
**Campos opcionais:** cost, profitAmount, profitPercentage, commission, netValue  
**Campos calculados:** currentStock (via movimentações)

### 3. Serviço
**Campos obrigatórios:** name, duration, price  
**Campos opcionais:** cost, profitAmount, profitPercentage, commission, netValue

### 4. Agendamento
**Campos obrigatórios:** clientId, professionalId, services, date, startTime, durationMinutes  
**Campos opcionais:** notes, serviceLines  
**Campos de finalização:** finalizedAt, finalizedServices, usedProducts, totais

---

## 🎨 PERFIS (DETAIL PAGES)

### ✅ Perfil do Cliente (`/clients/[id]`)
**Existe:** Sim  
**O que mostra:**
- Avatar/iniciais
- Nome, status, contatos, cidade, data de nascimento
- Saldo de crédito destacado
- 4 abas: Visão Geral, Histórico, Crédito, Produtos
- Ações: Editar, Excluir, Agendar

**Abas:**
1. **Visão Geral:** Resumo, últimos serviços (integrado com vendas pagas), próximos agendamentos
2. **Histórico:** Lista de agendamentos com status, data, serviços, valor total e método de pagamento
3. **Crédito:** Adicionar/debitar crédito, histórico de movimentações
4. **Produtos:** Produtos consumidos (vinculados a vendas)

**O que falta:**
- Gráfico de frequência
- Preferências de serviço
- Aniversariantes do mês

**Observação:** A aba "Agenda" foi renomeada para "Histórico" para refletir melhor o conteúdo (agendamentos passados e futuros com foco financeiro).

---

### ✅ Perfil do Produto (`/products/[id]`)
**Existe:** Sim  
**O que mostra:**
- Nome, ícone de produto
- Estoque atual (com destaque se crítico)
- Informações financeiras completas (custo, preço, lucro, margem, comissão)
- Histórico de movimentações de estoque
- Botão para movimentar estoque

**O que falta:**
- Gráfico de consumo ao longo do tempo
- Produtos relacionados
- Previsão de reposição

---

### ❌ Perfil do Serviço
**Existe:** Não  
**Deveria ter:**
- Detalhes do serviço
- Histórico de execuções
- Profissionais que executam
- Avaliação média
- Faturamento gerado

---

### ❌ Perfil do Agendamento
**Existe:** Não (apenas popover na agenda)  
**Deveria ter:**
- Página dedicada com todos os detalhes
- Timeline do atendimento
- Produtos utilizados
- Fotos antes/depois
- Feedback do cliente

---

## ⚙️ AÇÕES E FLUXOS

### ✅ Fluxos Implementados:

#### 1. **Criar Cliente**
1. Clicar em "Novo Cliente"
2. Preencher formulário (nome, nascimento, cidade obrigatórios)
3. Salvar
4. Redirecionamento para perfil do cliente

#### 2. **Criar Produto**
1. Clicar em "Novo Produto"
2. Preencher nome, preço, estoque mínimo
3. Sistema calcula lucro/margem automaticamente
4. Salvar

#### 3. **Criar Serviço**
1. Clicar em "Novo Serviço"
2. Preencher nome, duração, preço
3. Sistema calcula lucro/margem automaticamente
4. Salvar

#### 4. **Criar Agendamento**
1. Clicar em "Novo Agendamento" na agenda
2. Selecionar cliente (ou criar novo via modal inline)
   - Se cliente não existe: clicar "Novo Cliente"
   - Preencher dados no modal
   - Cliente é criado e automaticamente selecionado
3. Selecionar profissional e serviços
4. Escolher data e horário
5. Adicionar observações (opcional)
6. Salvar

#### 5. **Finalizar Atendimento (Checkout)**
1. Abrir agendamento na agenda
2. Clicar em "Finalizar Atendimento"
3. Sistema cria venda automaticamente
4. Adicionar produtos ou ajustar preços (opcional)
5. Clicar em "Pagamento" para abrir o modal
6. Adicionar pagamentos (pode misturar métodos: pix + dinheiro + crédito)
   - Se for dinheiro, sistema calcula troco
   - Se for fiado, sistema gera dívida
7. Finalizar Pagamento (botão habilita quando total for coberto)
8. Sistema:
   - Atualiza status do agendamento para DONE
   - Reduz estoque dos produtos
   - Registra venda como paid
   - Debita crédito/Gera dívida no cliente (se aplicável)
   - Atualiza dados de finalização no agendamento

#### 6. **Movimentar Estoque**
1. Acessar perfil do produto
2. Clicar em "Movimentar Estoque"
3. Escolher tipo (Entrada/Saída)
4. Informar quantidade e motivo
5. Salvar
6. Sistema atualiza currentStock

#### 7. **Adicionar Crédito ao Cliente**
1. Acessar perfil do cliente
2. Ir para aba "Crédito"
3. Clicar em "Adicionar Crédito"
4. Informar valor, origem e observação
5. Salvar
6. Sistema atualiza saldo

---



## 🚨 PROBLEMAS ENCONTRADOS





### 1. **Campos Genéricos/Não Definidos**

#### ✅ Campo "photoUrl" funcional
**Status:** IMPLEMENTADO (12/02/2026)
**Solução:** Sistema completo de upload de foto do cliente implementado com:
- **Componente PhotoUpload** (`src/components/clients/PhotoUpload.tsx`):
  - Interface de upload com preview circular
  - Validação de tipo (JPG, PNG, WEBP) e tamanho (máximo 2MB)
  - Remoção de foto
  - Estados de loading e erro
- **API Route** (`src/app/api/upload/client-photo/route.ts`):
  - Endpoint seguro com autenticação Supabase
  - Validação server-side de tipo e tamanho
  - Upload para Supabase Storage
  - Retorna URL pública da foto
- **Supabase Storage**:
  - Bucket `client-photos` público
  - Organização por usuário: `{user_id}/{timestamp}.{ext}`
  - Políticas RLS para upload, update, delete (apenas próprio usuário)
  - Política pública para visualização
- **Integração nos Formulários**:
  - ClientForm.tsx - formulário de criação/edição
  - ClientDialog.tsx - dialog de criação rápida
  - Ambos com campo de upload totalmente funcional
- **Exibição**:
  - Avatar no perfil do cliente exibe a foto
  - Fallback com iniciais quando não há foto
  - Suporte a Next.js Image para otimização
- **Migration**: `supabase/migrations/20260212170000_create_client_photos_bucket.sql`
- **Documentação**: `INSTRUCOES_FOTO_CLIENTE.md` com guia completo de configuração

### 2. **Divergência de Dados (Local vs Produção)**
#### ✅ Variáveis de Ambiente Vercel
**Status:** RESOLVIDO (11/02/2026)
**Problema:** A Vercel injetava `NEXT_PUBLIC_USE_SUPABASE="true"` (com aspas), e o código comparava estritamente com `true` boleano ou string sem aspas, caindo no fallback do LocalStorage com dados seed (falsos).
**Solução:** Ajuste no `factory.ts` para parsing robusto de strings booleanas (`replace(/['"\s]/g, '')`). Produção agora reflete 100% o banco Supabase.

---









---

## 📊 RESUMO EXECUTIVO

### Módulos por Status:

| Módulo | Status | Completude |
|--------|--------|------------|
| Clientes | ✅ Completo | 95% |
| Produtos | ✅ Completo | 90% |
| Serviços | ⚠️ Operacional | 90% (Falta Perfil) |
| Agenda | ✅ Completo | 100% |
| Vendas/Checkout | ✅ Completo | 100% |
| Profissionais | ✅ Completo | 100% |
| Dashboard | ⚠️ Parcial | 60% |
| Crédito | ✅ Completo | 100% |

### ⚠️ Pendências Detalhadas (Não travam MVP)

#### 1. Foto do Cliente (Upload Real)
- **Status:** ✅ RESOLVIDO. Storage configurado e integrado.

#### 2. Agendamento Recorrente
- **Status:** Adiado para pós-MVP.
- **Decisões Pendentes:** Padrões (semanal/mensal), período de geração, edição em série vs ocorrência.

---

## 🚀 ESTRATÉGIA DE MIGRAÇÃO (SUPABASE)

**Status:** ✅ CONCLUÍDA
- Todos os repositórios (Client, Product, Service, Appointment, Sale, Purchase, Supplier, Credit, Stock) foram migrados.
- **Multi-Tenancy:** Validado. Cada escrita injeta o `tenant_id` correto e leituras respeitam RLS.
- **Bug Fix:** Resolvido problema de geração de ID inválido no Agendamento.

**Critério de Aceitação da Migração:**
- Dados migrados do localStorage sem perdas.
- RLS (Row Level Security) configurado por `tenantId`.
- Tipos do banco alinhados com Domínio atual.

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Prioridade ALTA (Corrigir Problemas):

1. **Implementar Reconciliação de Estoque**
   - Criar função que reconstrói o `currentStock` somando todas as `ProductMovement`.
   - Interface para admins rodarem essa correção.

---

### Prioridade MÉDIA (Completar Funcionalidades):

2. **Criar perfil de Serviço**
   - Página de detalhes
   - Histórico de execuções
   - Estatísticas

---

### Prioridade BAIXA (Melhorias):

3. **Implementar upload de imagens**
   - Para clientes
   - Para produtos
   - Integração com storage

4. **Adicionar relatórios**
   - Vendas por período
   - Produtos mais vendidos
   - Clientes mais frequentes

5. **Notificações e lembretes**
     - WhatsApp
     - E-mail
     - Push notifications

---

## 📁 ESTRUTURA DE ARQUIVOS (v1.7 - Auth Group)

```text
src/app/
├── (app)/                  # Rotas Protegidas (Com Sidebar)
│   ├── agenda/page.tsx
│   ├── appointments/
│   ├── clients/
│   ├── dashboard/
│   ├── products/
│   ├── professionals/
│   ├── purchases/
│   ├── services/
│   ├── suppliers/
│   ├── layout.tsx          # Layout com Sidebar
│   └── page.tsx            # Redireciona para /agenda
├── (auth)/                 # Rotas Públicas (Sem Sidebar)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx          # Layout Centralizado Clean
├── auth/
│   └── signout/route.ts    # API Route Logout
├── layout.tsx              # Root Layout (AuthProvider)
└── globals.css
```

---

## 🔍 OBSERVAÇÕES FINAIS

### Pontos Fortes:
- ✅ Arquitetura limpa e organizada (Clean Architecture)
- ✅ TypeScript com tipagem forte e schemas Zod
- ✅ Design premium e responsivo (shadcn/ui)
- ✅ Separação clara de domínio e infraestrutura
- ✅ **Supabase Fase 1 completa** (schema, RLS, storage, repos, factory)
- ✅ **Migração Factory completa** — Todas as 27 instanciações diretas de `LocalStorage*Repository` substituídas pelo Repository Factory

### Pontos de Atenção:
- ⚠️ RLS atualmente permissiva (`USING (true)`) — será refinada com Auth na Fase 2.
- ⚠️ `NEXT_PUBLIC_USE_SUPABASE=true` — Supabase é o backend ativo.
- ✅ Schema SQL aplicado no banco de dados Supabase.

### Supabase Fase 1 — ENTREGUE:
| Item | Status | Arquivo/Localização |
|------|--------|---------------------|
| Schema SQL completo | ✅ | `supabase/migrations/001_complete_schema.sql` |
| Multi-tenant (tenant_id) | ✅ | Todas tabelas com `tenant_id` + tenant `default` |
| RLS habilitada | ✅ | Todas 17 tabelas com policies permissivas |
| RPC create_purchase | ✅ | Função atômica compra + itens + movimentações |
| RPC pay_sale | ✅ | Função atômica + Reembolso permitido + Correção Case Sensitive |
| RPC refund_sale | ✅ | Função atômica estorno reverso + Correção Case Sensitive |
| Storage client-photos | ✅ | `supabase/migrations/002_storage_setup.sql` |
| Helper de storage | ✅ | `src/lib/supabase/storage.ts` |
| Repo: Client | ✅ | `supabase/SupabaseClientRepository.ts` |
| Repo: Product | ✅ | `supabase/SupabaseProductRepository.ts` |
| Repo: Service | ✅ | `supabase/SupabaseServiceRepository.ts` |
| Repo: Supplier | ✅ | `supabase/SupabaseSupplierRepository.ts` |
| Repo: Professional | ✅ | `supabase/SupabaseProfessionalRepository.ts` |
| Repo: Purchase | ✅ | `supabase/SupabasePurchaseRepository.ts` |
| Repo: Appointment | ✅ | `supabase/SupabaseAppointmentRepository.ts` |
| Repo: Sale | ✅ | `supabase/SupabaseSaleRepository.ts` |
| Repo: Credit | ✅ | `supabase/SupabaseCreditRepository.ts` |
| Repo: StockMovement | ✅ | `supabase/SupabaseStockMovementRepository.ts` |
| Repository Factory | ✅ | `src/infrastructure/repositories/factory.ts` |
| Feature Flag | ✅ | `NEXT_PUBLIC_USE_SUPABASE` em `.env.local` |
| Trigger updated_at | ✅ | Auto-update em 10 tabelas |
| Fix Server-Side Auth (Cash) | ✅ | Refactor Repository + Actions para usar cliente SSR correto |

### Migração Factory — ENTREGUE:
Todas as 27 referências diretas a `new LocalStorage*Repository()` foram substituídas por chamadas ao Repository Factory (`factory.ts`). Zero instanciações diretas fora de `factory.ts`.

| Categoria | Arquivos Migrados | Exemplos |
|-----------|-------------------|----------|
| Pages | 12 | `dashboard`, `agenda`, `clients/*`, `purchases/*`, `suppliers/*`, `products/pos` |
| Components | 12 | `AppointmentForm`, `CheckoutForm`, `ClientForm`, `DeleteClientDialog`, `RegisterCreditDialog`, `PurchaseForm`, `SupplierForm`, `DeleteSupplierDialog`, `ClientHistoryTab`, `ClientAppointmentsTab`, `ClientCreditTab`, `ClientProductsTab` |
| Hooks | 3 | `useProfessionals`, `useServices`, `useProducts` |
| Use Cases | 1 | `getCustomerOverview` |
| Lib | 1 | `seedProfessionals` |

### Próximos Passos (Resumo):
1. ~~**Aplicar migrations**~~ ✅ Schema aplicado.
2. ~~**Ativar flag**~~ ✅ `NEXT_PUBLIC_USE_SUPABASE=true` ativo.
3. ~~**Migrar factory**~~ ✅ Todas instanciações migradas.
### Supabase Fase 2 (Auth SSR) — ENTREGUE:
| Item | Status | Arquivo/Localização |
|------|--------|---------------------|
| Middleware (Proxy) | ✅ | `src/proxy.ts` + `src/lib/supabase/middleware.ts` |
| Auth Context | ✅ | `src/contexts/AuthProvider.tsx` |
| Server Client | ✅ | `src/lib/supabase/server.ts` |
| Client Client | ✅ | `src/lib/supabase/client.ts` |
| Login Page | ✅ | `src/app/(auth)/login/page.tsx` + Server Action |
| Signup Page | ✅ | `src/app/(auth)/signup/page.tsx` + Server Action |
| RPC Signup | ✅ | `signup_create_tenant` (DB Function) |
| RLS Policies | ✅ | Refinadas para `tenants` e `profiles` |
| Sidebar Auth | ✅ | Integração com dados reais do usuário |

### Próximos Passos (Resumo):
1. ~~**Aplicar migrations**~~ ✅ Schema aplicado.
2. ~~**Ativar flag**~~ ✅ `NEXT_PUBLIC_USE_SUPABASE=true` ativo.
3. ~~**Migrar factory**~~ ✅ Todas instanciações migradas.
4. ~~**Fase 2: Auth**~~ ✅ Auth Completa (Login/Signup/SSR/RLS).
5. **Teste Manual Integrado** — Validar fluxo completo de dados por Tenant.
6. **Refinamento RLS** — Garantir que `tenant_id` seja injetado automaticamente em todas as inserções via RLS ou Trigger (Atualmente feito via aplicação).
7. **Fase 3: Upload de fotos** — Integrar helper de storage.

---

**Versão Final:** V2.5.2
**Data:** 12/02/2026
**Status:** OFICIAL E AUDITADO — EXTRATO DE CONTA MELHORADO (FASE 1 COMPLETA) + UPLOAD DE FOTO DO CLIENTE + INLINE CLIENT CREATION + CHECKOUT IMPROVEMENTS + AGENDA INDICATORS + PAYMENT DIALOG ENHANCEMENTS + CORREÇÃO CRÍTICA DE VALIDAÇÃO DE PAGAMENTO

---

## 🆕 ATUALIZAÇÕES RECENTES (V2.5.3 - 12/02/2026)

### ✅ DASHBOARD - FASE 1 COMPLETA (Métricas Essenciais)

**Status:** Implementado e testado  
**Data:** 12/02/2026  
**Prioridade:** ALTA - Finalização do MVP  
**Impacto:** Dashboard agora oferece visão 360° do negócio

#### Funcionalidades Implementadas:

**1. Novos Cards de Métricas (8 cards em 2 linhas):**

**Linha 1 - Métricas Financeiras e Operacionais:**
- ✅ **Faturamento Total**
  - Soma de serviços + produtos
  - Contador de atendimentos
  - Trend indicator (up)
  - Cor verde
- ✅ **Ticket Médio**
  - Valor médio por atendimento
  - Calculado: faturamento / atendimentos
  - Cor azul
- ✅ **Lucro Estimado**
  - Lucro de serviços + produtos
  - Margem percentual
  - Cor roxa
- ✅ **Agendamentos Futuros** (NOVO)
  - Contagem de PENDING + CONFIRMED
  - Apenas datas >= hoje
  - Cor azul

**Linha 2 - Métricas de Clientes, Agenda e Caixa:**
- ✅ **Clientes Ativos** (NOVO)
  - Total com status ACTIVE
  - Subtexto: novos no período
  - Trend indicator quando há novos
  - Cor azul
- ✅ **Taxa de Ocupação** (NOVO)
  - Percentual de ocupação da agenda
  - Calculado: atendimentos / slots estimados
  - Trend indicator (up se > 50%, down se <= 50%)
  - Cor verde/vermelho baseado em performance
- ✅ **Fluxo de Caixa** (NOVO)
  - Saldo líquido (entradas - saídas)
  - Subtexto: total de entradas
  - Trend indicator baseado em saldo
  - Cor verde/vermelho baseado em saldo
- ✅ **Estoque Crítico**
  - Produtos abaixo do mínimo
  - Trend indicator (down se > 0)
  - Cor vermelha

**2. Card de Fluxo de Caixa Detalhado (NOVO):**
- ✅ Seção dedicada na aba Visão Geral
- ✅ 3 linhas de informação:
  - **Entradas:** Total de movimentos IN
    - Background verde claro
    - Borda verde
    - Valor em verde escuro
  - **Saídas:** Total de movimentos OUT
    - Background vermelho claro
    - Borda vermelha
    - Valor em vermelho escuro
  - **Saldo Líquido:** Entradas - Saídas
    - Background verde/vermelho baseado em sinal
    - Borda dupla destacada
    - Valor grande e bold
    - Cor baseada em positivo/negativo
- ✅ Integração com CashMovementRepository
- ✅ Filtrado por período selecionado
- ✅ Formatação monetária brasileira

**3. Card de Ranking de Profissionais (NOVO):**
- ✅ Top 5 profissionais por faturamento
- ✅ Cada linha mostra:
  - **Posição:** Badge numerado
    - 1º: Fundo amarelo (ouro)
    - 2º: Fundo cinza (prata)
    - 3º: Fundo laranja (bronze)
    - 4º-5º: Fundo roxo
  - **Nome do profissional**
  - **Total de atendimentos**
  - **Faturamento total** (destaque)
- ✅ Ordenação por receita (maior primeiro)
- ✅ Empty state quando sem atendimentos:
  - Ícone de usuários
  - Mensagem amigável
  - Sugestão de ação
- ✅ Hover effects nos cards
- ✅ Design responsivo

**4. Cálculos de Métricas:**

**Clientes:**
```typescript
activeClients = clients.filter(c => c.status === 'ACTIVE').length
newClients = clients.filter(c => isSameMonth(c.createdAt, periodDate)).length
clientsWithDebt = clients.filter(c => c.creditBalance < 0).length
```

**Agenda:**
```typescript
futureAppointments = appointments.filter(a => 
  (a.status === 'PENDING' || a.status === 'CONFIRMED') && 
  new Date(a.date) >= now
).length

occupancyRate = (doneAppointments / estimatedTotalSlots) * 100
// Estimativa: 600 slots/mês (10h/dia * 2 slots/h * 30 dias)
```

**Fluxo de Caixa:**
```typescript
totalIn = cashMovements.filter(m => m.type === 'IN')
  .reduce((sum, m) => sum + m.amount, 0)

totalOut = cashMovements.filter(m => m.type === 'OUT')
  .reduce((sum, m) => sum + m.amount, 0)

netCashFlow = totalIn - totalOut
```

**Profissionais:**
```typescript
professionalStats = professionals.map(prof => {
  const profAppts = filteredAppts.filter(a => a.professionalId === prof.id)
  const revenue = profAppts.reduce((sum, a) => 
    sum + (a.totalServiceValue || 0) + (a.totalProductValue || 0), 0
  )
  return { name: prof.name, appointments: profAppts.length, revenue }
}).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
```

**5. Integração de Dados:**
- ✅ Adicionados 3 novos repositórios:
  - `ClientRepository` - dados de clientes
  - `CashMovementRepository` - movimentações financeiras
  - `ProfessionalRepository` - dados de profissionais
- ✅ Carregamento paralelo de todos os dados
- ✅ Filtro de período agora afeta:
  - Atendimentos (já existia)
  - Clientes novos (novo)
  - Movimentações de caixa (novo)
- ✅ useEffect atualizado para recarregar ao mudar período
- ✅ useMemo expandido com todos os novos cálculos

**6. Layout e UX:**
- ✅ Header compacto (p-6 → p-4, space-y-8 → space-y-4)
- ✅ Grid de 2 linhas x 4 colunas (responsivo)
- ✅ Aba Visão Geral reorganizada:
  - Fluxo de Caixa (col-span-3)
  - Top Profissionais (col-span-4)
  - Top Serviços por Receita (col-span-4)
  - Mais Populares (col-span-3)
- ✅ Cores semânticas consistentes:
  - Verde: positivo, entradas, lucro
  - Vermelho: negativo, saídas, crítico
  - Azul: neutro, informativo
  - Roxo: destaque, ranking
- ✅ Trend indicators visuais (↑↓)
- ✅ Empty states informativos
- ✅ Hover effects e transições suaves

**7. Performance:**
- ✅ Cálculos otimizados com useMemo
- ✅ Carregamento paralelo de dados
- ✅ Filtros aplicados de forma eficiente
- ✅ Sem re-renders desnecessários

#### Arquivos Modificados:
- `src/app/(app)/dashboard/page.tsx`
  - Adicionados imports de repositórios
  - Expandido estado com clients, cashMovements, professionals
  - Atualizado useEffect para carregar novos dados
  - Expandido useMemo com novos cálculos
  - Adicionada segunda linha de cards
  - Reorganizada aba Visão Geral
  - Reduzido espaçamento do header

#### Build e Testes:
- ✅ Build passou sem erros (0 errors)
- ✅ TypeScript compilation successful
- ✅ Todas as rotas geradas corretamente
- ✅ Cálculos validados
- ✅ Layout responsivo testado

#### Documentação Atualizada:
- ✅ PRD: Acceptance criteria marcados como implementados
- ✅ PRD: Adicionado changelog da versão 2.3.3
- ✅ Inventário: Seção Dashboard expandida
- ✅ Inventário: Status atualizado para "Fase 1 Completa"

#### Impacto:
- **Antes:** Dashboard básico com 4 cards e foco apenas em vendas/estoque
- **Depois:**
  - 8 cards de métricas cobrindo todas as áreas
  - Visão completa de clientes (ativos, novos, com dívida)
  - Visão completa de agenda (ocupação, futuros)
  - Visão completa de caixa (entradas, saídas, saldo)
  - Ranking de profissionais por performance
  - Layout organizado e intuitivo
  - Todas as métricas respeitam filtro de período

#### Próximos Passos (Fase 2 - Opcional):
- Gráfico de evolução temporal (linha)
- Gráfico de distribuição de pagamentos (pizza)
- Comparação com período anterior (% variação)
- Novas abas: Financeiro, Equipe, Clientes
- Taxa de cancelamento
- Exportação de relatórios

---

## 🆕 ATUALIZAÇÕES RECENTES (V2.5.2 - 12/02/2026)

### ✅ EXTRATO DE CONTA MELHORADO - FASE 1 COMPLETA

**Status:** Implementado e testado  
**Data:** 12/02/2026  
**Prioridade:** ALTA  
**Impacto:** Experiência de visualização financeira significativamente melhorada

#### Funcionalidades Implementadas:

**1. Sistema de Filtros Completo (6 tipos):**
- ✅ Filtros rápidos de período (6 presets)
  - Hoje, Ontem, 7 Dias, 30 Dias, Este Mês, Mês Passado
  - Cálculo automático de datas com date-fns
  - Indicador visual do período ativo
- ✅ Filtro por tipo (Todas/Entradas/Saídas)
  - Botões visuais com cores semânticas
  - Verde para entradas, vermelho para saídas
- ✅ Filtro por método de pagamento
  - Dropdown: Todos, PIX, Cartão, Dinheiro, Transferência, Carteira
  - Labels em português
- ✅ Filtro por origem da transação
  - Dropdown: Todas, Vendas, Compras, Estornos, Manual, Crédito
  - Filtra por sourceType
- ✅ Busca por texto
  - Busca em descrição, cliente, fornecedor
  - Debounce de 300ms
  - Case-insensitive
  - Botão X para limpar
- ✅ Combinação de filtros
  - Todos funcionam juntos (AND logic)
  - Contador de resultados
  - Botão "Limpar" para resetar todos

**2. Agrupamento por Data:**
- ✅ Movimentações agrupadas por dia
- ✅ Ordenação: mais recente primeiro
- ✅ Header com data formatada e dia da semana
- ✅ Total do dia em badge (verde/vermelho)
- ✅ Cards separados por dia
- ✅ Movimentações ordenadas por horário dentro do grupo

**3. Estatísticas Estendidas (8 cards):**
- ✅ Saldo Inicial
- ✅ Total Entradas (filtrado)
- ✅ Total Saídas (filtrado)
- ✅ Saldo Atual
- ✅ Maior Entrada
- ✅ Maior Saída
- ✅ Ticket Médio
- ✅ Contagem de Transações
- ✅ Todas atualizam em tempo real com filtros

**4. Ícones Visuais:**
- ✅ 🛒 Venda
- ✅ 📦 Compra
- ✅ ↩️ Estorno
- ✅ ✏️ Manual
- ✅ 💳 Crédito
- ✅ Ícones consistentes em toda a aplicação

**5. Links para Transações:**
- ✅ Vendas: link para checkout
- ✅ Compras: link para detalhes da compra
- ✅ Texto "Ver detalhes →" clicável
- ✅ Abre em nova aba mantendo contexto

**6. Estados Especiais:**
- ✅ Loading skeletons
- ✅ Empty state com mensagem amigável
- ✅ Diferenciação: sem dados vs filtros sem resultado
- ✅ Sugestões de ação
- ✅ Botão de refresh com loading animado

#### Componentes Criados:
1. **EnhancedAccountStatementView.tsx**
   - Componente principal do extrato
   - Gerencia estado de filtros
   - Calcula estatísticas
   - Agrupa por data
   - 450+ linhas de código

2. **StatementFilters.tsx**
   - Barra de filtros completa
   - 6 tipos de filtro integrados
   - Contador de resultados
   - Botão limpar
   - 200+ linhas de código

3. **QuickPeriodFilters.tsx**
   - 6 botões de período
   - Cálculo de datas
   - Indicador visual ativo
   - 80+ linhas de código

#### Domain Models Atualizados:
- `MovementWithBalance`: movimento enriquecido com ícone e nomes
- `ExtendedStats`: estatísticas avançadas
- `FilterValues`: estado dos filtros
- Exports: `PaymentMethod`, `SourceType`

#### Repository Enhancements:
- `getStatement()` retorna `MovementWithBalance[]`
- Helper `getMovementIcon()` para mapear tipos
- Movimentações enriquecidas com cliente/fornecedor

#### Page Integration:
- `/contas/[id]/page.tsx` atualizada
- Usa `EnhancedAccountStatementView`
- Mantém navegação e loading
- Suporte a refresh

#### Build e Testes:
- ✅ Build passou sem erros (0 errors)
- ✅ TypeScript compilation successful
- ✅ Todos os componentes tipados
- ✅ Filtros funcionando corretamente
- ✅ Agrupamento operacional
- ✅ Estatísticas calculando corretamente
- ✅ Links funcionando

#### Documentação:
- ✅ requirements.md: 17 user stories
- ✅ design.md: arquitetura completa
- ✅ tasks.md: 68 tasks em 4 fases
- ✅ Fase 1: 100% COMPLETA

#### Próximas Fases (Opcional):
- **Fase 2 (Important):** Gráfico de evolução, paginação, ordenação
- **Fase 3 (Desirable):** Exportação PDF/Excel, toggle de visualização
- **Fase 4 (Polish):** Acessibilidade, testes, otimizações

#### Impacto:
- **Antes:** Extrato simples com lista básica de movimentações
- **Depois:**
  - 6 tipos de filtros combinados
  - Agrupamento visual por data
  - 8 cards de estatísticas
  - Ícones visuais para identificação rápida
  - Links para transações originais
  - Estados de loading e empty bem definidos
  - UX profissional e intuitiva

---

## 🆕 ATUALIZAÇÕES RECENTES (V2.5.1 - 12/02/2026)

### 🐛 CORREÇÃO CRÍTICA: Validação de Pagamento no Checkout ✅ RESOLVIDO

**Status:** Completo e testado  
**Data:** 12/02/2026  
**Prioridade:** CRÍTICA  
**Impacto:** Pagamentos não estavam sendo registrados no banco de dados

#### Problema Identificado:
- **Sintoma:** Usuário clicava em "Finalizar Pagamento" no checkout, sistema retornava sucesso (204), mas nenhum pagamento era registrado na tabela `sale_payments`
- **Causa Raiz:** Inconsistência entre tipos TypeScript e validação do RPC
  - RPC `pay_sale` no banco de dados EXIGE `bankAccountId` obrigatório para todos os pagamentos
  - Repository TypeScript aceitava `bankAccountId` como opcional (`bankAccountId?: string`)
  - Quando `bankAccountId` era `undefined`, RPC falhava silenciosamente
- **Descoberta:** Análise de logs da API mostrou RPC retornando 204 mas sem criar registros

#### Solução Implementada:
1. **Tipo Corrigido:**
   ```typescript
   // ANTES (incorreto)
   payments: { method: PaymentMethod, amount: number, bankAccountId?: string }[]
   
   // DEPOIS (correto)
   payments: { method: PaymentMethod, amount: number, bankAccountId: string }[]
   ```

2. **Validação Adicionada:**
   ```typescript
   // Valida que todos os pagamentos têm conta bancária
   const invalidPayments = payments.filter(p => !p.bankAccountId);
   if (invalidPayments.length > 0) {
       throw new Error(`All payments must have a bank account ID. Missing for methods: ${invalidPayments.map(p => p.method).join(', ')}`);
   }
   ```

3. **Mensagem de Erro Clara:**
   - Antes: Falha silenciosa (204 mas sem dados)
   - Agora: Erro explícito listando métodos sem conta

#### Arquivos Modificados:
- `src/infrastructure/repositories/supabase/SupabaseSaleRepository.ts`
  - Método `pay()` atualizado
  - Tipo de parâmetro corrigido
  - Validação pré-RPC adicionada

#### Testes Realizados:
- ✅ Build passou sem erros TypeScript
- ✅ Validação de tipos confirmada
- ✅ Mensagem de erro testada (quando conta não selecionada)
- ✅ Fluxo completo de pagamento validado

#### Impacto:
- **Antes:** Pagamentos falhavam silenciosamente, vendas ficavam como "draft"
- **Depois:** 
  - Validação impede submissão sem conta bancária
  - Erro claro orienta usuário a selecionar conta
  - Pagamentos registrados corretamente
  - Integridade de dados garantida

#### Casos de Teste:
1. ✅ Pagamento com conta selecionada → Sucesso
2. ✅ Pagamento sem conta selecionada → Erro claro
3. ✅ Múltiplos métodos de pagamento → Todos validados
4. ✅ Venda existente (draft) → Pode ser paga novamente

#### Observações:
- Bug afetava TODAS as vendas desde implementação de contas bancárias
- Correção é retrocompatível (não quebra código existente)
- Validação client-side já existia no `PaymentDialog`, mas validação server-side era necessária
- RPC `pay_sale` sempre exigiu conta, mas tipo TypeScript não refletia isso

#### Próximos Passos:
- Monitorar logs de produção para confirmar correção
- Considerar adicionar validação similar em outros fluxos (compras, crédito)
- Documentar padrão de validação obrigatória para campos críticos

---

## 🆕 ATUALIZAÇÕES RECENTES (V2.5 - 12/02/2026)

### Criação Inline de Cliente no Agendamento ✅

#### 1. **Modal de Cadastro Rápido** ✅
- **Implementado:** Componente `ClientDialog` reutilizável para criação de cliente
- **Localização:** `src/components/clients/ClientDialog.tsx`
- **Comportamento:**
  - Abre como modal overlay sem sair do contexto de agendamento
  - Formulário completo com todos os campos do cliente
  - Validação Zod integrada
  - Feedback visual de loading durante salvamento
- **Integração:** Usado no `AppointmentForm` via botão "Novo Cliente"

#### 2. **Fluxo Otimizado de Agendamento** ✅
- **Antes:** Botão abria nova aba, usuário precisava voltar e atualizar manualmente
- **Agora:** 
  - Clique em "Novo Cliente" abre modal
  - Preenche dados do cliente
  - Salva e modal fecha automaticamente
  - Cliente recém-criado é selecionado automaticamente no agendamento
  - Lista de clientes atualizada em tempo real
  - Toast de confirmação: "Cliente cadastrado e selecionado!"
- **Benefício:** Fluxo contínuo sem perda de contexto

#### 3. **Gerenciamento de Estado Otimizado** ✅
- **Implementação Técnica:**
  - Estado `clientsVersion` para controlar recargas
  - Pattern de incremento (`v => v + 1`) para trigger de useEffect
  - Previne loops infinitos causados por recriação de funções
  - Callback `onSuccess` com auto-seleção do novo cliente
- **Arquivo:** `src/components/agenda/AppointmentForm.tsx`

#### 4. **Componentes Criados/Modificados** ✅
- **Novo:** `src/components/clients/ClientDialog.tsx`
  - Modal reutilizável para cadastro de cliente
  - Props: `isOpen`, `onOpenChange`, `onSuccess`
  - Retorna cliente criado via callback
- **Modificado:** `src/components/agenda/AppointmentForm.tsx`
  - Adicionado estado `clientDialogOpen`
  - Adicionado estado `clientsVersion` para refresh controlado
  - Integrado `ClientDialog` com callback de sucesso
  - Botão "Novo Cliente" agora abre modal ao invés de nova aba

### Melhorias no Checkout e Finalização de Atendimento (V2.3)

#### 1. **Indicador de Pagamento na Agenda** ✅
- **Implementado:** Ícone discreto de checkmark verde nos cards de agendamentos pagos
- **Localização:** Visível em todas as visualizações da agenda (Dia, Semana, Mês)
- **Comportamento:** 
  - Aparece no canto superior direito do card do agendamento
  - Tamanho adaptativo (menor em modo compacto)
  - Não aparece em slots bloqueados
- **Arquivo:** `src/app/(app)/agenda/page.tsx`

#### 2. **Fluxo de Checkout Melhorado** ✅
- **Progresso em 3 Etapas:**
  - Etapa 1: Itens (serviços + produtos)
  - Etapa 2: Pagamento (ativa ao clicar "Receber Pagamento")
  - Etapa 3: Concluído (mostra resumo final)
- **Animação de Celebração:**
  - Overlay com checkmark verde animado
  - Duração: 3 segundos
  - Botão para voltar à agenda manualmente
- **Comportamento:** Sistema permanece no passo 3 após pagamento para conferência
- **Auto-detecção:** Vendas já pagas vão direto para etapa 3 ao abrir checkout
- **Arquivo:** `src/app/(app)/appointments/[id]/checkout/page.tsx`

#### 3. **Modal de Pagamento Reformulado** ✅
- **Formatação Monetária:**
  - Todos os valores exibidos em formato brasileiro (R$ 1.234,56)
  - Inputs com máscara de moeda (vírgula como separador decimal)
  - Símbolo R$ fixo nos campos de entrada
  - Formatação automática ao sair do campo
- **Edição de Pagamentos:**
  - Botão de lápis para editar pagamentos já adicionados
  - Destaque visual (roxo) do pagamento em edição
  - Botão "Cancelar" para desistir da edição
  - Botão muda para "Salvar Alteração" durante edição
- **Melhorias de UX:**
  - Inputs maiores e mais legíveis (altura 56px)
  - Feedback visual claro do estado de edição
  - Não permite finalizar se houver pagamento sendo editado
  - Valores inicializados automaticamente com formatação correta
- **Arquivo:** `src/components/sales/PaymentDialog.tsx`

#### 4. **Proteção Contra Pagamentos Duplicados** ✅
- **Implementado:** Validação na função RPC `pay_sale`
- **Comportamento:** Impede processar pagamento em venda já paga
- **Mensagem de Erro:** "Esta venda já foi paga. Não é possível processar pagamento duplicado."
- **Benefício:** Evita registros duplicados durante testes ou cliques múltiplos
- **Arquivo:** Migration `prevent_duplicate_payments`

#### 5. **Descrições Melhoradas em Movimentos de Caixa** ✅
- **Formato Padronizado:** Todas as funções RPC agora geram descrições consistentes
- **Padrões por Tipo:**
  - Vendas: `Venda - [Método] - [Cliente] (troco R$ X)`
  - Recargas: `Recarga de Crédito - [Método] - [Cliente]`
  - Compras: `Compra - [Método] - [Fornecedor]`
  - Estornos: `Estorno - [Método] - [Cliente]`
- **Informações Incluídas:**
  - Nome do cliente/fornecedor
  - Método de pagamento em português
  - Valor do troco quando aplicável
- **Funções Atualizadas:**
  - `pay_sale`
  - `add_client_credit`
  - `create_purchase_with_movements`
  - `refund_sale`

---


---

## 🆕 ATUALIZAÇÕES RECENTES (V2.4) - SISTEMA FINANCEIRO COMPLETO

### 📸 UPLOAD DE FOTO DO CLIENTE (NOVO) ✅ IMPLEMENTADO

**Status:** Completo e funcional  
**Data:** 12/02/2026  
**Localização:** Integrado em `/clients/new`, `/clients/[id]/edit`, e ClientDialog

#### Funcionalidades Implementadas:
- ✅ **Componente PhotoUpload** (`src/components/clients/PhotoUpload.tsx`):
  - Interface de upload com drag & drop visual
  - Preview circular da foto em tempo real
  - Validação client-side de tipo (image/*) e tamanho (2MB)
  - Botão de remoção de foto
  - Estados de loading durante upload
  - Feedback visual de erro
  - Ícone de usuário como placeholder

- ✅ **API Route Segura** (`src/app/api/upload/client-photo/route.ts`):
  - Autenticação obrigatória via Supabase Auth
  - Validação server-side de tipo MIME (image/jpeg, image/png, image/webp)
  - Validação de tamanho (máximo 2MB)
  - Upload para Supabase Storage
  - Geração de nome único: `{user_id}/{timestamp}.{ext}`
  - Retorna URL pública da foto
  - Tratamento de erros completo

- ✅ **Supabase Storage Bucket**:
  - Bucket público: `client-photos`
  - Limite de tamanho: 2MB por arquivo
  - Tipos permitidos: JPEG, JPG, PNG, WEBP
  - Organização por usuário para isolamento
  - Políticas RLS configuradas:
    - INSERT: Apenas usuário autenticado na própria pasta
    - UPDATE: Apenas usuário autenticado na própria pasta
    - DELETE: Apenas usuário autenticado na própria pasta
    - SELECT: Público (qualquer pessoa pode visualizar)

- ✅ **Integração nos Formulários**:
  - `ClientForm.tsx`: Campo de upload no formulário completo
  - `ClientDialog.tsx`: Campo de upload no modal de criação rápida
  - Ambos salvam a URL no campo `photoUrl` do cliente
  - Validação integrada com React Hook Form e Zod

- ✅ **Exibição da Foto**:
  - Avatar no perfil do cliente (`/clients/[id]`)
  - Componente Avatar do shadcn/ui
  - Suporte a Next.js Image para otimização
  - Fallback automático com iniciais quando não há foto
  - Tamanho: 128x128px (32x32 em cards menores)
  - Borda branca e sombra para destaque

#### Arquivos Criados/Modificados:
**Novos:**
- `src/components/clients/PhotoUpload.tsx` - Componente de upload
- `src/app/api/upload/client-photo/route.ts` - API endpoint
- `supabase/migrations/20260212170000_create_client_photos_bucket.sql` - Migration do bucket
- `INSTRUCOES_FOTO_CLIENTE.md` - Documentação completa

**Modificados:**
- `src/components/clients/ClientForm.tsx` - Adicionado campo PhotoUpload
- `src/components/clients/ClientDialog.tsx` - Adicionado campo PhotoUpload
- `src/app/(app)/clients/[id]/page.tsx` - Já exibia foto (Avatar component)

#### Estrutura de Armazenamento:
```
client-photos/
  └── {user_id}/
      ├── 1707753600000.jpg
      ├── 1707753700000.png
      └── 1707753800000.webp
```

#### Como Configurar (Primeira Vez):
1. Acessar Dashboard do Supabase
2. Ir em Storage > New Bucket
3. Nome: `client-photos`
4. Público: ✅ Sim
5. Executar SQL das políticas RLS (ver migration)
6. Ou executar migration via CLI: `npx supabase db push`

#### Observações Técnicas:
- Campo `photo_url` já existia no schema do banco
- Upload é opcional (não obrigatório)
- Fotos antigas não são deletadas automaticamente (considerar cleanup futuro)
- URLs são públicas mas não listáveis (segurança por obscuridade)
- Cada usuário só pode gerenciar fotos na sua própria pasta
- Tenant isolation garantido via user_id nas pastas

#### Melhorias Futuras (Opcional):
- Compressão automática de imagens antes do upload
- Crop/redimensionamento de imagens
- Suporte a arrastar e soltar (drag & drop) de arquivos
- Galeria de fotos do cliente (múltiplas fotos)
- Limpeza automática de fotos não utilizadas
- Integração com câmera do dispositivo móvel

---

### 📊 SISTEMA DE CONTAS BANCÁRIAS (NOVO) 🚧 EM DESENVOLVIMENTO

**Status:** Especificação completa, implementação iniciando  
**Localização:** `/contas`, `/contas/[id]`  
**Spec:** `.kiro/specs/bank-accounts/`

#### Funcionalidades:
- ✅ **Especificação Completa:**
  - Requirements.md com 14 requisitos detalhados
  - Design.md com arquitetura completa e 25 propriedades de corretude
  - Tasks.md com 18 tarefas principais (3-4 dias de implementação)

- 🚧 **Gestão de Contas Bancárias:**
  - CRUD de contas (criar, editar, desativar)
  - Tipos de conta: Banco, Cartão de Crédito, Carteira Digital
  - Saldo inicial e saldo atual calculado
  - Ativação/desativação (soft delete)
  - Lista de contas com saldos em tempo real

- 🚧 **Integração com Movimentações:**
  - Toda movimentação de caixa vinculada a uma conta bancária
  - Campo `bank_account_id` adicionado à tabela `cash_movements`
  - Validação: conta deve existir e estar ativa
  - Migração de dados existentes para conta padrão "Caixa Geral"

- 🚧 **Seleção de Conta em Pagamentos:**
  - Checkout: Selecionar conta de destino para cada método de pagamento
  - Compras: Selecionar conta de origem para pagamentos
  - Recarga de crédito: Selecionar conta de destino
  - Movimentos manuais: Selecionar conta

- 🚧 **Extrato por Conta:**
  - Página de detalhes da conta (`/contas/[id]`)
  - Lista todas as movimentações da conta
  - Resumo: Saldo Inicial, Total Entradas, Total Saídas, Saldo Atual
  - Filtro por período
  - Link para transação original (venda, compra, etc)

- 🚧 **Componentes Novos:**
  - `AccountSelector` - Dropdown para selecionar conta
  - `BankAccountsList` - Lista de contas com saldos
  - `BankAccountDialog` - Formulário criar/editar conta
  - `AccountStatementView` - Extrato da conta

#### Banco de Dados:
```sql
-- Nova tabela
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- BANK, CARD, WALLET
  initial_balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Alteração em tabela existente
ALTER TABLE cash_movements 
ADD COLUMN bank_account_id UUID REFERENCES bank_accounts(id);
```

#### Funções RPC Atualizadas:
- `pay_sale` - Agora requer `bank_account_id`
- `create_purchase_with_movements` - Agora requer `bank_account_id`
- `add_client_credit` - Agora requer `bank_account_id`

---

### 💰 MELHORIAS NA PÁGINA DE CAIXA (NOVO) 🚧 EM DESENVOLVIMENTO

**Status:** Especificação completa, implementação após bank-accounts  
**Localização:** `/cash`  
**Spec:** `.kiro/specs/cash-improvements/`

#### Funcionalidades:
- ✅ **Especificação Completa:**
  - Requirements.md com 7 user stories
  - Design.md com arquitetura e 11 propriedades de corretude
  - Tasks.md com 10 tarefas principais (6 dias de implementação)
  - **ATUALIZADO** para incluir integração com contas bancárias

- 🚧 **Navegação Temporal Melhorada:**
  - Controles de mês/ano com botões "< Anterior" e "Próximo >"
  - Exibição clara do período selecionado (ex: "Janeiro 2026")
  - Filtros rápidos: Hoje, Ontem, 7 Dias, 30 Dias, Mês Atual, Ano Atual
  - Seletor de data customizado com calendário (react-day-picker)
  - Feedback visual do filtro ativo

- 🚧 **Agrupamento de Pagamentos:**
  - Vendas com múltiplos pagamentos aparecem como grupo expansível
  - Linha principal mostra: Cliente, Total, Ícone de expansão
  - Ao expandir: cada método de pagamento com valor e conta
  - Troco exibido quando aplicável
  - Visual diferenciado (borda, cor de fundo)
  - Compras também agrupadas

- 🚧 **Detalhes e Contexto:**
  - Botão "Ver Detalhes" em cada movimentação
  - Modal mostra: Cliente/Fornecedor, Data/Hora, Métodos, Itens, Notas, Conta
  - Link clicável para venda/compra original
  - Descrições enriquecidas com nome do cliente/fornecedor

- 🚧 **Filtros Avançados:**
  - Filtro por tipo: Todas, Entradas, Saídas
  - Filtro por método: Todos, PIX, Cartão, Dinheiro, Transferência
  - Filtro por origem: Todas, Venda, Compra, Estorno, Manual
  - **Filtro por conta bancária** (integração com bank-accounts)
  - Busca por texto (cliente, fornecedor, descrição)
  - Filtros combinados com lógica AND
  - Contador de resultados

- 🚧 **Exportação:**
  - Botão "Exportar" no topo da página
  - Opções: PDF e Excel/CSV
  - PDF formatado com logo, período, resumo e lista
  - **Resumo por conta bancária** no PDF
  - Excel/CSV com todas as colunas incluindo conta
  - Exportação respeita filtros ativos

- 🚧 **Resumos e Análises:**
  - Card "Resumo por Método" com totais por PIX, Cartão, etc
  - **Card "Resumo por Conta"** com totais por banco/cartão (NOVO)
  - Gráficos de pizza/barras (recharts)
  - Link para extrato da conta
  - Resumos respeitam filtros ativos

- 🚧 **Coluna de Conta:**
  - Todas as movimentações mostram nome da conta bancária
  - Integração visual em toda a interface
  - Agrupamento considera conta

#### Componentes Novos:
- `DateNavigator` - Navegação temporal melhorada
- `CashFilters` - Barra de filtros avançados
- `CashMovementGroup` - Grupo expansível de pagamentos
- `CashMovementDetailsDialog` - Modal de detalhes
- `PaymentMethodSummary` - Resumo por método
- `AccountSummary` - Resumo por conta bancária (NOVO)
- `ExportButton` - Exportação PDF/CSV

#### Dependências Novas:
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "papaparse": "^5.4.1",
  "recharts": "^2.10.3"
}
```

---

### 📋 ROADMAP DE IMPLEMENTAÇÃO

**Documento Consolidado:** `.kiro/specs/IMPLEMENTATION_ROADMAP.md`

#### Fase 1: Sistema de Contas Bancárias (Dias 1-4)
- Dia 1: Database e Domain Layer (8 tasks)
- Dia 2: Repository e Use Cases (9 tasks)
- Dia 3: Integração Cash Movements e RPC (6 tasks)
- Dia 4: UI Components e Integração (11 tasks)
- **Total:** 34 tasks principais

#### Fase 2: Melhorias do Caixa (Dias 5-10)
- Dia 5: Enhanced Date Navigation (4 tasks)
- Dia 6: Payment Grouping (4 tasks)
- Dia 7: Transaction Details (3 tasks)
- Dia 8: Advanced Filters (3 tasks)
- Dia 9: Export Functionality (5 tasks)
- Dia 10: Summaries (6 tasks)
- Final: Integration and Polish (3 tasks)
- **Total:** 28 tasks principais

#### Documentação Final:
- Atualizar PRD (docs/PRD_LALA_TESTSPRITE.md)
- Atualizar Inventário (INVENTARIO_COMPLETO.md)

**Total Geral:** 64 tasks principais  
**Estimativa:** 9-10 dias de desenvolvimento

---

### 🎯 COMO USAR O ROADMAP

O documento `.kiro/specs/IMPLEMENTATION_ROADMAP.md` contém:
- Ordem exata de execução de todas as tasks
- Descrição detalhada de cada task
- Critérios de validação
- Checkpoints para garantir qualidade
- Comandos para executar tasks

**Para iniciar:**
```
"Executar Task 1.1"
"Executar todas as tasks do Dia 1"
"Executar todas as tasks do roadmap"
```

---

### 🔗 INTEGRAÇÃO COMPLETA

O sistema financeiro ficará completamente integrado:

```
CONTAS BANCÁRIAS
    ↓
CASH MOVEMENTS (com bank_account_id)
    ↓
┌─────────┬──────────┬──────────┬──────────┐
│ VENDAS  │ COMPRAS  │ CRÉDITO  │ MANUAL   │
└─────────┴──────────┴──────────┴──────────┘
    ↓         ↓          ↓          ↓
CLIENTES  FORNECEDORES  CLIENTES  DESPESAS
```

**Rastreabilidade Total:**
- Cada centavo tem origem (venda/compra) e destino (conta)
- Saldo de cada conta em tempo real
- Reconciliação bancária facilitada
- Relatórios gerenciais completos
- Auditoria completa de movimentações

---



## Atualização 2026-02-12 - Melhorias no Extrato de Conta (Account Statement) ✅ COMPLETO

### Visão Geral
Implementação completa da Fase 1 das melhorias do extrato de conta bancária, fornecendo uma experiência rica de visualização e filtragem de movimentações financeiras.

### Componentes Criados
1. **src/components/bank-accounts/EnhancedAccountStatementView.tsx**
   - Componente principal do extrato melhorado
   - Integra todos os filtros e visualizações
   - Gerencia estado de filtros e dados filtrados
   - Calcula estatísticas estendidas em tempo real
   - Agrupa movimentações por data
   - Exibe resumos financeiros completos

2. **src/components/bank-accounts/StatementFilters.tsx**
   - Barra de filtros completa com 6 tipos de filtro
   - Integração com QuickPeriodFilters
   - Filtros de tipo (Todas/Entradas/Saídas) com botões visuais
   - Dropdown de método de pagamento
   - Dropdown de origem da transação
   - Campo de busca com debounce (300ms)
   - Contador de resultados
   - Botão "Limpar" para resetar todos os filtros
   - Indicador visual de filtros ativos

3. **src/components/bank-accounts/QuickPeriodFilters.tsx**
   - 6 botões de período predefinido
   - Períodos: Hoje, Ontem, 7 Dias, 30 Dias, Este Mês, Mês Passado
   - Cálculo automático de datas com date-fns
   - Indicador visual do período ativo
   - Layout responsivo com wrap

### Funcionalidades Implementadas

#### Sistema de Filtros
1. **Filtros Rápidos de Período:**
   - Hoje: startOfDay → endOfDay
   - Ontem: startOfDay(yesterday) → endOfDay(yesterday)
   - 7 Dias: últimos 7 dias completos
   - 30 Dias: últimos 30 dias completos
   - Este Mês: início do mês até hoje
   - Mês Passado: mês anterior completo

2. **Filtro por Tipo:**
   - Todas: sem filtro
   - Entradas: apenas movimentos IN
   - Saídas: apenas movimentos OUT
   - Botões com cores semânticas (verde/vermelho)

3. **Filtro por Método de Pagamento:**
   - Todos, PIX, Cartão, Dinheiro, Transferência, Carteira
   - Dropdown com labels em português
   - Filtra campo `method` das movimentações

4. **Filtro por Origem:**
   - Todas, Vendas, Compras, Estornos, Manual, Crédito
   - Dropdown com labels em português
   - Filtra campo `sourceType` das movimentações

5. **Busca por Texto:**
   - Busca em: descrição, nome do cliente, nome do fornecedor
   - Case-insensitive
   - Debounce de 300ms para performance
   - Botão X para limpar busca
   - Ícone de lupa visual

6. **Combinação de Filtros:**
   - Todos os filtros funcionam em conjunto (AND logic)
   - Contador mostra quantos resultados após filtros
   - Botão "Limpar" reseta todos de uma vez

#### Agrupamento por Data
- Movimentações agrupadas por dia
- Ordenação: mais recente primeiro
- Header de cada grupo mostra:
  - Data formatada: "dd/MM/yyyy (dia da semana)"
  - Total do dia em badge (verde se positivo, vermelho se negativo)
- Cada grupo é um card separado
- Movimentações dentro do grupo ordenadas por horário

#### Estatísticas Estendidas
**Cards de Resumo Principal (4 cards):**
1. Saldo Inicial (do período)
2. Total Entradas (filtrado)
3. Total Saídas (filtrado)
4. Saldo Atual

**Cards de Estatísticas Avançadas (4 cards):**
1. Maior Entrada (valor máximo de entrada)
2. Maior Saída (valor máximo de saída)
3. Ticket Médio (média de todas as transações)
4. Transações (contagem total)

Todas as estatísticas atualizam em tempo real conforme filtros são aplicados.

#### Visualização de Movimentações
**Card de Movimentação Individual:**
- Ícone visual baseado no tipo:
  - 🛒 Venda
  - 📦 Compra
  - ↩️ Estorno
  - ✏️ Manual
  - 💳 Crédito
- Horário (HH:mm)
- Descrição da transação
- Badge com método de pagamento
- Link "Ver detalhes →" (quando aplicável)
- Valor com cor (verde para entrada, vermelho para saída)
- Saldo após a transação
- Hover effect para melhor UX

**Links para Transações Originais:**
- Vendas: link para `/appointments/[id]/checkout`
- Compras: link para `/purchases/[id]`
- Outros tipos: sem link (manual, crédito)

#### Estados Especiais
1. **Loading State:**
   - Skeleton loaders para cards
   - Skeleton para lista de movimentações
   - Transições suaves quando dados carregam

2. **Empty State:**
   - Mensagem amigável quando não há movimentações
   - Texto diferente para: sem dados vs filtros sem resultado
   - Sugestões de ação (ajustar filtros, registrar transação)

3. **Refresh:**
   - Botão "Atualizar" no header
   - Ícone de loading animado durante refresh
   - Mantém filtros ativos após refresh

### Domain Models Atualizados
**src/core/domain/BankAccount.ts:**
- Adicionado `MovementWithBalance` interface:
  - Estende `AccountMovement`
  - Adiciona `customerName?: string`
  - Adiciona `supplierName?: string`
  - Adiciona `icon: string` (emoji visual)
- Adicionado `ExtendedStats` interface:
  - `highestEntry: number`
  - `highestExit: number`
  - `averageTicket: number`
  - `transactionCount: number`
- Adicionado `FilterValues` interface (em StatementFilters.tsx):
  - `quickPeriod?: string`
  - `startDate?: Date`
  - `endDate?: Date`
  - `type: 'all' | 'in' | 'out'`
  - `method: PaymentMethod | 'all'`
  - `source: SourceType | 'all'`
  - `searchText: string`
- Exportados tipos: `PaymentMethod`, `SourceType`

### Repository Enhancements
**src/infrastructure/repositories/supabase/SupabaseBankAccountRepository.ts:**
- Método `getStatement()` atualizado para retornar `MovementWithBalance[]`
- Adicionada função helper `getMovementIcon()`:
  - Mapeia `sourceType` para emoji apropriado
  - Retorna ícone visual para cada tipo de transação
- Movimentações já vêm enriquecidas com:
  - Nome do cliente (quando aplicável)
  - Nome do fornecedor (quando aplicável)
  - Ícone visual

### Page Integration
**src/app/(app)/contas/[id]/page.tsx:**
- Substituído `AccountStatementView` por `EnhancedAccountStatementView`
- Mantida estrutura de loading e navegação
- Adicionado suporte a refresh
- Skeleton loading durante carregamento inicial
- Mensagem de erro quando conta não encontrada

### Especificações Técnicas
**Bibliotecas Utilizadas:**
- date-fns: Manipulação e formatação de datas
- date-fns/locale/ptBR: Localização em português
- lucide-react: Ícones (Filter, Search, X, RefreshCw, TrendingUp, TrendingDown, DollarSign, Hash)
- React hooks: useState, useMemo, useCallback, useEffect

**Performance:**
- Filtros aplicados com `useMemo` para evitar recálculos desnecessários
- Debounce na busca para reduzir renderizações
- Agrupamento calculado apenas quando dados ou filtros mudam
- Estatísticas calculadas de forma eficiente com reduce

**Responsividade:**
- Grid de cards: 2 colunas (mobile) → 4 colunas (desktop)
- Filtros: stack vertical (mobile) → grid horizontal (desktop)
- Cards de movimentação: layout adaptativo
- Touch-friendly em dispositivos móveis

### Build e Testes
- ✅ Build passou sem erros (0 errors)
- ✅ TypeScript compilation successful
- ✅ Todos os componentes tipados corretamente
- ✅ Integração com página existente funcional
- ✅ Filtros funcionando corretamente
- ✅ Agrupamento por data operacional
- ✅ Estatísticas calculando corretamente
- ✅ Links para transações funcionando

### Documentação Criada
1. **.kiro/specs/account-statement-improvements/requirements.md**
   - 17 user stories detalhadas
   - Critérios de aceitação para cada funcionalidade
   - Requisitos não-funcionais (performance, usabilidade, acessibilidade)
   - Métricas de sucesso

2. **.kiro/specs/account-statement-improvements/design.md**
   - Arquitetura de componentes
   - Fluxo de dados
   - Estrutura de filtros
   - Cálculos de estatísticas
   - Decisões de design

3. **.kiro/specs/account-statement-improvements/tasks.md**
   - 68 tasks organizadas em 4 fases
   - Estimativa de 6-8 dias de desenvolvimento
   - Fase 1 (Essentials): COMPLETA ✅
   - Fases 2-4: Planejadas para futuro

### Próximas Implementações (Opcional)
**Fase 2 - Important (2 dias):**
- Gráfico de evolução de saldo (line chart)
- Paginação (50 itens por página)
- Ordenação customizada por coluna

**Fase 3 - Desirable (1-2 dias):**
- Exportação para PDF/Excel
- Toggle de visualização compacta/detalhada
- Auto-refresh em tempo real

**Fase 4 - Polish (1 dia):**
- Melhorias de acessibilidade
- Testes automatizados
- Otimizações de performance

### Status Final
- ✅ Fase 1 (Essentials): 100% COMPLETA
- ✅ 11 funcionalidades principais implementadas
- ✅ 3 componentes novos criados
- ✅ Domain models expandidos
- ✅ Repository enriquecido
- ✅ Build passando sem erros
- ✅ Pronto para teste em produção

---

## Atualização 2026-02-12 - Melhorias no Sistema de Contas Bancárias

### Novos Componentes Criados
1. **src/components/bank-accounts/ColorPicker.tsx**
   - Seletor de cores com palette predefinida
   - Input de cor customizada (HTML5 color picker)
   - 10 cores preset otimizadas para UI

2. **src/components/bank-accounts/IconPicker.tsx**
   - Grid de seleção de emojis/ícones
   - 15 ícones preset relacionados a finanças
   - Seleção visual com hover e estado ativo

3. **src/components/bank-accounts/BankAccountCard.tsx**
   - Card rico para exibição de conta
   - Borda colorida com cor da conta
   - Exibe: ícone, nome, tipo, saldo, favorita, dados bancários
   - Ações rápidas: Ver Dashboard, Editar, Ativar/Desativar
   - Responsivo e touch-friendly

### Componentes Atualizados
1. **src/components/bank-accounts/BankAccountDialog.tsx**
   - Adicionados campos: cor, ícone, descrição, limite de crédito, dados bancários, favorita
   - Preview ao vivo da conta durante edição
   - Validações para todos os novos campos
   - Seção colapsável para dados bancários
   - Toggle de conta favorita com estrela
   - Auto-atualização de ícone/cor ao mudar tipo

2. **src/app/(app)/contas/page.tsx**
   - Substituída tabela por grid de cards
   - Adicionados 3 cards de resumo financeiro
   - Gráfico de pizza para distribuição de saldos
   - Filtros: Todas/Ativas/Inativas
   - Busca por nome ou banco
   - Estado vazio amigável
   - Skeleton loading

### Domain Models Expandidos
1. **src/core/domain/BankAccount.ts**
   - Adicionados campos de personalização: color, icon, description
   - Adicionados campos bancários: creditLimit, bankName, agency, accountNumber
   - Adicionados campos de organização: isFavorite, displayOrder
   - Novas interfaces: BankAccountWithStats, AccountDashboardData, BalancePoint, InOutData, DistributionData

### Repository Interfaces Expandidas
1. **src/core/repositories/BankAccountRepository.ts**
   - CreateBankAccountInput: adicionados 9 novos campos opcionais
   - UpdateBankAccountInput: adicionados 9 novos campos opcionais
   - Novos métodos: listWithStats(), setFavorite(), updateOrder(), getDashboard()
   - Nova interface: GetDashboardFilters

### Repository Implementation
1. **src/infrastructure/repositories/supabase/SupabaseBankAccountRepository.ts**
   - Implementados métodos getDefaultColor() e getDefaultIcon()
   - Atualizado create() para aceitar todos os novos campos
   - Atualizado update() para aceitar todos os novos campos
   - Atualizado list() para ordenar por: favorita → ordem customizada → nome
   - Implementado listWithStats() com cálculos de totalIn, totalOut, movementCount
   - Implementado setFavorite() para marcar conta principal
   - Implementado updateOrder() para reordenação customizada
   - Implementado getDashboard() com geração de dados para gráficos
   - Métodos auxiliares: generateBalanceEvolution(), generateInOutComparison(), generateDistribution(), calculateStats()
   - Atualizado mapFromDb() para incluir todos os novos campos

### Use Cases Atualizados
1. **src/core/usecases/bank-accounts/CreateBankAccount.ts**
   - Importa CreateBankAccountInput do repository
   - Validação de limite de crédito
   - Passa todos os campos para o repository

2. **src/core/usecases/bank-accounts/UpdateBankAccount.ts**
   - Importa UpdateBankAccountInput do repository
   - Validação de limite de crédito
   - Passa todos os campos para o repository

### Migrações de Banco de Dados
1. **Migration: add_bank_account_enhanced_fields**
   - Adicionados 9 novos campos em bank_accounts
   - Criados índices em display_order e is_favorite
   - Auto-população de contas existentes com cores/ícones baseados no tipo
   - Valores padrão apropriados para cada campo

2. **Migration: fix_bank_accounts_rls_policies**
   - Corrigidas policies RLS para usar get_my_tenant_id()
   - Substituídas policies incorretas que usavam JWT metadata
   - Garantida isolação correta entre tenants

### Bibliotecas Utilizadas
- recharts: Gráficos (PieChart para distribuição de saldos)
- lucide-react: Ícones (Search, TrendingUp, TrendingDown, Wallet, Star, Eye, Edit, Power)
- date-fns: Manipulação de datas para gráficos

### Melhorias de UX/UI
- Design glassmorphism consistente com página de caixa
- Cores semânticas: verde para positivo, vermelho para negativo
- Skeleton loading para melhor perceived performance
- Animações suaves em hover e transições
- Grid responsivo: 3 colunas (desktop) → 2 (tablet) → 1 (mobile)
- Touch targets otimizados para mobile (mínimo 44px)
- Estados vazios com mensagens úteis e CTAs
- Preview ao vivo no formulário

### Dados de Teste Atualizados
- Caixa Geral: cor #F59E0B (amber), ícone 💰, favorita, ordem 0
- Nubank: cor #820AD1 (roxo), ícone 💜, ordem 1
- Banco Bradesco: cor #CC092F (vermelho), ícone 🏦, ordem 2
- PicPay: cor #11C76F (verde), ícone 💚, ordem 3
- Cartão Crédito: cor #EF4444 (vermelho), ícone 💳, ordem 4

### Próximas Implementações Planejadas
1. Dashboard individual da conta (Fase 2)
   - Gráficos de evolução de saldo
   - Gráficos de entradas vs saídas
   - Gráfico de distribuição por origem
   - Estatísticas rápidas
   - Extrato detalhado melhorado

2. Transferências entre contas (Fase 4)
   - Dialog de transferência
   - Vinculação de movimentações
   - Histórico de transferências

3. Exportação e relatórios (Fase 5)
   - Exportar extrato em PDF/Excel/CSV
   - Relatório comparativo de contas

4. Metas e alertas (Fase 6)
   - Definir metas de saldo
   - Alertas de saldo baixo
   - Notificações

5. Seletores melhorados (Fase 3)
   - AccountSelector com saldo e sugestões
   - Validação de saldo em tempo real
   - Integração em vendas/compras

### Arquivos de Especificação
- `.kiro/specs/bank-accounts-improvements/requirements.md`: Requisitos completos das 8 fases
- `.kiro/specs/bank-accounts-improvements/design.md`: Design técnico detalhado
- `.kiro/specs/bank-accounts-improvements/tasks.md`: Lista de tasks organizadas por fase

# 📋 INVENTÁRIO COMPLETO DO SISTEMA LALA
**Data:** 12/02/2026
**Status:** CONSOLIDADO V2.4 (12/02/2026) - INLINE CLIENT CREATION + MELHORIAS CHECKOUT + AGENDA + PAGAMENTOS

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

### 4. FINANCEIRO
- **Compras** (Grupo Unificado)
  - Gestão de Compras (`/purchases`)
  - Base de Fornecedores (`/suppliers`)

### 5. SISTEMA
- Relatórios
- Configurações

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

### 1. **CLIENTES** ✅ Completo
**Status:** Implementado e funcional  
**Localização:** `/clients`

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
  - **Visão Geral:** Resumo, últimos serviços, próximos agendamentos
  - **Histórico:** Lista de agendamentos passados com status e valores
  - **Crédito:** Movimentações de crédito (adicionar/debitar)
  - **Produtos:** Produtos consumidos pelo cliente
- ✅ Saldo de crédito visível com **destaque vermelho para Fiado/Dívida**
- ✅ Ação rápida de agendamento direto do perfil
- ✅ Campo destacado de "Observações Gerais"
- ✅ Aba "Histórico" (antiga Agenda) com detalhes financeiros
- ✅ Design responsivo premium

#### Campos do cadastro:
```typescript
{
  id: string
  name: string (obrigatório)
  birthDate: string (obrigatório, formato YYYY-MM-DD)
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
- ✅ Upload real de foto funcional (Supabase Storage com isolamento por Tenant)
- ❌ Integração com WhatsApp
- ❌ Histórico de compras detalhado (apenas agendamentos)
- ❌ Relatórios de cliente

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

### 5. **COMPRAS** ✅ Completo
**Status:** Implementado e funcional
**Localização:** `/purchases`

#### O que está implementado:
- ✅ Listagem de compras (tabela) com filtro por fornecedor
- ✅ Registro de nova compra (Master-Detail):
  - Seleção de fornecedor
  - Adição dinâmica de múltiplos produtos
  - Definição de quantidade e custo unitário
  - Cálculo automático de totais
- ✅ Visualização de detalhes da compra (read-only)
- ✅ **Integração com Estoque:** Criação automática de movimentações de entrada (IN) ao registrar compra
- ✅ Link reverso de movimentação de produto para detalhes da compra

#### Campos do cadastro:
```typescript
{
  id: string
  supplierId: string
  date: string (YYYY-MM-DD)
  items: PurchaseItem[]
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
}

PurchaseItem {
  productId: string
  quantity: number
  unitCost: number
}
```

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

### 8. **DASHBOARD** ⚠️ Parcial
**Status:** Implementado mas limitado  
**Localização:** `/dashboard`

#### O que está implementado:
- ✅ Cards de estatísticas:
  - Faturamento total
  - Ticket médio
  - Lucro estimado
  - Estoque crítico
- ✅ Filtro por período (mês atual, mês anterior, todo período)
- ✅ Gráficos simples (barras horizontais):
  - Top serviços por faturamento
  - Serviços mais realizados
  - Alertas de estoque
  - Faturamento com produtos
- ✅ Cálculo de margem de lucro

#### O que NÃO está implementado:
- ❌ Gráficos de linha (evolução temporal)
- ❌ Comparativo entre períodos
- ❌ Métricas de profissionais
- ❌ Taxa de ocupação da agenda
- ❌ Taxa de cancelamento/no-show
- ❌ Clientes novos vs recorrentes
- ❌ Exportação de relatórios

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

#### ❌ Campo "Preferências" no Cliente
**Status:** NÃO EXISTE no código atual  
**Nota:** Mencionado nas conversas anteriores mas nunca foi implementado

#### ✅ Campo "photoUrl" funcional
**Status:** RESOLVIDO
**Solução:** Implementado Supabase Storage com buckets isolados por `tenantId`.

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

**Versão Final:** V2.4
**Data:** 12/02/2026
**Status:** OFICIAL E AUDITADO — INLINE CLIENT CREATION + CHECKOUT IMPROVEMENTS + AGENDA INDICATORS + PAYMENT DIALOG ENHANCEMENTS

---

## 🆕 ATUALIZAÇÕES RECENTES (V2.4 - 12/02/2026)

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

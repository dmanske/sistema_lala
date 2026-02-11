# 📋 INVENTÁRIO COMPLETO DO SISTEMA LALA
**Data:** 11/02/2026
**Status:** CONSOLIDADO V1.5 (11/02/2026) - VERSÃO DEFINITIVA

---

## 🎯 VISÃO GERAL

Sistema de gestão para salão de beleza desenvolvido em **Next.js 15** com **TypeScript**, utilizando **localStorage** como persistência temporária (preparado para migração futura para Supabase).

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

### 1. **CLIENTES** ✅ Completo
**Status:** Implementado e funcional  
**Localização:** `/clients`

#### O que está implementado:
- ✅ Listagem de clientes (grid e tabela)
- ✅ Busca por nome/telefone
- ✅ Filtro por status (ACTIVE, INACTIVE, ATTENTION)
- ✅ Paginação (10 itens por página)
- ✅ Criação de novo cliente
- ✅ Edição de cliente
- ✅ Exclusão de cliente (com validação de histórico)
- ✅ Perfil detalhado do cliente com 4 abas:
  - **Visão Geral:** Resumo, últimos serviços, próximos agendamentos
  - **Histórico:** Lista de agendamentos passados com status e valores
  - **Crédito:** Movimentações de crédito (adicionar/debitar)
  - **Produtos:** Produtos consumidos pelo cliente
- ✅ Saldo de crédito visível
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
- ❌ Upload real de foto (campo existe mas não funcional)
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
- ✅ Visualização em 3 modos: Dia, Semana, Mês
- ✅ Navegação entre períodos
- ✅ Criação de agendamento
- ✅ Edição de agendamento
- ✅ Alteração de status (PENDING, CONFIRMED, CANCELED, NO_SHOW, DONE)
- ✅ Popover com detalhes do agendamento
- ✅ Busca por cliente ou serviço
- ✅ Grid de horários (5h às 23:30, intervalos de 30min)
- ✅ Suporte a múltiplos agendamentos no mesmo horário
- ✅ Cores diferentes por status
- ✅ Botão "Finalizar Atendimento" que redireciona para checkout
- ✅ Exibição de observações do agendamento (no popover)
- ✅ Grid refinado com slots de 30 minutos (05:00 às 23:30)
- ✅ Bloqueio de horários (indisponibilidade/pessoal)
- ✅ Validação de conflito (impede agendamento em horário bloqueado)
- ✅ Design premium com glassmorphism
- ✅ **Drag & Drop** nativo (Ghost Card + Snap 30min)
- ✅ Grid visual compacto (80px) + Indicador de Tempo

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
2. Selecionar cliente, profissional, serviços
3. Escolher data e horário
4. Adicionar observações (opcional)
5. Salvar

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

#### ❌ Campo "photoUrl" não funcional
**Onde:** `Client.ts`  
**Problema:** Campo existe mas não há upload de imagem implementado  
**Solução:** Implementar upload ou remover campo

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
- **Status:** Campo `photoUrl` existe, mas sem storage.
- **Ação:** Implementar junto com Supabase Storage (Bucket 'avatars').

#### 2. Agendamento Recorrente
- **Status:** Adiado para pós-MVP.
- **Decisões Pendentes:** Padrões (semanal/mensal), período de geração, edição em série vs ocorrência.

---

## 🚀 ESTRATÉGIA DE MIGRAÇÃO (SUPABASE)

**Ordem Sugerida de Migração:**
1.  **Clientes** (Base de tudo)
2.  **Serviços** (Dependência para Agendamentos)
3.  **Produtos** (Dependência para Vendas)
4.  **Agenda/Agendamentos** (Core do negócio)
5.  **Checkout/Vendas e Crédito** (Complexidade maior, depende de todos)

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

## 📁 ESTRUTURA DE ARQUIVOS (v1.5)

```text
src/app/
├── agenda/page.tsx
├── appointments/[id]/checkout/page.tsx
├── clients/
│   ├── [id]/page.tsx
│   ├── new/page.tsx
│   └── page.tsx
├── dashboard/page.tsx
├── products/
│   ├── [id]/page.tsx
│   ├── pos/page.tsx
│   └── page.tsx
├── professionals/page.tsx
├── purchases/
│   ├── [id]/page.tsx
│   ├── new/page.tsx
│   └── page.tsx
├── services/page.tsx
├── suppliers/
│   ├── [id]/page.tsx
│   ├── new/page.tsx
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

---

## 🔍 OBSERVAÇÕES FINAIS

### Pontos Fortes:
- ✅ Arquitetura limpa e organizada (Clean Architecture)
- ✅ TypeScript com tipagem forte e schemas Zod
- ✅ Design premium e responsivo (shadcn/ui)
- ✅ Separação clara de domínio e infraestrutura

### Pontos de Atenção:
- ⚠️ Persistência temporária em `localStorage` (Prioridade de migração para Supabase).
- ⚠️ Campo `photoUrl` estruturado mas aguardando Storage.
- ⚠️ Backups manuais necessários enquanto local.

### Próximos Passos (Resumo):
1. Migração para Supabase (Banco + Auth + Storage).
2. Pólimento de UI (Uploads, Relatórios).
3. Expansão de Features (Recorrência de Agenda).

---

**Versão Final:** V1.5
**Data:** 11/02/2026
**Status:** OFICIAL E AUDITADO

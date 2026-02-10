# 📋 INVENTÁRIO COMPLETO DO SISTEMA LALA
**Data:** 10/02/2026  
**Status:** DESENVOLVIMENTO ATIVO - REFATORAÇÃO DE VENDAS E CHECKOUT

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

---

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
  referenceId?: string (ID do agendamento ou ajuste)
  date: string (ISO)
}
```

#### O que NÃO está implementado:
- ❌ Código de barras
- ❌ Categorias de produtos
- ❌ Fornecedores
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

### 4. **AGENDA** ✅ Parcialmente Completo
**Status:** Funcional com limitações  
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
- ❌ Drag & drop para reagendar
- ❌ Integração com calendário externo

---

### 5. **VENDAS/CHECKOUT** ✅ Implementado
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
- ❌ Estorno/reembolso funcional
- ❌ Vendas avulsas (sem agendamento)
- ❌ Desconto
- ❌ Parcelamento
- ❌ Nota fiscal
- ❌ Relatório de vendas

---

### 6. **DASHBOARD** ⚠️ Parcial
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

### 7. **CRÉDITO** ✅ Implementado
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

### 8. **PROFISSIONAIS** ✅ Completo
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

### ⚠️ Fluxos Incompletos:

#### 1. **Exclusão de Serviço**
- Usa `confirm()` do navegador (proibido pelas regras)
- Deveria usar dialog customizado

#### 2. **Uso de Crédito no Checkout**
- Crédito existe mas não é usado automaticamente
- Não há opção de pagar com crédito

#### 3. **Estorno de Venda**
- Status 'refunded' existe mas não há fluxo implementado
- Não reverte estoque

---

## 🚨 PROBLEMAS ENCONTRADOS

### 1. **UX / Interface**

#### ❌ Uso de `alert/confirm/prompt` do navegador
**Onde:** `/services/page.tsx` linha 44
```typescript
if (confirm("Tem certeza que deseja excluir este serviço?")) {
```
**Problema:** Viola as regras do projeto (proibido usar dialogs nativos)  
**Solução:** Criar componente `DeleteServiceDialog` similar ao `DeleteClientDialog`

---

### 2. **Campos Genéricos/Não Definidos**

#### ❌ Campo "Preferências" no Cliente
**Status:** NÃO EXISTE no código atual  
**Nota:** Mencionado nas conversas anteriores mas nunca foi implementado

#### ❌ Campo "photoUrl" não funcional
**Onde:** `Client.ts`  
**Problema:** Campo existe mas não há upload de imagem implementado  
**Solução:** Implementar upload ou remover campo

---

### 3. **Inconsistências**

#### ✅ Profissionais e Serviços Mockados (Removidos)
**Status:** Resolvido. Módulos reais implementados com persistência local.

---

### 4. **Funcionalidades Duplicadas**

#### ⚠️ Cálculo de Estoque
**Problema:** `currentStock` é armazenado no produto mas deveria ser calculado dinamicamente a partir das movimentações  
**Risco:** Inconsistência entre movimentações e estoque registrado  
**Solução:** Implementar helpers sugeridos na conversa `c918e459`:
- `computeStockByProduct(productId)`
- `getStockMapByProducts()`
- `getLowStockProducts(threshold?)`

---

### 5. **Validações Faltando**

#### ⚠️ Validação de Conflito Parcial
**Status:** Bloqueios impedem agendamentos, mas agendamentos normais permitem sobreposição (overbooking intencional?)
**Ação:** Confirmar se overbooking deve ser bloqueado ou permitido.

#### ❌ Validação de Estoque no Checkout
**Problema:** Permite adicionar produtos sem estoque suficiente  
**Solução:** Validar antes de adicionar item à venda

---

## 📊 RESUMO EXECUTIVO

### Módulos por Status:

| Módulo | Status | Completude |
|--------|--------|------------|
| Clientes | ✅ Completo | 95% |
| Produtos | ✅ Completo | 90% |
| Serviços | ✅ Completo | 100% |
| Agenda | ✅ Completo | 95% |
| Vendas/Checkout | ✅ Completo | 100% |
| Profissionais | ✅ Completo | 100% |
| Dashboard | ⚠️ Parcial | 60% |
| Crédito | ✅ Completo | 100% |

### ⚠️ Pendências Detalhadas (Não travam MVP)

#### 1. Estorno/Reembolso
- **Status:** ✅ Completo
- **Implementação:** Fluxo de reembolso com reversão de estoque criado (`RefundSale`). Botão de "Estornar" adicionado ao Checkout.

#### 2. Foto do Cliente (Upload Real)
- **Status:** Campo `photoUrl` existe, mas sem storage.
- **Ação:** Implementar junto com Supabase Storage (Bucket 'avatars').

#### 3. Padronização de Seeds (Limpeza Final)
- **Status:** ✅ Completo
- **Ação:** Seeds de Clientes e Serviços extraídos para `src/lib/seedClients.ts` e `src/lib/seedServices.ts`.

#### 4. Agendamento Recorrente
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

1. **Remover `confirm()` do navegador**
   - Criar `DeleteServiceDialog.tsx`
   - Substituir em `/services/page.tsx`

2. **Implementar helpers de estoque**
   - `computeStockByProduct()`
   - `getStockMapByProducts()`
   - `getLowStockProducts()`

3. **Adicionar validação de conflito de horários (Opcional)**
   - Atualmente permite overbooking de clientes (apenas bloqueios são restritos)
   - Decidir se deve bloquear overbooking geral

4. **Implementar estorno de vendas**
   - Fluxo de refund
   - Reversão de estoque
   - Atualização de status do agendamento

---

### Prioridade MÉDIA (Completar Funcionalidades):

5. **Criar perfil de Serviço**
   - Página de detalhes
   - Histórico de execuções
   - Estatísticas

---

### Prioridade BAIXA (Melhorias):

7. **Implementar upload de imagens**
   - Para clientes
   - Para produtos
   - Integração com storage

8. **Adicionar relatórios**
   - Vendas por período
   - Produtos mais vendidos
   - Clientes mais frequentes

9. **Notificações e lembretes**
    - WhatsApp
    - E-mail
    - Push notifications

---

## 📁 ESTRUTURA DE ARQUIVOS

```
src/
├── app/                          # Rotas Next.js
│   ├── agenda/page.tsx          # Agenda principal
│   ├── appointments/
│   │   └── [id]/checkout/page.tsx
│   ├── clients/
│   │   ├── page.tsx             # Lista
│   │   ├── new/page.tsx         # Criar
│   │   └── [id]/
│   │       ├── page.tsx         # Perfil
│   │       └── edit/page.tsx    # Editar
│   ├── dashboard/page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── pos/page.tsx
│   │   └── [id]/page.tsx
│   ├── services/page.tsx
│   └── page.tsx                 # Redirect
│
├── components/
│   ├── agenda/
│   │   └── AppointmentForm.tsx
│   ├── clients/
│   │   ├── DeleteClientDialog.tsx
│   │   └── tabs/
│   │       ├── ClientSummaryTab.tsx
│   │       ├── ClientAppointmentsTab.tsx
│   │       ├── ClientCreditTab.tsx
│   │       └── ClientProductsTab.tsx
│   ├── products/
│   │   ├── ProductDialog.tsx
│   │   ├── DeleteProductDialog.tsx
│   │   └── StockAdjustmentDialog.tsx
│   ├── sales/
│   │   ├── CheckoutForm.tsx
│   │   ├── AddProductDialog.tsx
│   │   ├── PaymentDialog.tsx
│   │   └── SaleSummaryCard.tsx
│   ├── services/
│   │   └── ServiceDialog.tsx
│   └── ui/                      # shadcn/ui components
│
├── core/
│   ├── domain/                  # Entidades e schemas
│   │   ├── Client.ts
│   │   ├── Product.ts
│   │   ├── Service.ts
│   │   ├── Appointment.ts
│   │   ├── Credit.ts
│   │   ├── sales/
│   │   │   ├── types.ts
│   │   │   └── schemas.ts
│   │   └── stock/
│   │       ├── types.ts
│   │       └── schemas.ts
│   │
│   ├── formatters/              # Formatadores
│   │   ├── name.ts
│   │   ├── phone.ts
│   │   └── date.ts
│   │
│   ├── repositories/            # Interfaces
│   │   └── ...Repository.ts
│   │
│   ├── services/                # Serviços de domínio
│   │   ├── ClientService.ts
│   │   ├── ProductService.ts
│   │   ├── ServiceService.ts
│   │   └── AppointmentService.ts
│   │
│   └── usecases/                # Casos de uso
│       └── sales/
│           ├── CreateSale.ts
│           ├── PaySale.ts
│           └── RefundSale.ts
│
├── infrastructure/
│   └── repositories/            # Implementações localStorage
│       ├── LocalStorageClientRepository.ts
│       ├── LocalStorageProductRepository.ts
│       ├── LocalStorageServiceRepository.ts
│       ├── LocalStorageAppointmentRepository.ts
│       └── sales/
│           └── LocalStorageSaleRepository.ts
│
└── hooks/
    ├── useProducts.ts
    └── useServices.ts
```

---

## 🔍 OBSERVAÇÕES FINAIS

### Pontos Fortes:
- ✅ Arquitetura limpa e bem organizada
- ✅ TypeScript com tipagem forte
- ✅ Design premium e responsivo
- ✅ Separação clara de responsabilidades
- ✅ Componentes reutilizáveis

### Pontos de Atenção:
- ⚠️ Dados mockados (profissionais)
- ⚠️ localStorage (migração para Supabase pendente)
- ⚠️ Falta de validações em alguns fluxos
- ⚠️ Alguns campos não funcionais (photoUrl)
- ⚠️ Uso de `confirm()` nativo

### Preparação para Supabase:
O sistema está bem estruturado para migração:
- Repositórios isolados
- Schemas Zod prontos
- Estrutura de dados clara
- Separação de concerns

**Checklist sugerido na conversa c918e459 deve ser seguido.**

---

**Documento gerado em:** 10/02/2026  
**Versão:** 1.0  
**Próxima revisão:** Após correção dos problemas de prioridade ALTA

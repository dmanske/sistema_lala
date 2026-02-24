# Integração Caixa ↔ Conta Bancária

**Data**: 24/02/2026
**Status**: ✅ IMPLEMENTADO

## Objetivo

Vincular cada caixa (cash register) a uma conta bancária específica, permitindo rastreabilidade completa das movimentações financeiras e preparando o sistema para conciliação bancária.

## Implementação

### 1. Database (Migration)

**Arquivo**: `add_bank_account_to_cash_registers`

- Adicionada coluna `bank_account_id` na tabela `cash_registers`
- Foreign key para `bank_accounts(id)`
- Índice para performance
- Migração de dados existentes para "Caixa Geral"

```sql
ALTER TABLE cash_registers
ADD COLUMN bank_account_id UUID REFERENCES bank_accounts(id);

CREATE INDEX idx_cash_registers_bank_account_id 
ON cash_registers(bank_account_id);
```

### 2. RPC Function

**Arquivo**: `update_abrir_caixa_rpc_with_account`

Atualizada função `abrir_caixa_rpc` para aceitar `p_bank_account_id`:

```sql
CREATE OR REPLACE FUNCTION public.abrir_caixa_rpc(
    p_initial_balance NUMERIC,
    p_bank_account_id UUID,
    p_opened_by UUID DEFAULT NULL
)
```

**Validações adicionadas:**
- Verifica se a conta existe
- Verifica se a conta pertence ao tenant
- Verifica se a conta está ativa

### 3. Domain Layer

**Arquivos atualizados:**
- `src/core/domain/entities/CashRegister.ts`
- `src/core/repositories/CashRegisterRepository.ts`

**Mudanças:**
```typescript
export interface CashRegister {
    // ... campos existentes
    bankAccountId?: string  // NOVO
}

export interface CashRegisterWithUser extends CashRegister {
    openedByName?: string
    closedByName?: string
    bankAccountName?: string  // NOVO
}

export interface CreateCashRegisterInput {
    openedBy: string
    initialBalance: number
    bankAccountId: string  // NOVO (obrigatório)
    notes?: string
}
```

### 4. Repository Layer

**Arquivo**: `src/infrastructure/repositories/supabase/SupabaseCashRegisterRepository.ts`

**Mudanças:**
- Método `create()` agora envia `p_bank_account_id` para a RPC
- Método `getSummary()` busca o nome da conta bancária
- Método `mapFromDb()` inclui `bankAccountId`

### 5. UI Components

**Arquivo**: `src/components/cash/CashRegisterDialog.tsx`

**Funcionalidades adicionadas:**
- Select para escolher a conta bancária
- Carregamento automático de contas ativas
- Auto-seleção de "Caixa Geral" se existir
- Validação obrigatória da conta

**Arquivo**: `src/components/cash/CashRegisterCard.tsx`

**Funcionalidades adicionadas:**
- Exibição do nome da conta bancária vinculada
- Card visual destacando a conta

## Benefícios

### 1. Rastreabilidade
- Cada caixa está vinculado a uma conta específica
- Histórico completo de qual conta foi usada em cada turno

### 2. Múltiplos Caixas
- Permite ter vários caixas físicos simultâneos
- Ex: "Caixa Balcão", "Caixa Recepção", "Caixa Delivery"

### 3. Conciliação Bancária
- Facilita a conciliação (FASE 5)
- Movimentações do caixa podem ser comparadas com extratos

### 4. Relatórios Precisos
- Relatórios financeiros mais detalhados
- Análise por conta bancária

### 5. Controle Financeiro
- Melhor controle de onde está o dinheiro
- Facilita auditorias

## Fluxo de Uso

### Abertura de Caixa

1. Usuário clica em "Abrir Caixa"
2. Sistema carrega contas bancárias ativas
3. Sistema auto-seleciona "Caixa Geral" se existir
4. Usuário pode escolher outra conta
5. Usuário informa saldo inicial
6. Sistema cria o caixa vinculado à conta

### Durante o Turno

- Todas as movimentações (sangrias, suprimentos, vendas) são registradas
- O vínculo com a conta bancária é mantido
- Futuro: Movimentações podem atualizar saldo da conta automaticamente

### Fechamento de Caixa

- Sistema calcula diferença entre esperado e real
- Futuro: Atualiza saldo da conta bancária
- Histórico mantém registro da conta usada

## Próximos Passos (Futuro)

### FASE 2: Atualização Automática de Saldos

Quando implementado, as movimentações do caixa atualizarão automaticamente o saldo da conta bancária:

- Sangria → Reduz saldo da conta
- Suprimento → Aumenta saldo da conta
- Fechamento → Ajusta saldo final da conta

### FASE 5: Conciliação Bancária

A integração permitirá:

- Comparar movimentações do caixa com extrato bancário
- Identificar divergências automaticamente
- Facilitar reconciliação manual

## Compatibilidade

### Dados Existentes

- Caixas antigos sem `bank_account_id` continuam funcionando
- Migration automática tentou vincular à "Caixa Geral"
- Novos caixas exigem seleção de conta

### Rollback

Se necessário reverter:

```sql
ALTER TABLE cash_registers DROP COLUMN bank_account_id;
```

## Testes Recomendados

1. ✅ Abrir caixa selecionando conta
2. ✅ Verificar se nome da conta aparece no card
3. ✅ Registrar sangria/suprimento
4. ✅ Fechar caixa
5. ✅ Verificar histórico com nome da conta
6. ⏳ Tentar abrir caixa sem conta (deve dar erro)
7. ⏳ Tentar abrir caixa com conta inativa (deve dar erro)

## Documentação Técnica

### Tabela: cash_registers

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| bank_account_id | UUID | FK para bank_accounts, conta vinculada ao caixa |

### RPC: abrir_caixa_rpc

**Parâmetros:**
- `p_initial_balance` (NUMERIC): Saldo inicial
- `p_bank_account_id` (UUID): ID da conta bancária
- `p_opened_by` (UUID, opcional): ID do usuário

**Retorno:** UUID do caixa criado

**Exceções:**
- Conta não encontrada
- Conta inativa
- Conta não pertence ao tenant
- Já existe caixa aberto

## Conclusão

A integração entre Caixa e Conta Bancária foi implementada com sucesso, tornando o sistema mais robusto e preparado para as próximas fases do Sistema Financeiro Completo.

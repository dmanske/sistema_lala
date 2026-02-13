# Compras - Análise e Propostas de Melhorias

**Data:** 12/02/2026  
**Status:** Análise Completa - Aguardando Aprovação  
**Prioridade:** MÉDIA - Melhorias Operacionais

---

## 📊 ESTADO ATUAL DO MÓDULO DE COMPRAS

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO

#### 1. Funcionalidades Core (100% Funcional)
- ✅ **Listagem de Compras**
  - Tabela com data, fornecedor, total de itens, valor total
  - Busca por fornecedor ou ID
  - Ordenação por data (mais recente primeiro)
  - Avatar do fornecedor com iniciais
  - Link para detalhes da compra
  - Loading skeletons
  - Empty state

- ✅ **Criação de Compra (Master-Detail)**
  - Seleção de fornecedor (apenas ativos)
  - Data da compra
  - Adição dinâmica de múltiplos produtos
  - Campos por item: produto, quantidade, custo unitário
  - Cálculo automático de totais
  - Observações opcionais
  - Validação completa com Zod

- ✅ **Registro de Pagamento Imediato**
  - Checkbox "Registrar Pagamento"
  - Seleção de forma de pagamento (Dinheiro, PIX, Cartão, Transferência)
  - Valor pago (pré-preenchido com total)
  - Seleção de conta bancária de origem
  - Gera saída automática no caixa

- ✅ **Visualização de Detalhes**
  - Informações da compra (ID, data, status)
  - Lista de itens com quantidade, custo unitário, total
  - Total geral destacado
  - Informações do fornecedor (nome, contato, CNPJ)
  - Link para perfil do fornecedor
  - Observações (quando existem)

- ✅ **Integração com Estoque**
  - Criação automática de movimentações de entrada (IN)
  - Atualização de currentStock dos produtos
  - Referência bidirecional (compra ↔ movimentação)
  - Rastreabilidade completa

- ✅ **Integração com Caixa**
  - Geração automática de saída quando "pago"
  - Descrição padronizada: "Compra - [Método] - [Fornecedor]"
  - Vinculação com conta bancária
  - Método de pagamento registrado

#### 2. Domain Model
```typescript
Purchase {
  id: string
  supplierId: string
  date: string (ISO)
  notes?: string
  total: number (calculado)
  items: PurchaseItem[]
  
  // Payment info
  paymentMethod?: "CASH" | "PIX" | "CARD" | "TRANSFER" | "WALLET"
  paidAmount?: number
  paidAt?: string (ISO)
  
  createdAt: string
}

PurchaseItem {
  id: string
  purchaseId: string
  productId: string
  quantity: number
  unitCost: number
  lineTotal: number (calculado)
}
```

#### 3. Fluxo Atual
```
1. Usuário acessa /purchases/new
2. Seleciona fornecedor
3. Define data da compra
4. Adiciona produtos (um ou mais)
   - Seleciona produto
   - Define quantidade
   - Define custo unitário
5. (Opcional) Marca "Registrar Pagamento"
   - Seleciona forma de pagamento
   - Confirma valor
   - Seleciona conta bancária
6. Adiciona observações (opcional)
7. Salva compra
8. Sistema:
   - Cria registro de compra
   - Cria itens da compra
   - Cria movimentações de estoque (IN)
   - Atualiza currentStock dos produtos
   - (Se pago) Cria saída no caixa
9. Redireciona para /purchases
```

---

## ❌ O QUE ESTÁ FALTANDO (Gaps e Oportunidades)

### 1. Gestão de Pagamentos Parciais/Pendentes
**Status:** NÃO IMPLEMENTADO  
**Impacto:** ALTO

**Problema:**
- Atualmente só permite pagamento total imediato ou nenhum pagamento
- Não há controle de contas a pagar
- Não há histórico de pagamentos parciais
- Não há visualização de compras pendentes de pagamento

**Proposta:**
- Status de pagamento: PENDING, PARTIAL, PAID
- Permitir múltiplos pagamentos para mesma compra
- Histórico de pagamentos com data, valor, método, conta
- Filtro por status de pagamento na listagem
- Card de "Contas a Pagar" no dashboard
- Ação "Registrar Pagamento" em compras pendentes

### 2. Edição de Compras
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Não é possível editar uma compra após criação
- Erros de digitação não podem ser corrigidos
- Necessário deletar e recriar (mas delete não existe)

**Proposta:**
- Botão "Editar" na página de detalhes
- Permitir edição de:
  - Data da compra
  - Observações
  - Adicionar/remover itens (com ajuste de estoque)
  - Alterar quantidades/custos (com ajuste de estoque)
- Restrições:
  - Não permitir editar se já tem pagamentos
  - Ou permitir mas recalcular saldo devedor

### 3. Exclusão de Compras
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Não há forma de deletar uma compra incorreta
- Compras de teste ficam no sistema permanentemente

**Proposta:**
- Botão "Excluir" na página de detalhes
- Validações:
  - Reverter movimentações de estoque (OUT)
  - Reverter pagamentos no caixa (entrada de estorno)
  - Confirmar ação com dialog
- Soft delete (manter registro mas marcar como deleted)

### 4. Filtros Avançados na Listagem
**Status:** BÁSICO (apenas busca)  
**Impacto:** BAIXO

**Problema:**
- Apenas busca por fornecedor/ID
- Não há filtro por período
- Não há filtro por status de pagamento
- Não há filtro por valor

**Proposta:**
- Filtro por período (data range picker)
- Filtro por fornecedor (dropdown)
- Filtro por status de pagamento (PENDING, PARTIAL, PAID)
- Filtro por faixa de valor
- Ordenação por: data, valor, fornecedor

### 5. Estatísticas e Análises
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Não há visão consolidada de compras
- Não há análise de gastos por fornecedor
- Não há análise de gastos por produto
- Não há comparação entre períodos

**Proposta:**
- Cards de resumo:
  - Total gasto no período
  - Número de compras
  - Ticket médio
  - Contas a pagar (pendentes)
- Gráfico de gastos por fornecedor (top 5)
- Gráfico de evolução temporal (linha)
- Comparação com período anterior

### 6. Importação de Nota Fiscal
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO (Nice to have)

**Problema:**
- Digitação manual de todos os itens
- Propenso a erros
- Demorado para compras grandes

**Proposta:**
- Upload de XML da NF-e
- Parse automático dos dados
- Pré-preenchimento do formulário
- Validação e ajustes manuais
- Armazenamento do XML

### 7. Previsão de Reposição
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Não há sugestão de quando comprar
- Não há cálculo de quantidade ideal
- Gestão reativa ao invés de proativa

**Proposta:**
- Análise de consumo médio por produto
- Cálculo de ponto de pedido
- Sugestão de quantidade a comprar
- Lista de "Produtos para Repor"
- Notificações quando atingir ponto de pedido

### 8. Comparação de Preços
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Não há histórico de preços por produto
- Não há comparação entre fornecedores
- Difícil identificar melhor custo-benefício

**Proposta:**
- Histórico de preços por produto
- Último preço pago destacado
- Comparação entre fornecedores
- Alerta quando preço está acima da média
- Gráfico de evolução de preço

### 9. Compras Recorrentes/Templates
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Compras repetitivas precisam ser digitadas toda vez
- Não há templates de compra

**Proposta:**
- Salvar compra como template
- Lista de templates
- Criar compra a partir de template
- Ajustar quantidades/preços antes de salvar

### 10. Anexos e Documentos
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Não há como anexar nota fiscal
- Não há como anexar boleto
- Não há como anexar comprovante de pagamento

**Proposta:**
- Upload de arquivos (PDF, imagem)
- Múltiplos anexos por compra
- Visualização inline
- Download de anexos

---

## 🎯 PROPOSTAS PRIORIZADAS

### PRIORIDADE ALTA (Essencial para Operação)

#### 1. Gestão de Pagamentos Parciais ⭐⭐⭐⭐⭐
**Esforço:** 3 dias  
**Valor:** MUITO ALTO

**Implementação:**
- Adicionar status de pagamento (PENDING, PARTIAL, PAID)
- Criar tabela `purchase_payments` (similar a `sale_payments`)
- Permitir múltiplos pagamentos
- Histórico de pagamentos na página de detalhes
- Ação "Registrar Pagamento" em compras pendentes
- Filtro por status na listagem
- Card "Contas a Pagar" no dashboard

**Benefícios:**
- Controle financeiro completo
- Visibilidade de dívidas com fornecedores
- Planejamento de fluxo de caixa
- Histórico auditável

#### 2. Edição de Compras ⭐⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** ALTO

**Implementação:**
- Botão "Editar" na página de detalhes
- Formulário de edição (similar ao de criação)
- Lógica de ajuste de estoque ao alterar itens
- Validações de integridade
- Histórico de alterações (audit log)

**Benefícios:**
- Correção de erros sem retrabalho
- Flexibilidade operacional
- Redução de dados incorretos

#### 3. Exclusão de Compras ⭐⭐⭐⭐
**Esforço:** 1 dia  
**Valor:** MÉDIO

**Implementação:**
- Botão "Excluir" com confirmação
- Reversão de movimentações de estoque
- Reversão de pagamentos no caixa
- Soft delete (manter registro)
- Validações de segurança

**Benefícios:**
- Limpeza de dados incorretos
- Correção de erros graves
- Manutenção da integridade

---

### PRIORIDADE MÉDIA (Melhoria de Experiência)

#### 4. Filtros Avançados ⭐⭐⭐
**Esforço:** 1 dia  
**Valor:** MÉDIO

**Implementação:**
- Filtro por período (date range)
- Filtro por fornecedor (dropdown)
- Filtro por status de pagamento
- Filtro por faixa de valor
- Ordenação customizável

**Benefícios:**
- Encontrar compras rapidamente
- Análise por período
- Identificar pendências

#### 5. Estatísticas e Análises ⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** MÉDIO

**Implementação:**
- Cards de resumo (total, quantidade, ticket médio)
- Gráfico de gastos por fornecedor
- Gráfico de evolução temporal
- Comparação entre períodos
- Integração no dashboard

**Benefícios:**
- Visão gerencial
- Identificar padrões de gasto
- Tomada de decisão informada

#### 6. Previsão de Reposição ⭐⭐⭐
**Esforço:** 3 dias  
**Valor:** ALTO (longo prazo)

**Implementação:**
- Cálculo de consumo médio
- Ponto de pedido por produto
- Sugestão de quantidade
- Lista de "Produtos para Repor"
- Notificações automáticas

**Benefícios:**
- Gestão proativa de estoque
- Redução de rupturas
- Otimização de capital de giro

---

### PRIORIDADE BAIXA (Nice to Have)

#### 7. Comparação de Preços ⭐⭐
**Esforço:** 2 dias  
**Valor:** BAIXO

#### 8. Compras Recorrentes/Templates ⭐⭐
**Esforço:** 2 dias  
**Valor:** BAIXO

#### 9. Importação de NF-e ⭐
**Esforço:** 5 dias  
**Valor:** BAIXO (complexidade alta)

#### 10. Anexos e Documentos ⭐⭐
**Esforço:** 2 dias  
**Valor:** BAIXO

---

## 📋 ROADMAP SUGERIDO

### Fase 1: Gestão Financeira (5 dias) - RECOMENDADO
**Objetivo:** Controle completo de pagamentos

1. Gestão de Pagamentos Parciais (3 dias)
2. Edição de Compras (2 dias)

**Resultado:** Sistema completo de contas a pagar

---

### Fase 2: Operacional (2 dias) - RECOMENDADO
**Objetivo:** Melhorar usabilidade

1. Exclusão de Compras (1 dia)
2. Filtros Avançados (1 dia)

**Resultado:** Operação mais eficiente

---

### Fase 3: Análise (2 dias) - OPCIONAL
**Objetivo:** Visão gerencial

1. Estatísticas e Análises (2 dias)

**Resultado:** Insights de negócio

---

### Fase 4: Inteligência (3 dias) - OPCIONAL
**Objetivo:** Gestão proativa

1. Previsão de Reposição (3 dias)

**Resultado:** Otimização de estoque

---

### Fase 5: Extras (8+ dias) - BAIXA PRIORIDADE
**Objetivo:** Funcionalidades avançadas

1. Comparação de Preços (2 dias)
2. Templates de Compra (2 dias)
3. Anexos (2 dias)
4. Importação NF-e (5 dias)

---

## 💡 RECOMENDAÇÃO FINAL

### Implementar AGORA (Fase 1 + Fase 2):
**Total:** 7 dias de desenvolvimento

**Justificativa:**
- Gestão de pagamentos é CRÍTICA para controle financeiro
- Edição e exclusão são funcionalidades básicas esperadas
- Filtros melhoram muito a usabilidade
- ROI imediato

**Funcionalidades:**
1. ✅ Pagamentos parciais e múltiplos
2. ✅ Status de pagamento (PENDING, PARTIAL, PAID)
3. ✅ Histórico de pagamentos
4. ✅ Contas a pagar no dashboard
5. ✅ Edição de compras
6. ✅ Exclusão de compras
7. ✅ Filtros avançados

---

### Implementar DEPOIS (Fase 3):
**Total:** 2 dias

**Justificativa:**
- Análises agregam valor mas não são bloqueantes
- Podem ser implementadas gradualmente

---

### Avaliar FUTURO (Fase 4 e 5):
**Total:** 11+ dias

**Justificativa:**
- Funcionalidades avançadas
- Complexidade alta
- Valor incremental
- Avaliar demanda real dos usuários

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS (Fase 1+2)

### ANTES (Estado Atual)
- ✅ Criar compra com pagamento total imediato
- ✅ Visualizar compras
- ✅ Buscar por fornecedor
- ❌ Sem controle de contas a pagar
- ❌ Sem pagamentos parciais
- ❌ Sem edição
- ❌ Sem exclusão
- ❌ Filtros limitados

### DEPOIS (Com Fase 1+2)
- ✅ Criar compra com ou sem pagamento
- ✅ Pagamentos parciais e múltiplos
- ✅ Controle completo de contas a pagar
- ✅ Histórico de pagamentos
- ✅ Editar compras
- ✅ Excluir compras
- ✅ Filtros avançados (período, status, fornecedor, valor)
- ✅ Ordenação customizável
- ✅ Card "Contas a Pagar" no dashboard
- ✅ Visibilidade de dívidas com fornecedores

---

## 🎯 PRÓXIMOS PASSOS

1. **Revisar proposta** com stakeholders
2. **Priorizar funcionalidades** baseado em necessidade real
3. **Aprovar Fase 1+2** para implementação imediata
4. **Planejar Fase 3** para implementação futura
5. **Avaliar Fase 4+5** baseado em feedback dos usuários

---

**Status:** ⏳ AGUARDANDO APROVAÇÃO  
**Recomendação:** Implementar Fase 1 + Fase 2 (7 dias)  
**Prioridade:** ALTA - Gestão Financeira Completa

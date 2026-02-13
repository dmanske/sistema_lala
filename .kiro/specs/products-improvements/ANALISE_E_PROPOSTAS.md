# Produtos - Análise e Propostas de Melhorias

**Data:** 13/02/2026  
**Status:** Análise Completa - Aguardando Aprovação  
**Prioridade:** MÉDIA-ALTA - Melhorias de Gestão e Inteligência

---

## 📊 ESTADO ATUAL DO MÓDULO DE PRODUTOS

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO

#### 1. Funcionalidades Core (90% Funcional)
- ✅ **Listagem de Produtos**
  - Visualização em Grid (cards) e Lista (tabela)
  - Busca por nome
  - Toggle entre visualizações
  - Informações exibidas:
    - Nome, preço, estoque atual
    - Status (Normal/Crítico)
    - Estoque mínimo
  - Loading skeletons
  - Empty states
  - Alertas visuais de estoque crítico

- ✅ **Cadastro de Produto**
  - Formulário completo com validação Zod
  - Campos financeiros:
    - Custo
    - Lucro (R$ e %)
    - Preço de venda
    - Comissão
    - Valor líquido (calculado)
  - Estoque mínimo
  - Cálculos automáticos de margem

- ✅ **Edição de Produto**
  - Mesma interface do cadastro
  - Pré-preenchimento de dados
  - Recálculo automático

- ✅ **Exclusão de Produto**
  - Dialog de confirmação
  - Validação de histórico

- ✅ **Perfil Detalhado do Produto**
  - Header com nome, estoque atual, alertas
  - Botão de movimentação de estoque
  - **Painel Financeiro:**
    - Custo, preço de venda
    - Comissão, valor líquido
    - Lucro (R$ e %)
    - Margem percentual
  - **Histórico de Movimentações:**
    - Lista de entradas/saídas
    - Data, hora, motivo
    - Quantidade (+/-)
    - Link para compra (quando aplicável)
    - Tipo de referência (compra, ajuste, venda, estorno)

- ✅ **Sistema de Movimentações**
  - Movimentações são fonte de verdade
  - currentStock é cache calculado
  - Tipos: IN (entrada) e OUT (saída)
  - Motivos rastreáveis
  - Referências para compras/vendas

- ✅ **PDV (Ponto de Venda)**
  - Rota dedicada `/products/pos`
  - Venda rápida de produtos

#### 2. Domain Model
```typescript
Product {
  id: string
  name: string (obrigatório)
  cost: number (custo)
  profitAmount: number (lucro R$)
  profitPercentage: number (lucro %)
  price: number (preço venda)
  commission: number (comissão)
  netValue?: number (valor líquido)
  minStock: number (estoque mínimo)
  currentStock: number (cache, read-only)
  lastMovement?: string (data última movimentação)
  createdAt: string
  updatedAt?: string
}

ProductMovement {
  id: string
  productId: string
  type: 'IN' | 'OUT'
  quantity: number
  reason: string
  referenceId?: string
  referenceType?: 'APPOINTMENT' | 'ADJUSTMENT' | 'PURCHASE' | 'REFUND'
  unitCost?: number
  supplierId?: string
  date: string
}
```

---

## ❌ O QUE ESTÁ FALTANDO (Gaps e Oportunidades)

### PRIORIDADE ALTA (Essencial para Operação)

#### 1. Estatísticas e Análise de Vendas ⭐⭐⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MUITO ALTO

**Problema:**
- Perfil do produto mostra apenas dados financeiros estáticos
- Sem análise de vendas
- Sem visão de rentabilidade real
- Impossível saber quais produtos vendem mais
- Sem análise de giro de estoque

**Proposta - Expandir Perfil do Produto:**
- **Cards de Métricas:**
  - Total vendido (quantidade)
  - Receita total gerada
  - Lucro total realizado
  - Última venda (data)
  - Giro de estoque (dias)
  - Valor em estoque (custo × quantidade)
  - Ticket médio do produto
  
- **Gráficos:**
  - Evolução de vendas ao longo do tempo (linha)
  - Vendas por mês (barras)
  - Comparação: vendas vs compras (barras duplas)
  
- **Alertas:**
  - Produto parado (sem venda há 60+ dias)
  - Estoque crítico (já existe)
  - Estoque excessivo (acima de X dias de giro)
  - Margem negativa (preço < custo)

**Benefícios:**
- Identificar produtos mais rentáveis
- Detectar produtos parados
- Otimizar compras
- Tomar decisões baseadas em dados

---

#### 2. Fornecedores do Produto ⭐⭐⭐⭐
**Status:** PARCIAL (apenas na movimentação de compra)  
**Impacto:** ALTO

**Problema:**
- Não há lista de fornecedores que fornecem cada produto
- Difícil saber onde comprar
- Sem histórico de preços por fornecedor
- Sem comparação de fornecedores

**Proposta - Nova Aba "Fornecedores":**
- Lista de fornecedores que já forneceram este produto
- Para cada fornecedor:
  - Nome do fornecedor
  - Quantidade total comprada
  - Última compra (data e preço)
  - Preço médio histórico
  - Menor e maior preço pago
  - Frequência de compra
- Ordenação por: mais comprado, melhor preço, mais recente
- Link para perfil do fornecedor
- Botão "Nova Compra" direto

**Benefícios:**
- Saber rapidamente onde comprar
- Comparar preços entre fornecedores
- Negociar com base em histórico
- Facilitar reposição de estoque

---

#### 3. Ordenação e Filtros Avançados ⭐⭐⭐⭐
**Status:** PARCIAL (apenas busca por nome)  
**Impacto:** ALTO

**Problema:**
- Sem ordenação (produtos aparecem sem critério)
- Sem filtros por estoque
- Sem filtros por rentabilidade
- Difícil encontrar produtos específicos

**Proposta:**
- **Ordenação padrão:** Alfabética (A-Z)
- **Opções de ordenação:**
  - Nome (A-Z / Z-A)
  - Preço (menor/maior)
  - Estoque (menor/maior)
  - Mais vendidos
  - Mais rentáveis
  - Última movimentação
- **Filtros:**
  - Status de estoque (Normal, Crítico, Zerado)
  - Faixa de preço
  - Com/sem estoque
  - Produtos ativos/inativos

**Benefícios:**
- Encontrar produtos rapidamente
- Identificar produtos críticos
- Organização melhor
- Experiência do usuário

---

### PRIORIDADE MÉDIA (Melhoria de Experiência)

#### 4. Categorias de Produtos ⭐⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO-ALTO

**Problema:**
- Sem categorização de produtos
- Difícil organizar grandes estoques
- Sem agrupamento lógico
- Relatórios genéricos

**Proposta:**
- Sistema de categorias customizáveis
- Exemplos: Shampoos, Condicionadores, Coloração, Tratamentos, Ferramentas, Descartáveis
- Uma categoria por produto
- Filtro por categoria na listagem
- Cores personalizadas para categorias
- Estatísticas por categoria

**Benefícios:**
- Organização por tipo
- Relatórios por categoria
- Filtros mais específicos
- Melhor gestão de estoque

---

#### 5. Código de Barras / SKU ⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Sem código de barras
- Sem SKU (Stock Keeping Unit)
- Difícil integrar com leitores
- Sem identificação única além do nome

**Proposta:**
- Campo SKU (código interno)
- Campo código de barras (EAN)
- Geração automática de SKU
- Busca por SKU/código de barras
- Impressão de etiquetas

**Benefícios:**
- Integração com leitores de código de barras
- Identificação única
- Agilidade no PDV
- Controle profissional

---

#### 6. Fotos do Produto ⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Sem foto do produto
- Difícil identificação visual
- Sem catálogo visual
- Experiência limitada

**Proposta:**
- Upload de foto do produto
- Múltiplas fotos (galeria)
- Preview na listagem
- Zoom na visualização
- Validação de tipo e tamanho

**Benefícios:**
- Identificação visual rápida
- Catálogo mais profissional
- Melhor experiência
- Facilita vendas

---

#### 7. Unidade de Medida ⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Sem unidade de medida
- Assume-se "unidade"
- Difícil para produtos líquidos/peso
- Sem conversões

**Proposta:**
- Campo unidade de medida
- Opções: Unidade, Litro, ML, KG, Grama, Metro, etc
- Exibição na listagem e perfil
- Cálculos considerando unidade

**Benefícios:**
- Controle preciso
- Produtos líquidos/peso
- Cálculos corretos
- Profissionalização

---

### PRIORIDADE BAIXA (Nice to Have)

#### 8. Lote e Validade ⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Sem controle de lote
- Sem data de validade
- Sem rastreabilidade
- Risco de usar produtos vencidos

**Proposta:**
- Campo lote
- Campo data de validade
- Alertas de produtos próximos ao vencimento
- Histórico por lote
- FIFO (First In, First Out)

**Benefícios:**
- Rastreabilidade
- Controle de validade
- Segurança
- Conformidade

---

#### 9. Produtos Compostos / Kits ⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Sem produtos compostos
- Sem kits promocionais
- Cada produto é individual
- Sem agrupamento

**Proposta:**
- Criar kits de produtos
- Definir composição
- Preço especial para kit
- Baixa automática de estoque dos componentes

**Benefícios:**
- Kits promocionais
- Combos
- Gestão simplificada
- Vendas maiores

---

#### 10. Histórico de Preços ⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Sem histórico de alterações de preço
- Não sabe quando mudou
- Sem análise de impacto
- Sem auditoria

**Proposta:**
- Registrar alterações de preço
- Data, usuário, valor anterior, novo valor
- Gráfico de evolução de preço
- Análise de impacto nas vendas

**Benefícios:**
- Auditoria
- Análise de impacto
- Histórico completo
- Decisões informadas

---

## 🎯 PROPOSTAS PRIORIZADAS

### PRIORIDADE ALTA (Implementar Agora)

#### 1. Estatísticas e Análise de Vendas ⭐⭐⭐⭐⭐
**Esforço:** 3 dias  
**Valor:** MUITO ALTO

**Implementação:**
- Use case para calcular métricas de vendas
- Cards de estatísticas no perfil
- Gráficos com Recharts
- Alertas condicionais

**Benefícios:**
- Visão 360° do produto
- Identificar produtos rentáveis
- Otimizar estoque

---

#### 2. Fornecedores do Produto ⭐⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** ALTO

**Implementação:**
- Nova aba "Fornecedores"
- Query para buscar fornecedores por produto
- Lista com estatísticas
- Links para perfis

**Benefícios:**
- Saber onde comprar
- Comparar preços
- Facilitar reposição

---

#### 3. Ordenação e Filtros ⭐⭐⭐⭐
**Esforço:** 1 dia  
**Valor:** ALTO

**Implementação:**
- Ordenação alfabética padrão
- Dropdown de ordenação
- Filtros de estoque
- Indicadores visuais

**Benefícios:**
- Melhor organização
- Encontrar produtos rapidamente
- Experiência melhorada

---

### PRIORIDADE MÉDIA (Implementar Depois)

#### 4. Categorias de Produtos ⭐⭐⭐⭐
**Esforço:** 3 dias  
**Valor:** MÉDIO-ALTO

#### 5. Código de Barras / SKU ⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** MÉDIO

#### 6. Fotos do Produto ⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** MÉDIO

#### 7. Unidade de Medida ⭐⭐⭐
**Esforço:** 1 dia  
**Valor:** MÉDIO

---

### PRIORIDADE BAIXA (Avaliar Futuro)

#### 8. Lote e Validade ⭐⭐
**Esforço:** 3 dias  
**Valor:** BAIXO

#### 9. Produtos Compostos / Kits ⭐⭐
**Esforço:** 4 dias  
**Valor:** BAIXO

#### 10. Histórico de Preços ⭐⭐
**Esforço:** 2 dias  
**Valor:** BAIXO

---

## 📋 ROADMAP SUGERIDO

### Fase 1: Inteligência e Análise (6 dias) - RECOMENDADO
**Objetivo:** Transformar dados em insights

1. Estatísticas e Análise de Vendas (3 dias)
2. Fornecedores do Produto (2 dias)
3. Ordenação e Filtros (1 dia)

**Resultado:** Visão completa do produto e decisões baseadas em dados

---

### Fase 2: Organização e Profissionalização (8 dias) - OPCIONAL
**Objetivo:** Melhorar organização e controle

1. Categorias de Produtos (3 dias)
2. Código de Barras / SKU (2 dias)
3. Fotos do Produto (2 dias)
4. Unidade de Medida (1 dia)

**Resultado:** Gestão mais profissional e organizada

---

### Fase 3: Avançado (9 dias) - BAIXA PRIORIDADE
**Objetivo:** Funcionalidades avançadas

1. Lote e Validade (3 dias)
2. Produtos Compostos / Kits (4 dias)
3. Histórico de Preços (2 dias)

---

## 💡 RECOMENDAÇÃO FINAL

### Implementar AGORA (Fase 1):
**Total:** 6 dias de desenvolvimento

**Justificativa:**
- Estatísticas são CRÍTICAS para gestão
- Fornecedores facilitam reposição
- Ordenação/filtros melhoram muito UX
- ROI imediato

**Funcionalidades:**
1. ✅ Estatísticas completas (métricas + gráficos)
2. ✅ Lista de fornecedores com histórico de preços
3. ✅ Ordenação alfabética e filtros avançados

---

### Implementar DEPOIS (Fase 2):
**Total:** 8 dias

**Justificativa:**
- Melhoram organização mas não são bloqueantes
- Podem ser implementadas gradualmente

---

### Avaliar FUTURO (Fase 3):
**Total:** 9 dias

**Justificativa:**
- Funcionalidades avançadas
- Avaliar demanda real

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS (Fase 1)

### ANTES (Estado Atual)
- ✅ Cadastro completo de produtos
- ✅ Listagem com busca
- ✅ Perfil com dados financeiros
- ✅ Histórico de movimentações
- ✅ Sistema de estoque
- ❌ Sem estatísticas de vendas
- ❌ Sem lista de fornecedores
- ❌ Sem ordenação/filtros

### DEPOIS (Com Fase 1)
- ✅ Cadastro completo de produtos
- ✅ Listagem ORDENADA com FILTROS
- ✅ Perfil com dados financeiros
- ✅ **Estatísticas completas de vendas** ⭐
- ✅ **Gráficos de evolução** ⭐
- ✅ **Lista de fornecedores** ⭐
- ✅ **Comparação de preços** ⭐
- ✅ **Alertas inteligentes** ⭐
- ✅ Histórico de movimentações

---

## 🎯 PRÓXIMOS PASSOS

1. **Revisar proposta** com stakeholders
2. **Priorizar funcionalidades** baseado em necessidade real
3. **Aprovar Fase 1** para implementação imediata
4. **Planejar Fase 2** para implementação futura
5. **Avaliar Fase 3** baseado em feedback

---

**Status:** ⏳ AGUARDANDO APROVAÇÃO  
**Recomendação:** Implementar Fase 1 (6 dias)  
**Prioridade:** ALTA - Gestão Estratégica de Produtos

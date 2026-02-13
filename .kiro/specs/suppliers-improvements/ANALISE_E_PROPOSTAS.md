# Fornecedores - Análise e Propostas de Melhorias

**Data:** 13/02/2026  
**Status:** Análise Completa - Aguardando Aprovação  
**Prioridade:** MÉDIA - Melhorias de Gestão e Relacionamento

---

## 📊 ESTADO ATUAL DO MÓDULO DE FORNECEDORES

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO

#### 1. Funcionalidades Core (85% Funcional)
- ✅ **Listagem de Fornecedores**
  - Visualização em Grid (cards) e Tabela
  - Busca por nome, CNPJ ou email (debounced)
  - Filtro por status (Ativo, Inativo)
  - Paginação (8 itens por página)
  - Informações exibidas:
    - Nome, telefone, WhatsApp, email
    - CNPJ formatado
    - Status (Ativo/Inativo)
    - Data de cadastro
  - Loading skeletons
  - Empty states

- ✅ **Cadastro de Fornecedor**
  - Formulário completo com validação Zod
  - Campos: nome, CNPJ, telefone, WhatsApp, email, status, observações
  - Normalização automática de telefones
  - Status: Ativo, Inativo

- ✅ **Edição de Fornecedor**
  - Mesma interface do cadastro
  - Pré-preenchimento de dados

- ✅ **Exclusão de Fornecedor**
  - Dialog de confirmação
  - Validação de histórico (não permite excluir se tem compras)

- ✅ **Perfil Detalhado do Fornecedor**
  - Header com nome, status, data de cadastro
  - Botões de ação: Editar, Excluir
  - **Painel Lateral:**
    - Total em compras
    - Contatos (telefone, WhatsApp, email)
    - Dados fiscais (CNPJ)
    - Observações
  - **Aba Histórico de Compras:**
    - Lista de compras realizadas
    - Data, referência, quantidade de itens, total
    - Link para detalhes da compra

#### 2. Domain Model
```typescript
Supplier {
  id: string
  name: string (obrigatório, min 3 chars)
  cnpj?: string
  phone?: string
  whatsapp?: string
  email?: string (validação de email)
  notes?: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt?: string
}
```

#### 3. Campos do Cadastro
- Nome (obrigatório, mínimo 3 caracteres)
- CNPJ (opcional)
- Telefone (opcional)
- WhatsApp (opcional)
- Email (opcional, com validação)
- Status (Ativo/Inativo)
- Observações (opcional)

---

## ❌ O QUE ESTÁ FALTANDO (Gaps e Oportunidades)

### PRIORIDADE ALTA (Essencial para Operação)

#### 1. Estatísticas e Métricas do Fornecedor ⭐⭐⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MUITO ALTO

**Problema:**
- Perfil do fornecedor mostra apenas total em compras
- Sem análise de frequência de compras
- Sem visão de produtos mais comprados
- Sem análise de ticket médio
- Impossível identificar fornecedores estratégicos

**Proposta - Expandir Visão Geral:**
- **Cards de Métricas:**
  - Total gasto (já existe)
  - Número de compras
  - Ticket médio por compra
  - Última compra (data)
  - Frequência média (dias entre compras)
  - Tempo como fornecedor (dias desde cadastro)
  - Total de produtos diferentes comprados
  
- **Gráficos:**
  - Evolução de gastos ao longo do tempo (linha)
  - Top 5 produtos mais comprados deste fornecedor (barras)
  - Distribuição de compras por mês (barras)
  
- **Alertas:**
  - Fornecedor inativo (sem compra há 90+ dias)
  - Fornecedor sem CNPJ cadastrado
  - Fornecedor sem contato

**Benefícios:**
- Identificar fornecedores estratégicos
- Negociar melhores condições
- Detectar fornecedores inativos
- Planejar compras futuras

---

#### 2. Produtos Fornecidos ⭐⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** ALTO

**Problema:**
- Não há lista de produtos que cada fornecedor fornece
- Difícil saber qual fornecedor procurar para um produto
- Sem histórico de preços por produto
- Sem comparação de preços entre fornecedores

**Proposta - Nova Aba "Produtos":**
- Lista de produtos comprados deste fornecedor
- Para cada produto:
  - Nome do produto
  - Quantidade total comprada
  - Última compra (data e preço)
  - Preço médio histórico
  - Menor e maior preço pago
  - Frequência de compra
- Ordenação por: mais comprado, mais recente, maior gasto
- Filtro por período
- Card de resumo: total de produtos diferentes

**Benefícios:**
- Saber rapidamente quais produtos cada fornecedor fornece
- Comparar preços históricos
- Identificar variações de preço
- Negociar com base em histórico

---

#### 3. Ordenação Alfabética ⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Fornecedores não estão ordenados
- Difícil encontrar fornecedor específico
- Sem padrão de ordenação

**Proposta:**
- Ordenar alfabeticamente por nome (A-Z) por padrão
- Usar `localeCompare` com locale 'pt-BR'
- Indicador visual "(A-Z)" no cabeçalho da tabela

**Benefícios:**
- Facilita localização de fornecedores
- Padrão consistente com outros módulos
- Melhor experiência do usuário

---

### PRIORIDADE MÉDIA (Melhoria de Experiência)

#### 4. Endereço Completo ⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Sem campo de endereço
- Difícil organizar entregas
- Sem informação de localização

**Proposta:**
- Adicionar campos de endereço:
  - CEP (com busca automática via API)
  - Rua/Avenida
  - Número
  - Complemento
  - Bairro
  - Cidade
  - Estado
- Exibir no perfil do fornecedor
- Integração com Google Maps (opcional)

**Benefícios:**
- Organizar entregas
- Calcular distâncias
- Planejar logística
- Informação completa do fornecedor

---

#### 5. Múltiplos Contatos ⭐⭐⭐
**Status:** PARCIAL (apenas 1 telefone, 1 WhatsApp, 1 email)  
**Impacto:** MÉDIO

**Problema:**
- Apenas um contato de cada tipo
- Fornecedores podem ter múltiplos representantes
- Sem nome do contato
- Sem cargo/função

**Proposta:**
- Sistema de múltiplos contatos
- Para cada contato:
  - Nome da pessoa
  - Cargo/Função
  - Telefone
  - WhatsApp
  - Email
  - Observações
- Marcar contato principal
- Adicionar/remover contatos dinamicamente

**Benefícios:**
- Organizar contatos por função
- Saber com quem falar para cada assunto
- Histórico de comunicações
- Melhor relacionamento

---

#### 6. Categorias de Fornecedores ⭐⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** MÉDIO

**Problema:**
- Sem categorização de fornecedores
- Difícil filtrar por tipo
- Sem agrupamento lógico

**Proposta:**
- Sistema de categorias customizáveis
- Exemplos: Cosméticos, Equipamentos, Limpeza, Serviços, Embalagens
- Múltiplas categorias por fornecedor
- Filtro por categoria na listagem
- Cores personalizadas para categorias

**Benefícios:**
- Organização por tipo de produto/serviço
- Filtros mais específicos
- Relatórios por categoria
- Melhor gestão

---

#### 7. Condições de Pagamento ⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Sem registro de condições de pagamento
- Sem prazo de entrega padrão
- Sem informações de negociação

**Proposta:**
- Campos adicionais:
  - Prazo de pagamento padrão (ex: 30 dias)
  - Formas de pagamento aceitas
  - Prazo de entrega padrão
  - Pedido mínimo
  - Desconto para pagamento à vista
  - Observações comerciais

**Benefícios:**
- Lembrar condições negociadas
- Comparar condições entre fornecedores
- Planejar fluxo de caixa
- Negociar melhores condições

---

#### 8. Avaliação de Fornecedores ⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Sem sistema de avaliação
- Sem registro de qualidade
- Sem histórico de problemas

**Proposta:**
- Sistema de avaliação (1-5 estrelas)
- Critérios:
  - Qualidade dos produtos
  - Prazo de entrega
  - Atendimento
  - Preço
  - Confiabilidade
- Comentários/observações
- Histórico de avaliações
- Média geral

**Benefícios:**
- Escolher melhores fornecedores
- Identificar problemas recorrentes
- Tomar decisões baseadas em dados
- Melhorar relacionamento

---

### PRIORIDADE BAIXA (Nice to Have)

#### 9. Documentos Anexados ⭐⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Sem upload de documentos
- Sem armazenamento de contratos
- Sem anexos de certidões

**Proposta:**
- Upload de documentos
- Tipos: Contrato, Certidão, Alvará, Nota Fiscal, Outros
- Visualização inline
- Download
- Controle de validade

**Benefícios:**
- Centralizar documentos
- Controle de validade
- Facilitar auditorias
- Organização

---

#### 10. Histórico de Comunicações ⭐
**Status:** NÃO IMPLEMENTADO  
**Impacto:** BAIXO

**Problema:**
- Sem registro de comunicações
- Não sabe quando foi o último contato
- Sem histórico de negociações

**Proposta:**
- Aba "Comunicações"
- Registro de:
  - Ligações
  - E-mails
  - Reuniões
  - Negociações
- Data, hora, tipo, assunto, descrição
- Filtro por tipo e período

**Benefícios:**
- Rastreabilidade
- Histórico completo
- Melhor relacionamento
- Evitar duplicações

---

## 🎯 PROPOSTAS PRIORIZADAS

### PRIORIDADE ALTA (Implementar Agora)

#### 1. Estatísticas e Métricas ⭐⭐⭐⭐⭐
**Esforço:** 3 dias  
**Valor:** MUITO ALTO

**Implementação:**
- Expandir use case para calcular métricas
- Cards de estatísticas no perfil
- Gráficos com Recharts
- Alertas condicionais

**Benefícios:**
- Visão 360° do fornecedor
- Identificar fornecedores estratégicos
- Tomar decisões baseadas em dados

---

#### 2. Produtos Fornecidos ⭐⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** ALTO

**Implementação:**
- Nova aba "Produtos"
- Query para buscar produtos por fornecedor
- Lista com estatísticas
- Ordenação e filtros

**Benefícios:**
- Saber quais produtos cada fornecedor fornece
- Comparar preços históricos
- Facilitar compras futuras

---

#### 3. Ordenação Alfabética ⭐⭐⭐
**Esforço:** 30 minutos  
**Valor:** MÉDIO

**Implementação:**
- Adicionar sort no fetch
- Indicador visual na tabela

**Benefícios:**
- Facilita localização
- Consistência com outros módulos

---

### PRIORIDADE MÉDIA (Implementar Depois)

#### 4. Endereço Completo ⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** MÉDIO

#### 5. Múltiplos Contatos ⭐⭐⭐
**Esforço:** 3 dias  
**Valor:** MÉDIO

#### 6. Categorias de Fornecedores ⭐⭐⭐
**Esforço:** 2 dias  
**Valor:** MÉDIO

---

### PRIORIDADE BAIXA (Avaliar Futuro)

#### 7. Condições de Pagamento ⭐⭐
**Esforço:** 1 dia  
**Valor:** BAIXO

#### 8. Avaliação de Fornecedores ⭐⭐
**Esforço:** 2 dias  
**Valor:** BAIXO

#### 9. Documentos Anexados ⭐⭐
**Esforço:** 3 dias  
**Valor:** BAIXO

#### 10. Histórico de Comunicações ⭐
**Esforço:** 2 dias  
**Valor:** BAIXO

---

## 📋 ROADMAP SUGERIDO

### Fase 1: Análise e Inteligência (5.5 dias) - RECOMENDADO
**Objetivo:** Transformar dados em insights

1. Estatísticas e Métricas (3 dias)
2. Produtos Fornecidos (2 dias)
3. Ordenação Alfabética (0.5 dia)

**Resultado:** Visão completa do fornecedor e histórico de produtos

---

### Fase 2: Organização e Gestão (7 dias) - OPCIONAL
**Objetivo:** Melhorar organização e informações

1. Endereço Completo (2 dias)
2. Múltiplos Contatos (3 dias)
3. Categorias de Fornecedores (2 dias)

**Resultado:** Gestão mais completa e organizada

---

### Fase 3: Avançado (8 dias) - BAIXA PRIORIDADE
**Objetivo:** Funcionalidades avançadas

1. Condições de Pagamento (1 dia)
2. Avaliação de Fornecedores (2 dias)
3. Documentos Anexados (3 dias)
4. Histórico de Comunicações (2 dias)

---

## 💡 RECOMENDAÇÃO FINAL

### Implementar AGORA (Fase 1):
**Total:** 5.5 dias de desenvolvimento

**Justificativa:**
- Estatísticas são CRÍTICAS para gestão
- Produtos fornecidos facilitam muito as compras
- Ordenação é rápida e melhora UX
- ROI imediato

**Funcionalidades:**
1. ✅ Estatísticas completas (métricas + gráficos)
2. ✅ Lista de produtos fornecidos com histórico
3. ✅ Ordenação alfabética

---

### Implementar DEPOIS (Fase 2):
**Total:** 7 dias

**Justificativa:**
- Melhoram organização mas não são bloqueantes
- Podem ser implementadas gradualmente

---

### Avaliar FUTURO (Fase 3):
**Total:** 8 dias

**Justificativa:**
- Funcionalidades avançadas
- Avaliar demanda real

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS (Fase 1)

### ANTES (Estado Atual)
- ✅ Cadastro completo de fornecedores
- ✅ Listagem com busca e filtros
- ✅ Perfil com histórico de compras
- ✅ Total gasto
- ❌ Sem estatísticas detalhadas
- ❌ Sem lista de produtos fornecidos
- ❌ Sem ordenação alfabética
- ❌ Sem gráficos

### DEPOIS (Com Fase 1)
- ✅ Cadastro completo de fornecedores
- ✅ Listagem com busca e filtros ORDENADA
- ✅ Perfil com histórico de compras
- ✅ **Estatísticas completas** ⭐
- ✅ **Gráficos de evolução** ⭐
- ✅ **Lista de produtos fornecidos** ⭐
- ✅ **Histórico de preços por produto** ⭐
- ✅ **Alertas de inatividade** ⭐
- ✅ Total gasto

---

## 🎯 PRÓXIMOS PASSOS

1. **Revisar proposta** com stakeholders
2. **Priorizar funcionalidades** baseado em necessidade real
3. **Aprovar Fase 1** para implementação imediata
4. **Planejar Fase 2** para implementação futura
5. **Avaliar Fase 3** baseado em feedback

---

**Status:** ⏳ AGUARDANDO APROVAÇÃO  
**Recomendação:** Implementar Fase 1 (5.5 dias)  
**Prioridade:** ALTA - Gestão Estratégica de Fornecedores

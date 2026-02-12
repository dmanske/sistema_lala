# Melhorias na Tela de Checkout/Finalização de Atendimento

**Feature:** checkout-improvements
**Data:** 2026-02-12
**Status:** Em Desenvolvimento
**Prioridade:** Alta

## 1. Visão Geral

Melhorar a tela de finalização de atendimento (checkout) adicionando informações essenciais que estão faltando e melhorando a experiência visual e de usabilidade. A tela atual não mostra informações importantes sobre o cliente, agendamento e contexto do atendimento, causando confusão sobre qual atendimento está sendo finalizado.

## 2. Problema Atual

A tela de checkout atual apresenta:
- ❌ Falta de contexto sobre qual cliente está sendo atendido
- ❌ Sem informações do agendamento (data, hora, profissional)
- ❌ Saldo de crédito/débito do cliente só aparece no modal de pagamento
- ❌ Não mostra informações dos serviços (profissional, duração)
- ❌ Falta indicador de estoque ao adicionar produtos
- ❌ Sem campo para observações sobre o atendimento
- ❌ Layout sem hierarquia visual clara
- ❌ Falta feedback visual ao finalizar pagamento

## 3. User Stories & Acceptance Criteria

### 3.1. Header com Informações do Cliente
**User Story:** Como usuário, quero ver claramente qual cliente estou atendendo para evitar confusões e ter acesso rápido às informações de contato.

**Acceptance Criteria:**
- AC 3.1.1: Header fixo no topo da página mostrando foto/avatar do cliente
- AC 3.1.2: Nome completo do cliente em destaque
- AC 3.1.3: Telefone e WhatsApp visíveis (com ícones clicáveis)
- AC 3.1.4: Saldo de crédito/débito do cliente visível com indicador visual (verde para crédito, vermelho para débito)
- AC 3.1.5: Badge de status do cliente (ACTIVE, ATTENTION)
- AC 3.1.6: Link rápido para o perfil do cliente

### 3.2. Card com Dados do Agendamento
**User Story:** Como usuário, quero ver as informações do agendamento para ter contexto sobre o atendimento que estou finalizando.

**Acceptance Criteria:**
- AC 3.2.1: Card destacado mostrando data e hora do agendamento
- AC 3.2.2: Nome do profissional responsável com avatar/cor
- AC 3.2.3: Duração total do atendimento (calculada dos serviços)
- AC 3.2.4: Status do agendamento
- AC 3.2.5: Horário de início e fim estimado
- AC 3.2.6: Ícones visuais para cada informação

### 3.3. Informações Detalhadas dos Serviços
**User Story:** Como usuário, quero ver detalhes dos serviços executados para validar o que será cobrado.

**Acceptance Criteria:**
- AC 3.3.1: Cada serviço mostra o profissional que executou
- AC 3.3.2: Duração de cada serviço é exibida
- AC 3.3.3: Preço original e preço ajustado (se houver) são destacados
- AC 3.3.4: Total de serviços separado do total de produtos

### 3.4. Timeline Visual do Atendimento
**User Story:** Como usuário, quero visualizar a linha do tempo do atendimento para entender o fluxo dos serviços.

**Acceptance Criteria:**
- AC 3.4.1: Timeline mostrando hora de início
- AC 3.4.2: Cada serviço aparece na timeline com duração
- AC 3.4.3: Hora de término estimada é calculada e exibida
- AC 3.4.4: Indicador visual de tempo decorrido

### 3.5. Indicador de Estoque em Produtos
**User Story:** Como usuário, quero ver o estoque disponível ao adicionar produtos para evitar erros de venda.

**Acceptance Criteria:**
- AC 3.5.1: Ao abrir modal de adicionar produto, mostrar estoque atual
- AC 3.5.2: Alerta visual se estoque estiver baixo (≤ minStock)
- AC 3.5.3: Impedir adicionar quantidade maior que estoque disponível
- AC 3.5.4: Mostrar estoque restante após adicionar ao carrinho
- AC 3.5.5: Badge de "Estoque Baixo" em produtos críticos

### 3.6. Campo de Observações do Atendimento
**User Story:** Como usuário, quero adicionar observações sobre o atendimento para registrar informações importantes.

**Acceptance Criteria:**
- AC 3.6.1: Campo de texto para observações do atendimento
- AC 3.6.2: Observações são salvas junto com a venda
- AC 3.6.3: Observações aparecem no histórico do cliente
- AC 3.6.4: Limite de 500 caracteres
- AC 3.6.5: Placeholder com exemplos: "Cliente solicitou corte mais curto", "Alergia a produto X"

### 3.7. Breadcrumb e Navegação
**User Story:** Como usuário, quero saber onde estou no sistema e poder voltar facilmente.

**Acceptance Criteria:**
- AC 3.7.1: Breadcrumb: Agenda → Agendamento #ID → Checkout
- AC 3.7.2: Botão "Voltar" retorna para a agenda
- AC 3.7.3: Indicador de progresso: Itens → Pagamento → Concluído
- AC 3.7.4: Estado atual destacado no indicador de progresso

### 3.8. Melhorias Visuais e Feedback
**User Story:** Como usuário, quero feedback visual claro sobre minhas ações para ter certeza de que tudo foi processado corretamente.

**Acceptance Criteria:**
- AC 3.8.1: Animação suave ao adicionar/remover itens
- AC 3.8.2: Confete ou celebração visual ao finalizar pagamento com sucesso
- AC 3.8.3: Badge "PAGO" destacado quando venda está finalizada
- AC 3.8.4: Loading states em todas as ações assíncronas
- AC 3.8.5: Toast notifications para todas as ações importantes
- AC 3.8.6: Cores consistentes: verde para sucesso, vermelho para erro, amarelo para avisos

### 3.9. Informações Financeiras Detalhadas
**User Story:** Como usuário, quero ver o detalhamento financeiro completo para entender a composição do valor.

**Acceptance Criteria:**
- AC 3.9.1: Subtotal de serviços separado
- AC 3.9.2: Subtotal de produtos separado
- AC 3.9.3: Desconto aplicado (se houver)
- AC 3.9.4: Total geral destacado
- AC 3.9.5: Valor já pago (se pagamento parcial)
- AC 3.9.6: Valor restante a pagar
- AC 3.9.7: Histórico de pagamentos anteriores (se houver)

### 3.10. Métricas do Cliente
**User Story:** Como usuário, quero ver métricas relevantes do cliente para oferecer um atendimento personalizado.

**Acceptance Criteria:**
- AC 3.10.1: Tempo médio de atendimento deste cliente (últimos 5 atendimentos)
- AC 3.10.2: Ticket médio histórico do cliente
- AC 3.10.3: Produtos mais comprados pelo cliente (top 3)
- AC 3.10.4: Data da última visita
- AC 3.10.5: Total de visitas realizadas
- AC 3.10.6: Métricas em card colapsável (não obrigatório visualizar)

## 4. Requisitos Técnicos

### 4.1. Dados Necessários
- Cliente: nome, foto, telefone, whatsapp, creditBalance, status
- Agendamento: date, startTime, durationMinutes, professionalId, status, services
- Profissional: name, color
- Serviços: name, duration, price, professionalId
- Produtos: currentStock, minStock
- Venda: items, payments, total, subtotal, discount, status, notes
- Histórico: últimas vendas do cliente, produtos comprados

### 4.2. Novos Campos
- `Sale.notes`: string (observações do atendimento) - **NOVO CAMPO**
- Cálculos derivados: tempo médio, ticket médio, produtos favoritos

### 4.3. Componentes a Criar/Modificar
- `CheckoutHeader.tsx` - Header com info do cliente (NOVO)
- `AppointmentInfoCard.tsx` - Card com dados do agendamento (NOVO)
- `ServiceTimeline.tsx` - Timeline visual dos serviços (NOVO)
- `CustomerMetrics.tsx` - Métricas do cliente (NOVO)
- `CheckoutForm.tsx` - Adicionar campo de observações (MODIFICAR)
- `AddProductDialog.tsx` - Adicionar indicador de estoque (MODIFICAR)
- `PaymentDialog.tsx` - Já tem as informações necessárias (OK)
- `SaleSummaryCard.tsx` - Melhorar detalhamento financeiro (MODIFICAR)

### 4.4. Alterações no Schema
```sql
-- Adicionar campo notes na tabela sales
ALTER TABLE sales ADD COLUMN notes TEXT;
```

## 5. Regras de Negócio

### 5.1. Saldo de Crédito/Débito
- Saldo positivo: exibir em verde com ícone de carteira
- Saldo negativo (Fiado): exibir em vermelho com ícone de alerta
- Saldo zero: exibir em cinza

### 5.2. Estoque de Produtos
- Estoque > minStock: normal
- Estoque ≤ minStock: badge "Estoque Baixo" em amarelo
- Estoque = 0: não permitir adicionar, mostrar "Sem Estoque"
- Validar estoque antes de adicionar ao carrinho

### 5.3. Observações do Atendimento
- Máximo 500 caracteres
- Opcional (não obrigatório)
- Salvo junto com a venda
- Visível no histórico do cliente

### 5.4. Timeline
- Hora início = agendamento.startTime
- Cada serviço adiciona sua duração
- Hora fim = hora início + soma das durações dos serviços

### 5.5. Métricas do Cliente
- Tempo médio: média dos últimos 5 atendimentos
- Ticket médio: média dos últimos 10 atendimentos pagos
- Produtos favoritos: top 3 produtos mais comprados (por quantidade)
- Considerar apenas vendas com status 'paid'

## 6. Wireframe/Layout Proposto

```
┌─────────────────────────────────────────────────────────────┐
│ [← Voltar] Agenda > Agendamento #123 > Checkout            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 Maria Silva                    💰 Crédito: R$ 50,00  ││
│ │ 📱 (11) 98765-4321  💬 WhatsApp   🟢 Cliente Ativo     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📅 Agendamento - Hoje, 14:00                            ││
│ │ 👨‍💼 Profissional: João Silva                             ││
│ │ ⏱️  Duração: 90 min (14:00 - 15:30)                     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Itens] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                             │
│ Serviços (2)                                                │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Corte Masculino          João Silva    30min   R$ 50,00 ││
│ │ Barba                    João Silva    20min   R$ 30,00 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Produtos (1)                          [+ Adicionar Produto]│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Pomada Modeladora    2x    R$ 25,00    R$ 50,00        ││
│ │ 📦 Estoque: 8 unidades                                  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Observações do Atendimento                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Campo de texto para observações...]                    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Subtotal Serviços:              R$ 80,00                ││
│ │ Subtotal Produtos:              R$ 50,00                ││
│ │ ─────────────────────────────────────                   ││
│ │ TOTAL:                          R$ 130,00               ││
│ │                                                          ││
│ │ [Processar Pagamento]                                   ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ 📊 Métricas do Cliente [▼]                                 │
└─────────────────────────────────────────────────────────────┘
```

## 7. Priorização de Implementação

### Fase 1 - Informações Essenciais (ALTA)
1. Header com informações do cliente
2. Card com dados do agendamento
3. Indicador de estoque em produtos
4. Campo de observações do atendimento

### Fase 2 - Melhorias Visuais (MÉDIA)
5. Timeline visual do atendimento
6. Breadcrumb e navegação
7. Informações detalhadas dos serviços
8. Melhorias visuais e feedback

### Fase 3 - Dados Adicionais (BAIXA)
9. Informações financeiras detalhadas
10. Métricas do cliente

## 8. Critérios de Sucesso

- ✅ Usuário consegue identificar rapidamente qual cliente está sendo atendido
- ✅ Todas as informações do agendamento estão visíveis
- ✅ Não há erros de estoque ao adicionar produtos
- ✅ Observações são salvas e aparecem no histórico
- ✅ Interface é intuitiva e não causa confusão
- ✅ Feedback visual claro em todas as ações
- ✅ Tempo de finalização do atendimento reduz em 30%

## 9. Exclusões (Fora do Escopo)

- ❌ Sistema de comissões (não usado pelo cliente)
- ❌ Sugestões automáticas de produtos relacionados
- ❌ Integração com WhatsApp para envio de comprovante
- ❌ Impressão de recibo
- ❌ Agendamento do próximo atendimento direto do checkout

## 10. Dependências

- Schema do banco de dados (adicionar campo `notes` em `sales`)
- Repositórios: SaleRepository, ClientRepository, AppointmentRepository
- Componentes UI: shadcn/ui (Dialog, Card, Badge, etc.)
- Hooks: useProducts (já existe)

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Muita informação na tela pode sobrecarregar | Médio | Usar cards colapsáveis para métricas opcionais |
| Performance ao carregar métricas do cliente | Baixo | Carregar métricas de forma assíncrona, não bloquear UI |
| Campo notes não existe no banco | Alto | Criar migration antes de implementar |
| Estoque pode mudar entre visualização e pagamento | Médio | Validar estoque novamente no momento do pagamento |

## 12. Notas Técnicas

- Usar React Query ou SWR para cache de dados do cliente
- Implementar skeleton loading para melhor UX
- Garantir responsividade mobile
- Manter padrão de cores e design system existente
- Usar animações sutis (não exageradas)
- Validar todos os campos antes de salvar

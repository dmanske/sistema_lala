# Tasks - Melhorias no Checkout

## Fase 1 - Informações Essenciais

### 1. Preparação do Banco de Dados
- [x] 1.1 Criar migration para adicionar campo `notes` na tabela `sales`
- [x] 1.2 Atualizar tipo `Sale` em `src/core/domain/sales/types.ts` para incluir `notes?: string`
- [x] 1.3 Atualizar schema Zod em `src/core/domain/sales/schemas.ts`
- [x] 1.4 Atualizar SupabaseSaleRepository para mapear campo `notes`

### 2. Header com Informações do Cliente
- [x] 2.1 Criar componente `CheckoutHeader.tsx`
  - [x] 2.1.1 Exibir avatar/foto do cliente
  - [x] 2.1.2 Exibir nome completo do cliente
  - [x] 2.1.3 Exibir telefone com ícone clicável (tel:)
  - [x] 2.1.4 Exibir WhatsApp com ícone clicável (whatsapp://)
  - [x] 2.1.5 Exibir saldo de crédito/débito com cores (verde/vermelho)
  - [x] 2.1.6 Exibir badge de status do cliente
  - [x] 2.1.7 Adicionar link para perfil do cliente
- [x] 2.2 Integrar CheckoutHeader na página de checkout
- [x] 2.3 Carregar dados do cliente no CheckoutForm
- [x] 2.4 Adicionar loading state para dados do cliente

### 3. Card com Dados do Agendamento
- [x] 3.1 Criar componente `AppointmentInfoCard.tsx`
  - [x] 3.1.1 Exibir data e hora do agendamento
  - [x] 3.1.2 Exibir nome do profissional com avatar/cor
  - [x] 3.1.3 Calcular e exibir duração total
  - [x] 3.1.4 Exibir horário de início e fim estimado
  - [x] 3.1.5 Exibir status do agendamento com badge
  - [x] 3.1.6 Adicionar ícones visuais para cada informação
- [x] 3.2 Carregar dados do agendamento no CheckoutForm
- [x] 3.3 Integrar AppointmentInfoCard na página de checkout
- [x] 3.4 Adicionar loading state para dados do agendamento

### 4. Indicador de Estoque em Produtos
- [x] 4.1 Modificar `AddProductDialog.tsx`
  - [x] 4.1.1 Exibir estoque atual de cada produto na lista
  - [x] 4.1.2 Adicionar badge "Estoque Baixo" para produtos com estoque ≤ minStock
  - [x] 4.1.3 Adicionar badge "Sem Estoque" para produtos com estoque = 0
  - [x] 4.1.4 Desabilitar produtos sem estoque
  - [x] 4.1.5 Validar quantidade máxima baseada no estoque
  - [x] 4.1.6 Mostrar estoque restante após adicionar ao carrinho
- [x] 4.2 Adicionar validação de estoque no CheckoutForm.addItem
- [x] 4.3 Exibir estoque atual na tabela de itens (coluna adicional ou tooltip)

### 5. Campo de Observações do Atendimento
- [x] 5.1 Adicionar campo de observações no CheckoutForm
  - [x] 5.1.1 Criar Textarea com label "Observações do Atendimento"
  - [x] 5.1.2 Adicionar placeholder com exemplos
  - [x] 5.1.3 Limitar a 500 caracteres
  - [x] 5.1.4 Exibir contador de caracteres
  - [x] 5.1.5 Salvar observações no estado local
- [x] 5.2 Atualizar PaySale use case para salvar notes
- [x] 5.3 Exibir observações na visualização de venda paga
- [x] 5.4 Exibir observações no histórico do cliente

## Fase 2 - Melhorias Visuais

### 6. Timeline Visual do Atendimento
- [x] 6.1 Criar componente `ServiceTimeline.tsx`
  - [x] 6.1.1 Exibir hora de início do agendamento
  - [x] 6.1.2 Listar cada serviço com duração na timeline
  - [x] 6.1.3 Calcular e exibir hora de término
  - [x] 6.1.4 Adicionar indicador visual de tempo decorrido
  - [x] 6.1.5 Usar cores do profissional na timeline
- [x] 6.2 Integrar ServiceTimeline no AppointmentInfoCard ou como card separado

### 7. Breadcrumb e Navegação
- [x] 7.1 Adicionar breadcrumb no topo da página
  - [x] 7.1.1 Link "Agenda" → /agenda
  - [x] 7.1.2 Texto "Agendamento #ID"
  - [x] 7.1.3 Texto "Checkout" (atual)
- [x] 7.2 Melhorar botão "Voltar" com ícone
- [x] 7.3 Criar indicador de progresso
  - [x] 7.3.1 Step 1: Itens
  - [x] 7.3.2 Step 2: Pagamento
  - [x] 7.3.3 Step 3: Concluído
  - [x] 7.3.4 Destacar step atual

### 8. Informações Detalhadas dos Serviços
- [x] 8.1 Modificar tabela de itens para serviços
  - [x] 8.1.1 Adicionar coluna "Profissional" com avatar
  - [x] 8.1.2 Adicionar coluna "Duração" (min)
  - [x] 8.1.3 Destacar preço ajustado vs preço original
  - [x] 8.1.4 Separar visualmente serviços de produtos
- [x] 8.2 Adicionar subtotal de serviços separado
- [x] 8.3 Adicionar subtotal de produtos separado

### 9. Melhorias Visuais e Feedback
- [x] 9.1 Adicionar animações ao adicionar/remover itens
  - [x] 9.1.1 Fade in ao adicionar
  - [x] 9.1.2 Fade out ao remover
  - [x] 9.1.3 Shake suave em caso de erro
- [x] 9.2 Adicionar celebração ao finalizar pagamento
  - [x] 9.2.1 Confete ou animação de sucesso
  - [x] 9.2.2 Som opcional (desabilitável)
  - [x] 9.2.3 Mensagem de sucesso destacada
- [x] 9.3 Melhorar badge "PAGO"
  - [x] 9.3.1 Aumentar tamanho e destaque
  - [x] 9.3.2 Adicionar ícone de check
  - [x] 9.3.3 Usar cor verde vibrante
- [x] 9.4 Adicionar loading states consistentes
  - [x] 9.4.1 Skeleton loading para dados do cliente
  - [x] 9.4.2 Skeleton loading para dados do agendamento
  - [x] 9.4.3 Spinner ao processar pagamento
  - [x] 9.4.4 Spinner ao adicionar/remover itens
- [x] 9.5 Padronizar toast notifications
  - [x] 9.5.1 Sucesso: verde com ícone de check
  - [x] 9.5.2 Erro: vermelho com ícone de X
  - [x] 9.5.3 Aviso: amarelo com ícone de alerta
  - [x] 9.5.4 Info: azul com ícone de info

## Fase 3 - Dados Adicionais

### 10. Informações Financeiras Detalhadas
- [x] 10.1 Modificar `SaleSummaryCard.tsx`
  - [x] 10.1.1 Adicionar linha "Subtotal Serviços"
  - [x] 10.1.2 Adicionar linha "Subtotal Produtos"
  - [x] 10.1.3 Adicionar linha "Desconto" (se houver)
  - [x] 10.1.4 Destacar "Total Geral"
  - [x] 10.1.5 Adicionar linha "Valor Pago" (se pagamento parcial)
  - [x] 10.1.6 Adicionar linha "Valor Restante"
- [x] 10.2 Adicionar seção de histórico de pagamentos
  - [x] 10.2.1 Listar pagamentos anteriores (se houver)
  - [x] 10.2.2 Exibir método, valor e data de cada pagamento
  - [x] 10.2.3 Destacar pagamento atual

### 11. Métricas do Cliente
- [x] 11.1 Criar componente `CustomerMetrics.tsx`
  - [x] 11.1.1 Calcular tempo médio de atendimento (últimos 5)
  - [x] 11.1.2 Calcular ticket médio (últimos 10 pagos)
  - [x] 11.1.3 Buscar produtos mais comprados (top 3)
  - [x] 11.1.4 Buscar data da última visita
  - [x] 11.1.5 Contar total de visitas
  - [x] 11.1.6 Exibir métricas em cards compactos
- [x] 11.2 Criar use case `GetCustomerMetrics`
  - [x] 11.2.1 Buscar últimos atendimentos do cliente
  - [x] 11.2.2 Calcular médias e agregações
  - [x] 11.2.3 Retornar dados formatados
- [x] 11.3 Integrar CustomerMetrics na página de checkout
  - [x] 11.3.1 Adicionar como card colapsável
  - [x] 11.3.2 Carregar dados de forma assíncrona
  - [x] 11.3.3 Adicionar loading state
  - [x] 11.3.4 Tratar caso de cliente novo (sem histórico)

## Testes e Validação

### 12. Testes
- [x] 12.1 Testar com cliente sem histórico
- [x] 12.2 Testar com cliente com crédito positivo
- [x] 12.3 Testar com cliente com débito (Fiado)
- [x] 12.4 Testar adição de produto sem estoque
- [x] 12.5 Testar adição de produto com estoque baixo
- [x] 12.6 Testar observações com 500+ caracteres
- [x] 12.7 Testar responsividade mobile
- [x] 12.8 Testar loading states
- [x] 12.9 Testar animações e feedback visual
- [x] 12.10 Testar navegação e breadcrumb

### 13. Documentação
- [x] 13.1 Atualizar PRD com novas funcionalidades
- [x] 13.2 Atualizar INVENTARIO_COMPLETO.md
- [x] 13.3 Documentar novos componentes criados
- [x] 13.4 Atualizar screenshots/wireframes

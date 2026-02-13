# Tasks - Melhorias do Sistema de Contas Bancárias

## Fase 1: Melhorias no Cadastro de Contas

### 1.1 Database Schema
- [ ] 1.1.1 Criar migration para adicionar novos campos em bank_accounts
- [ ] 1.1.2 Adicionar índices para performance
- [ ] 1.1.3 Testar migration em ambiente de desenvolvimento

### 1.2 Domain e Repository
- [ ] 1.2.1 Atualizar interface BankAccount com novos campos
- [ ] 1.2.2 Atualizar CreateBankAccountInput e UpdateBankAccountInput
- [ ] 1.2.3 Adicionar BankAccountWithStats interface
- [ ] 1.2.4 Implementar listWithStats() no repository
- [ ] 1.2.5 Implementar updateOrder() no repository
- [ ] 1.2.6 Implementar setFavorite() no repository

### 1.3 Use Cases
- [ ] 1.3.1 Atualizar CreateBankAccount para aceitar novos campos
- [ ] 1.3.2 Atualizar UpdateBankAccount para aceitar novos campos
- [ ] 1.3.3 Criar SetFavoriteAccount use case
- [ ] 1.3.4 Criar UpdateAccountsOrder use case

### 1.4 Formulário de Cadastro
- [ ] 1.4.1 Adicionar seletor de cor (color picker)
- [ ] 1.4.2 Adicionar seletor de ícone/emoji
- [ ] 1.4.3 Adicionar campo de descrição
- [ ] 1.4.4 Adicionar campos bancários (banco, agência, conta)
- [ ] 1.4.5 Adicionar campo de limite de crédito (só para CARD)
- [ ] 1.4.6 Adicionar toggle de conta favorita
- [ ] 1.4.7 Adicionar preview visual da conta
- [ ] 1.4.8 Implementar validações
- [ ] 1.4.9 Testar formulário completo

### 1.5 Lista de Contas Melhorada
- [ ] 1.5.1 Criar componente BankAccountCard
- [ ] 1.5.2 Implementar grid responsivo de cards
- [ ] 1.5.3 Adicionar card de resumo no topo (total de saldos)
- [ ] 1.5.4 Adicionar gráfico de distribuição de saldos
- [ ] 1.5.5 Implementar filtros (ativas/inativas, tipo, busca)
- [ ] 1.5.6 Implementar ordenação (customizada, nome, saldo)
- [ ] 1.5.7 Adicionar drag-and-drop para reordenar
- [ ] 1.5.8 Adicionar indicadores visuais (favorita, saldo negativo)
- [ ] 1.5.9 Adicionar botão "Ver Dashboard" em cada card
- [ ] 1.5.10 Testar responsividade

## Fase 2: Dashboard Individual da Conta

### 2.1 Domain e Use Cases
- [ ] 2.1.1 Criar interfaces AccountDashboardData, BalancePoint, InOutData, DistributionData
- [ ] 2.1.2 Criar GetAccountDashboard use case
- [ ] 2.1.3 Implementar cálculo de resumo financeiro
- [ ] 2.1.4 Implementar geração de dados para gráficos
- [ ] 2.1.5 Implementar cálculo de estatísticas
- [ ] 2.1.6 Testar use case com dados reais

### 2.2 Página do Dashboard
- [ ] 2.2.1 Criar rota /contas/[id]/page.tsx (substituir extrato simples)
- [ ] 2.2.2 Implementar layout do dashboard
- [ ] 2.2.3 Adicionar breadcrumb e navegação
- [ ] 2.2.4 Implementar loading states
- [ ] 2.2.5 Implementar error states

### 2.3 Componente: DashboardHeader
- [ ] 2.3.1 Criar componente DashboardHeader
- [ ] 2.3.2 Mostrar ícone, cor, nome, tipo, status
- [ ] 2.3.3 Mostrar saldo atual em destaque
- [ ] 2.3.4 Adicionar botões de ação (Editar, Desativar, Exportar, Transferir)
- [ ] 2.3.5 Testar responsividade

### 2.4 Componente: SummaryCards
- [ ] 2.4.1 Criar componente SummaryCards
- [ ] 2.4.2 Implementar 4 cards (Saldo Inicial, Entradas, Saídas, Movimentações)
- [ ] 2.4.3 Adicionar ícones e cores apropriadas
- [ ] 2.4.4 Implementar animações de entrada
- [ ] 2.4.5 Testar responsividade (2x2 em mobile)

### 2.5 Componente: BalanceEvolutionChart
- [ ] 2.5.1 Criar componente BalanceEvolutionChart
- [ ] 2.5.2 Implementar gráfico de linha com recharts
- [ ] 2.5.3 Adicionar filtros de período (7d, 30d, 90d, 1y, custom)
- [ ] 2.5.4 Implementar cores dinâmicas (verde/vermelho)
- [ ] 2.5.5 Adicionar tooltips informativos
- [ ] 2.5.6 Testar com diferentes períodos

### 2.6 Componente: InOutChart
- [ ] 2.6.1 Criar componente InOutChart
- [ ] 2.6.2 Implementar gráfico de barras agrupadas
- [ ] 2.6.3 Mostrar entradas (verde) e saídas (vermelho)
- [ ] 2.6.4 Adicionar linha de saldo líquido
- [ ] 2.6.5 Implementar agrupamento (semanal/mensal)
- [ ] 2.6.6 Testar com diferentes períodos

### 2.7 Componente: DistributionChart
- [ ] 2.7.1 Criar componente DistributionChart
- [ ] 2.7.2 Implementar gráfico de pizza
- [ ] 2.7.3 Mostrar distribuição por origem (Vendas, Compras, etc)
- [ ] 2.7.4 Adicionar percentuais e valores
- [ ] 2.7.5 Implementar cores distintas por categoria
- [ ] 2.7.6 Adicionar legenda

### 2.8 Componente: AdvancedFilters
- [ ] 2.8.1 Criar componente AdvancedFilters
- [ ] 2.8.2 Implementar filtro por período (data inicial/final)
- [ ] 2.8.3 Implementar filtro por tipo (Entrada/Saída/Todos)
- [ ] 2.8.4 Implementar filtro por origem
- [ ] 2.8.5 Implementar filtro por método de pagamento
- [ ] 2.8.6 Implementar busca por descrição/valor
- [ ] 2.8.7 Adicionar botão "Limpar Filtros"
- [ ] 2.8.8 Salvar filtros no localStorage
- [ ] 2.8.9 Mostrar contador de resultados

### 2.9 Componente: DetailedStatement
- [ ] 2.9.1 Criar componente DetailedStatement
- [ ] 2.9.2 Implementar tabela de movimentações
- [ ] 2.9.3 Agrupar por dia com subtotais
- [ ] 2.9.4 Tornar origem clicável (link para venda/compra)
- [ ] 2.9.5 Adicionar ícones e cores por tipo
- [ ] 2.9.6 Implementar paginação (20 itens por página)
- [ ] 2.9.7 Implementar ordenação
- [ ] 2.9.8 Adicionar estado vazio amigável
- [ ] 2.9.9 Testar com muitas movimentações

### 2.10 Componente: QuickStats
- [ ] 2.10.1 Criar componente QuickStats
- [ ] 2.10.2 Mostrar maior entrada (valor e data)
- [ ] 2.10.3 Mostrar maior saída (valor e data)
- [ ] 2.10.4 Mostrar média diária
- [ ] 2.10.5 Mostrar dia da semana mais ativo
- [ ] 2.10.6 Mostrar última movimentação
- [ ] 2.10.7 Adicionar ícones e tooltips
- [ ] 2.10.8 Atualizar com base nos filtros

### 2.11 Integração e Testes
- [ ] 2.11.1 Integrar todos os componentes no dashboard
- [ ] 2.11.2 Testar fluxo completo
- [ ] 2.11.3 Testar performance com muitos dados
- [ ] 2.11.4 Testar responsividade em todos os dispositivos
- [ ] 2.11.5 Ajustar skeleton loading
- [ ] 2.11.6 Corrigir bugs encontrados

## Fase 3: Melhorias nos Seletores de Conta

### 3.1 AccountSelector Melhorado
- [ ] 3.1.1 Atualizar interface AccountSelectorProps
- [ ] 3.1.2 Mostrar ícone e cor da conta
- [ ] 3.1.3 Mostrar saldo atual ao lado do nome
- [ ] 3.1.4 Para cartões, mostrar limite disponível
- [ ] 3.1.5 Indicar conta favorita com estrela
- [ ] 3.1.6 Implementar ordenação (favorita primeiro)
- [ ] 3.1.7 Desabilitar contas inativas visualmente
- [ ] 3.1.8 Adicionar busca rápida por nome
- [ ] 3.1.9 Testar em diferentes contextos

### 3.2 Sugestão Inteligente
- [ ] 3.2.1 Criar arquivo suggestions.ts
- [ ] 3.2.2 Implementar suggestAccountByMethod()
- [ ] 3.2.3 Implementar getLastUsedAccount()
- [ ] 3.2.4 Implementar saveLastUsedAccount()
- [ ] 3.2.5 Integrar sugestões no AccountSelector
- [ ] 3.2.6 Testar lógica de sugestão

### 3.3 Validação de Saldo
- [ ] 3.3.1 Adicionar validação de saldo no selector
- [ ] 3.3.2 Mostrar alerta se saldo insuficiente
- [ ] 3.3.3 Permitir continuar mesmo com alerta
- [ ] 3.3.4 Mostrar saldo após operação
- [ ] 3.3.5 Validação em tempo real

### 3.4 Integração em Todo Sistema
- [ ] 3.4.1 Atualizar selector em vendas/checkout
- [ ] 3.4.2 Atualizar selector em compras
- [ ] 3.4.3 Atualizar selector em créditos de cliente
- [ ] 3.4.4 Atualizar selector em página de caixa
- [ ] 3.4.5 Testar consistência visual

## Fase 4: Transferências entre Contas

### 4.1 Database Schema
- [ ] 4.1.1 Criar migration para adicionar transfer_id em cash_movements
- [ ] 4.1.2 Adicionar related_movement_id em cash_movements
- [ ] 4.1.3 Criar índice para transferências
- [ ] 4.1.4 Testar migration

### 4.2 Domain e Repository
- [ ] 4.2.1 Criar interface Transfer
- [ ] 4.2.2 Criar CreateTransferInput
- [ ] 4.2.3 Adicionar métodos de transferência no repository
- [ ] 4.2.4 Implementar lógica de vinculação de movimentações

### 4.3 Use Case
- [ ] 4.3.1 Criar TransferBetweenAccounts use case
- [ ] 4.3.2 Implementar validações (contas diferentes, valor > 0)
- [ ] 4.3.3 Implementar criação de movimentações vinculadas
- [ ] 4.3.4 Implementar geração de transfer_id
- [ ] 4.3.5 Testar use case

### 4.4 Componente: TransferDialog
- [ ] 4.4.1 Criar componente TransferDialog
- [ ] 4.4.2 Implementar formulário de transferência
- [ ] 4.4.3 Adicionar seletores de conta origem/destino
- [ ] 4.4.4 Adicionar campo de valor
- [ ] 4.4.5 Adicionar campo de data/hora
- [ ] 4.4.6 Adicionar campo de descrição
- [ ] 4.4.7 Implementar validações
- [ ] 4.4.8 Mostrar preview da transferência
- [ ] 4.4.9 Testar fluxo completo

### 4.5 Integração
- [ ] 4.5.1 Adicionar botão "Transferir" no dashboard da conta
- [ ] 4.5.2 Adicionar botão "Transferir" na lista de contas
- [ ] 4.5.3 Adicionar ação rápida de transferência
- [ ] 4.5.4 Atualizar saldos após transferência
- [ ] 4.5.5 Mostrar toast de sucesso

### 4.6 Histórico de Transferências
- [ ] 4.6.1 Criar página /contas/transferencias
- [ ] 4.6.2 Listar todas as transferências
- [ ] 4.6.3 Identificar transferências no extrato com ícone
- [ ] 4.6.4 Adicionar link para conta relacionada
- [ ] 4.6.5 Implementar filtro de transferências
- [ ] 4.6.6 Adicionar opção de estornar (criar reversa)

## Fase 5: Exportação e Relatórios

### 5.1 Use Case: ExportAccountStatement
- [ ] 5.1.1 Criar ExportAccountStatement use case
- [ ] 5.1.2 Implementar lógica de busca de dados
- [ ] 5.1.3 Implementar seleção de formato
- [ ] 5.1.4 Testar use case

### 5.2 Exportador PDF
- [ ] 5.2.1 Criar arquivo exporters/pdf.ts
- [ ] 5.2.2 Implementar exportToPDF()
- [ ] 5.2.3 Adicionar cabeçalho com logo e dados da conta
- [ ] 5.2.4 Adicionar resumo financeiro
- [ ] 5.2.5 Adicionar tabela de movimentações
- [ ] 5.2.6 Adicionar rodapé com totais
- [ ] 5.2.7 Testar geração de PDF

### 5.3 Exportador Excel
- [ ] 5.3.1 Criar arquivo exporters/excel.ts
- [ ] 5.3.2 Implementar exportToExcel()
- [ ] 5.3.3 Adicionar planilha de resumo
- [ ] 5.3.4 Adicionar planilha de movimentações
- [ ] 5.3.5 Formatar células (moeda, data)
- [ ] 5.3.6 Testar geração de Excel

### 5.4 Exportador CSV
- [ ] 5.4.1 Criar arquivo exporters/csv.ts
- [ ] 5.4.2 Implementar exportToCSV()
- [ ] 5.4.3 Definir colunas e formato
- [ ] 5.4.4 Testar geração de CSV

### 5.5 Integração
- [ ] 5.5.1 Adicionar botão "Exportar" no dashboard
- [ ] 5.5.2 Criar dialog de seleção de formato
- [ ] 5.5.3 Implementar download do arquivo
- [ ] 5.5.4 Respeitar filtros ativos
- [ ] 5.5.5 Mostrar loading durante exportação
- [ ] 5.5.6 Testar todos os formatos

### 5.6 Relatório Comparativo
- [ ] 5.6.1 Criar página /contas/relatorios
- [ ] 5.6.2 Implementar tabela comparativa de contas
- [ ] 5.6.3 Adicionar gráfico de barras (saldo por conta)
- [ ] 5.6.4 Adicionar gráfico de pizza (distribuição)
- [ ] 5.6.5 Implementar filtro por período
- [ ] 5.6.6 Adicionar exportação do relatório
- [ ] 5.6.7 Testar com múltiplas contas

## Fase 6: Metas e Alertas

### 6.1 Database Schema
- [ ] 6.1.1 Criar migration para adicionar campos de meta
- [ ] 6.1.2 Adicionar campo alert_threshold
- [ ] 6.1.3 Criar tabela account_notifications (opcional)
- [ ] 6.1.4 Testar migration

### 6.2 Domain
- [ ] 6.2.1 Criar interface BankAccountGoal
- [ ] 6.2.2 Criar interface BankAccountAlert
- [ ] 6.2.3 Adicionar campos de meta no BankAccount
- [ ] 6.2.4 Atualizar repository interfaces

### 6.3 Componente: AccountGoalCard
- [ ] 6.3.1 Criar componente AccountGoalCard
- [ ] 6.3.2 Mostrar valor da meta e saldo atual
- [ ] 6.3.3 Mostrar percentual atingido
- [ ] 6.3.4 Adicionar barra de progresso
- [ ] 6.3.5 Mostrar dias restantes (se tiver deadline)
- [ ] 6.3.6 Implementar cores por status
- [ ] 6.3.7 Adicionar no dashboard da conta

### 6.4 Configuração de Metas
- [ ] 6.4.1 Adicionar campos de meta no formulário de edição
- [ ] 6.4.2 Implementar validações
- [ ] 6.4.3 Salvar meta no banco
- [ ] 6.4.4 Testar configuração

### 6.5 Sistema de Alertas
- [ ] 6.5.1 Implementar verificação de saldo após movimentação
- [ ] 6.5.2 Criar alerta quando saldo < threshold
- [ ] 6.5.3 Mostrar badge de alerta na lista de contas
- [ ] 6.5.4 Mostrar alerta no dashboard da conta
- [ ] 6.5.5 Implementar toast quando saldo ficar baixo
- [ ] 6.5.6 Criar página /contas/alertas

### 6.6 Notificações
- [ ] 6.6.1 Implementar notificação quando meta é atingida
- [ ] 6.6.2 Implementar notificação de saldo baixo
- [ ] 6.6.3 Implementar notificação de conta sem movimento
- [ ] 6.6.4 Adicionar centro de notificações
- [ ] 6.6.5 Permitir marcar como lida
- [ ] 6.6.6 Implementar resumos periódicos (opcional)

## Fase 7: Conciliação Bancária

### 7.1 Database Schema
- [ ] 7.1.1 Criar migration para campos de conciliação
- [ ] 7.1.2 Adicionar índice para reconciled
- [ ] 7.1.3 Testar migration

### 7.2 Use Case: ReconcileMovements
- [ ] 7.2.1 Criar ReconcileMovements use case
- [ ] 7.2.2 Implementar lógica de marcação
- [ ] 7.2.3 Registrar quem e quando conciliou
- [ ] 7.2.4 Testar use case

### 7.3 Interface de Conciliação
- [ ] 7.3.1 Adicionar checkbox na tabela de movimentações
- [ ] 7.3.2 Implementar seleção múltipla
- [ ] 7.3.3 Adicionar botão "Marcar como Conferido"
- [ ] 7.3.4 Adicionar filtro conferidas/não conferidas
- [ ] 7.3.5 Adicionar badge visual de status
- [ ] 7.3.6 Bloquear edição de movimentações conferidas

### 7.4 Importação de Extrato (Futuro)
- [ ] 7.4.1 Criar interface de upload
- [ ] 7.4.2 Implementar parser de CSV
- [ ] 7.4.3 Implementar parser de OFX (opcional)
- [ ] 7.4.4 Implementar comparação automática
- [ ] 7.4.5 Implementar sugestão de matches
- [ ] 7.4.6 Permitir match manual
- [ ] 7.4.7 Criar movimentações faltantes
- [ ] 7.4.8 Testar com extratos reais

## Fase 8: Integrações no Sistema

### 8.1 Dashboard Principal
- [ ] 8.1.1 Criar componente FinancialOverviewCard
- [ ] 8.1.2 Mostrar saldo total de todas as contas
- [ ] 8.1.3 Adicionar gráfico mini de distribuição
- [ ] 8.1.4 Listar contas com saldo baixo
- [ ] 8.1.5 Adicionar links rápidos para cada conta
- [ ] 8.1.6 Integrar no dashboard principal
- [ ] 8.1.7 Implementar atualização em tempo real

### 8.2 Melhorias em Vendas
- [ ] 8.2.1 Integrar AccountSelector melhorado
- [ ] 8.2.2 Implementar sugestão inteligente
- [ ] 8.2.3 Mostrar saldo após pagamento
- [ ] 8.2.4 Permitir dividir entre contas (opcional)
- [ ] 8.2.5 Melhorar histórico de pagamentos

### 8.3 Melhorias em Compras
- [ ] 8.3.1 Integrar AccountSelector melhorado
- [ ] 8.3.2 Implementar validação de saldo
- [ ] 8.3.3 Melhorar histórico de pagamentos
- [ ] 8.3.4 Adicionar relatório de gastos por conta

### 8.4 Página de Caixa
- [ ] 8.4.1 Manter filtro por conta existente
- [ ] 8.4.2 Adicionar gráfico de evolução por conta
- [ ] 8.4.3 Adicionar comparação entre contas
- [ ] 8.4.4 Adicionar atalho para dashboard da conta
- [ ] 8.4.5 Mostrar transferências claramente

### 8.5 Configurações
- [ ] 8.5.1 Adicionar seção de configurações de contas
- [ ] 8.5.2 Permitir definir conta padrão por operação
- [ ] 8.5.3 Configurar regras automáticas
- [ ] 8.5.4 Configurar preferências de notificações
- [ ] 8.5.5 Adicionar opção de backup/exportar dados

## Testes e Qualidade

### Testes Unitários
- [ ] T.1 Testar use cases isoladamente
- [ ] T.2 Testar cálculos de estatísticas
- [ ] T.3 Testar validações de domínio
- [ ] T.4 Testar lógica de sugestões

### Testes de Integração
- [ ] T.5 Testar fluxo completo de criação de conta
- [ ] T.6 Testar fluxo de transferência
- [ ] T.7 Testar exportação de extratos
- [ ] T.8 Testar RLS policies
- [ ] T.9 Testar conciliação

### Testes de Performance
- [ ] T.10 Testar dashboard com muitos dados
- [ ] T.11 Testar listagem com muitas contas
- [ ] T.12 Testar gráficos com muitos pontos
- [ ] T.13 Otimizar queries lentas

### Testes de Usabilidade
- [ ] T.14 Testar responsividade em mobile
- [ ] T.15 Testar responsividade em tablet
- [ ] T.16 Testar navegação por teclado
- [ ] T.17 Testar com leitor de tela
- [ ] T.18 Validar contraste de cores

## Documentação

- [ ] D.1 Documentar novas APIs
- [ ] D.2 Documentar componentes
- [ ] D.3 Criar guia de uso para usuários
- [ ] D.4 Documentar fluxos principais
- [ ] D.5 Criar changelog

## Deploy e Monitoramento

- [ ] M.1 Configurar monitoramento de erros
- [ ] M.2 Configurar métricas de performance
- [ ] M.3 Configurar alertas críticos
- [ ] M.4 Fazer deploy em staging
- [ ] M.5 Testar em staging
- [ ] M.6 Fazer deploy em produção
- [ ] M.7 Monitorar após deploy
- [ ] M.8 Coletar feedback dos usuários

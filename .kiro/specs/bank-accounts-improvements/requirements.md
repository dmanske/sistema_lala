# Melhorias Completas do Sistema de Contas Bancárias

## Visão Geral
Expandir o sistema de contas bancárias para incluir um dashboard completo por conta, melhorar o cadastro com mais campos, aprimorar a integração em todo o sistema, e adicionar funcionalidades avançadas como transferências entre contas, metas, alertas e conciliação bancária.

## Objetivos
- Criar dashboard individual rico para cada conta bancária
- Melhorar o cadastro de contas com campos adicionais
- Aprimorar seletores de conta em todo o sistema
- Implementar transferências entre contas
- Adicionar análises e gráficos financeiros
- Implementar metas e alertas por conta
- Melhorar experiência visual e usabilidade

---

## Fase 1: Melhorias no Cadastro de Contas

### 1.1 Campos Adicionais no Banco de Dados
**Como** administrador do salão  
**Quero** ter mais informações sobre cada conta bancária  
**Para** organizar melhor minhas finanças e identificar contas rapidamente

**Critérios de Aceitação:**
- [ ] Adicionar campo `color` (string, hex color) para personalização visual
- [ ] Adicionar campo `icon` (string, emoji ou nome de ícone) para identificação
- [ ] Adicionar campo `description` (text, opcional) para observações
- [ ] Adicionar campo `credit_limit` (decimal, opcional) para cartões de crédito
- [ ] Adicionar campo `bank_name` (string, opcional) nome da instituição
- [ ] Adicionar campo `agency` (string, opcional) número da agência
- [ ] Adicionar campo `account_number` (string, opcional) número da conta
- [ ] Adicionar campo `is_favorite` (boolean, default false) para marcar conta principal
- [ ] Adicionar campo `display_order` (integer, default 0) para ordenação customizada
- [ ] Migração deve preservar dados existentes

### 1.2 Formulário de Cadastro Melhorado
**Como** usuário  
**Quero** um formulário mais completo ao criar/editar contas  
**Para** configurar todas as informações da conta de uma vez

**Critérios de Aceitação:**
- [ ] Formulário deve ter todos os novos campos
- [ ] Seletor de cor com palette de cores predefinidas
- [ ] Seletor de ícone/emoji visual
- [ ] Validação: nome obrigatório e único por tenant
- [ ] Validação: limite de crédito só para tipo CARD
- [ ] Preview visual da conta enquanto preenche
- [ ] Campos bancários opcionais e agrupados
- [ ] Toggle para marcar como favorita
- [ ] Drag-and-drop para ordenar contas (na lista)

### 1.3 Lista de Contas Melhorada
**Como** usuário  
**Quero** ver minhas contas de forma mais visual e organizada  
**Para** identificar rapidamente cada conta e seus saldos

**Critérios de Aceitação:**
- [ ] Mostrar cards visuais em vez de apenas tabela
- [ ] Cada card mostra: cor, ícone, nome, tipo, saldo, status
- [ ] Indicador visual de conta favorita (estrela)
- [ ] Saldos negativos em vermelho, positivos em verde
- [ ] Ordenação por: ordem customizada, nome, saldo, tipo
- [ ] Filtros: ativas/inativas, por tipo, busca por nome
- [ ] Card de resumo no topo: total em todas as contas
- [ ] Gráfico de distribuição de saldos (pizza ou barras)
- [ ] Botão "Ver Dashboard" em cada card
- [ ] Responsivo: grid adaptável (desktop 3 cols, tablet 2, mobile 1)

---

## Fase 2: Dashboard Individual da Conta

### 2.1 Cabeçalho e Informações Principais
**Como** usuário  
**Quero** ver informações detalhadas de uma conta específica  
**Para** acompanhar sua performance e movimentações

**Critérios de Aceitação:**
- [ ] Rota `/contas/[id]/dashboard` para dashboard da conta
- [ ] Cabeçalho mostra: ícone, cor, nome, tipo, status
- [ ] Saldo atual em destaque (grande, colorido)
- [ ] Botões de ação: Editar, Desativar, Exportar, Transferir
- [ ] Breadcrumb: Contas > [Nome da Conta]
- [ ] Botão voltar para lista de contas

### 2.2 Cards de Resumo Financeiro
**Como** usuário  
**Quero** ver um resumo rápido da conta  
**Para** entender sua situação financeira de relance

**Critérios de Aceitação:**
- [ ] 4 cards lado a lado (responsivo: 2x2 em mobile)
- [ ] Card 1: Saldo Inicial (valor que começou)
- [ ] Card 2: Total de Entradas (verde, soma de IN)
- [ ] Card 3: Total de Saídas (vermelho, soma de OUT)
- [ ] Card 4: Quantidade de Movimentações
- [ ] Cards com ícones e cores apropriadas
- [ ] Valores formatados em BRL
- [ ] Animação ao carregar

### 2.3 Gráficos de Análise
**Como** usuário  
**Quero** visualizar graficamente a evolução da conta  
**Para** identificar tendências e padrões

**Critérios de Aceitação:**
- [ ] Gráfico 1: Evolução do Saldo (linha do tempo)
  - Mostra saldo ao longo do tempo
  - Filtros: 7 dias, 30 dias, 90 dias, ano, personalizado
  - Linha verde quando positivo, vermelha quando negativo
  - Tooltips com data e valor
- [ ] Gráfico 2: Entradas vs Saídas (barras agrupadas)
  - Comparação mensal ou semanal
  - Barras verdes (entradas) e vermelhas (saídas)
  - Mostra saldo líquido do período
- [ ] Gráfico 3: Distribuição por Origem (pizza)
  - Vendas, Compras, Créditos, Transferências, Manual
  - Cores diferentes para cada tipo
  - Percentuais e valores
- [ ] Usar biblioteca recharts (já instalada)
- [ ] Gráficos responsivos
- [ ] Loading skeleton enquanto carrega dados

### 2.4 Filtros Avançados
**Como** usuário  
**Quero** filtrar as movimentações da conta  
**Para** encontrar transações específicas

**Critérios de Aceitação:**
- [ ] Filtro por período (data inicial e final)
- [ ] Filtro por tipo (Entrada/Saída/Todos)
- [ ] Filtro por origem (Vendas/Compras/Créditos/Manual/Transferências)
- [ ] Filtro por método de pagamento
- [ ] Busca por descrição ou valor
- [ ] Botão "Limpar Filtros"
- [ ] Filtros aplicam em tempo real
- [ ] Mostrar quantidade de resultados filtrados
- [ ] Salvar filtros no localStorage

### 2.5 Extrato Detalhado Melhorado
**Como** usuário  
**Quero** ver todas as movimentações da conta de forma organizada  
**Para** acompanhar cada transação

**Critérios de Aceitação:**
- [ ] Tabela com colunas: Data/Hora, Origem, Descrição, Método, Tipo, Valor, Saldo Após
- [ ] Movimentações agrupadas por dia
- [ ] Subtotais por dia (entradas, saídas, líquido)
- [ ] Origem clicável (link para venda/compra/etc)
- [ ] Ícones coloridos por tipo de movimentação
- [ ] Valores coloridos (verde/vermelho)
- [ ] Paginação (20 itens por página)
- [ ] Ordenação por data (mais recente primeiro)
- [ ] Botão "Carregar mais" ou paginação tradicional
- [ ] Estado vazio amigável quando sem movimentações

### 2.6 Estatísticas Rápidas
**Como** usuário  
**Quero** ver estatísticas resumidas da conta  
**Para** entender padrões de uso

**Critérios de Aceitação:**
- [ ] Sidebar ou cards com estatísticas:
  - Maior entrada (valor e data)
  - Maior saída (valor e data)
  - Média diária de movimentação
  - Dia da semana mais ativo
  - Última movimentação (quando)
  - Período mais movimentado
- [ ] Estatísticas calculadas com base nos filtros ativos
- [ ] Ícones e cores apropriadas
- [ ] Tooltips explicativos

---

## Fase 3: Melhorias nos Seletores de Conta

### 3.1 Componente AccountSelector Melhorado
**Como** usuário  
**Quero** um seletor de conta mais informativo  
**Para** escolher a conta certa ao fazer operações

**Critérios de Aceitação:**
- [ ] Mostrar ícone e cor da conta
- [ ] Mostrar saldo atual ao lado do nome
- [ ] Para cartões, mostrar limite disponível
- [ ] Indicar conta favorita com estrela
- [ ] Ordenar por: favorita primeiro, depois ordem customizada
- [ ] Desabilitar contas inativas (mas mostrar)
- [ ] Busca rápida por nome
- [ ] Opção "Todas" quando aplicável
- [ ] Visual consistente em todo o sistema

### 3.2 Sugestão Inteligente de Conta
**Como** usuário  
**Quero** que o sistema sugira a conta apropriada  
**Para** agilizar o processo de seleção

**Critérios de Aceitação:**
- [ ] Ao selecionar método PIX → sugere contas digitais
- [ ] Ao selecionar Dinheiro → sugere "Caixa Físico"
- [ ] Ao selecionar Cartão → sugere contas tipo CARD
- [ ] Lembrar última conta usada por método
- [ ] Permitir configurar regras padrão
- [ ] Sugestão não bloqueia escolha manual

### 3.3 Validação de Saldo
**Como** usuário  
**Quero** ser alertado sobre saldo insuficiente  
**Para** evitar registrar operações impossíveis

**Critérios de Aceitação:**
- [ ] Ao selecionar conta para saída, verificar saldo
- [ ] Alertar (warning) se saldo insuficiente
- [ ] Permitir continuar mesmo com saldo negativo (salão pode ter cheque especial)
- [ ] Mostrar saldo após a operação
- [ ] Validação em tempo real ao digitar valor

---

## Fase 4: Transferências entre Contas

### 4.1 Funcionalidade de Transferência
**Como** usuário  
**Quero** transferir dinheiro entre minhas contas  
**Para** organizar melhor meu fluxo de caixa

**Critérios de Aceitação:**
- [ ] Botão "Nova Transferência" no dashboard da conta
- [ ] Botão "Transferir" na lista de contas
- [ ] Dialog com formulário:
  - Conta de origem (seletor)
  - Conta de destino (seletor, excluir origem)
  - Valor (obrigatório, positivo)
  - Data/hora (default: agora)
  - Descrição/motivo (opcional)
- [ ] Validação: origem ≠ destino
- [ ] Validação: valor > 0
- [ ] Criar 2 movimentações:
  - OUT na conta origem
  - IN na conta destino
- [ ] Vincular as duas movimentações (transfer_id)
- [ ] Descrição automática: "Transferência para [Conta]" / "Transferência de [Conta]"
- [ ] Toast de sucesso
- [ ] Atualizar saldos em tempo real

### 4.2 Histórico de Transferências
**Como** usuário  
**Quero** ver o histórico de transferências  
**Para** acompanhar movimentações entre contas

**Critérios de Aceitação:**
- [ ] No extrato, identificar transferências com ícone especial
- [ ] Link clicável para a conta relacionada
- [ ] Filtro específico para transferências
- [ ] Página `/contas/transferencias` com histórico completo
- [ ] Possibilidade de estornar transferência (criar transferência reversa)

---

## Fase 5: Exportação e Relatórios

### 5.1 Exportar Extrato da Conta
**Como** usuário  
**Quero** exportar o extrato da conta  
**Para** usar em análises externas ou arquivo

**Critérios de Aceitação:**
- [ ] Botão "Exportar" no dashboard da conta
- [ ] Opções: PDF, Excel (XLSX), CSV
- [ ] PDF formatado com:
  - Cabeçalho: nome da conta, período, data de emissão
  - Resumo: saldo inicial, entradas, saídas, saldo final
  - Tabela de movimentações
  - Rodapé: totais e assinatura
- [ ] Excel/CSV com todas as colunas
- [ ] Respeitar filtros ativos
- [ ] Nome do arquivo: "Extrato_[Conta]_[Data].pdf"
- [ ] Usar jspdf e jspdf-autotable (já instalados)

### 5.2 Relatório Comparativo de Contas
**Como** usuário  
**Quero** comparar performance entre contas  
**Para** identificar qual conta é mais usada

**Critérios de Aceitação:**
- [ ] Página `/contas/relatorios` com análises
- [ ] Tabela comparativa: nome, saldo, entradas, saídas, movimentações
- [ ] Gráfico de barras: saldo por conta
- [ ] Gráfico de pizza: distribuição percentual
- [ ] Filtro por período
- [ ] Exportar relatório comparativo

---

## Fase 6: Metas e Alertas

### 6.1 Metas por Conta
**Como** usuário  
**Quero** definir metas de saldo para cada conta  
**Para** acompanhar meu progresso financeiro

**Critérios de Aceitação:**
- [ ] Campo `goal_amount` (decimal, opcional) no banco
- [ ] Campo `goal_deadline` (date, opcional) no banco
- [ ] Configurar meta no formulário de edição da conta
- [ ] No dashboard, mostrar card de meta:
  - Valor da meta
  - Saldo atual
  - Percentual atingido
  - Barra de progresso
  - Dias restantes (se tiver deadline)
- [ ] Cores: verde se atingiu, amarelo se próximo, vermelho se longe
- [ ] Notificação quando atingir meta

### 6.2 Alertas de Saldo
**Como** usuário  
**Quero** receber alertas sobre saldo baixo  
**Para** tomar ações preventivas

**Critérios de Aceitação:**
- [ ] Campo `alert_threshold` (decimal, opcional) no banco
- [ ] Configurar limite de alerta na edição da conta
- [ ] Verificar saldo após cada movimentação
- [ ] Se saldo < threshold, mostrar alerta no dashboard
- [ ] Badge de alerta na lista de contas
- [ ] Toast quando saldo ficar abaixo do limite
- [ ] Página de alertas: `/contas/alertas`

### 6.3 Notificações e Resumos
**Como** usuário  
**Quero** receber resumos periódicos  
**Para** acompanhar minhas finanças sem precisar entrar no sistema

**Critérios de Aceitação:**
- [ ] Resumo diário (opcional, configurável):
  - Total movimentado no dia
  - Saldo de cada conta
  - Alertas ativos
- [ ] Resumo semanal/mensal
- [ ] Notificações in-app (toast)
- [ ] Futuramente: email/WhatsApp (fora do escopo inicial)

---

## Fase 7: Conciliação Bancária (Avançado)

### 7.1 Marcar Movimentações como Conferidas
**Como** usuário  
**Quero** marcar movimentações como conferidas  
**Para** saber o que já foi validado com o banco

**Critérios de Aceitação:**
- [ ] Campo `reconciled` (boolean, default false) em cash_movements
- [ ] Campo `reconciled_at` (timestamp, nullable)
- [ ] Campo `reconciled_by` (uuid, nullable, FK para profiles)
- [ ] Checkbox na tabela de movimentações
- [ ] Ação em lote: marcar múltiplas como conferidas
- [ ] Filtro: mostrar só conferidas/não conferidas
- [ ] Não permitir editar movimentações conferidas
- [ ] Badge visual indicando status

### 7.2 Importação de Extrato Bancário (Futuro)
**Como** usuário  
**Quero** importar extrato do banco  
**Para** comparar com minhas movimentações

**Critérios de Aceitação:**
- [ ] Upload de arquivo CSV/OFX
- [ ] Parser de diferentes formatos bancários
- [ ] Comparação automática com movimentações
- [ ] Identificar divergências
- [ ] Sugerir matches automáticos
- [ ] Permitir match manual
- [ ] Criar movimentações faltantes

---

## Fase 8: Integrações no Sistema

### 8.1 Dashboard Principal
**Como** usuário  
**Quero** ver resumo financeiro no dashboard principal  
**Para** ter visão geral sem entrar em contas

**Critérios de Aceitação:**
- [ ] Card "Visão Financeira" no dashboard
- [ ] Mostrar saldo total de todas as contas
- [ ] Gráfico mini de distribuição
- [ ] Lista de contas com saldo baixo
- [ ] Link rápido para cada conta
- [ ] Atualização em tempo real

### 8.2 Melhorias em Vendas/Checkout
**Como** usuário  
**Quero** melhor integração com contas ao vender  
**Para** registrar pagamentos corretamente

**Critérios de Aceitação:**
- [ ] Seletor de conta melhorado (Fase 3)
- [ ] Sugestão inteligente de conta
- [ ] Mostrar saldo após pagamento
- [ ] Permitir dividir entre contas
- [ ] Histórico mostra conta usada

### 8.3 Melhorias em Compras
**Como** usuário  
**Quero** melhor integração com contas ao comprar  
**Para** controlar gastos por conta

**Critérios de Aceitação:**
- [ ] Seletor de conta melhorado
- [ ] Validação de saldo
- [ ] Histórico de compras por conta
- [ ] Relatório de gastos por conta

### 8.4 Página de Caixa Integrada
**Como** usuário  
**Quero** ver movimentações por conta na página de caixa  
**Para** ter visão consolidada

**Critérios de Aceitação:**
- [ ] Filtro por conta já existe (manter)
- [ ] Adicionar gráfico de evolução por conta
- [ ] Comparação entre contas
- [ ] Atalho para dashboard da conta
- [ ] Mostrar transferências

---

## Requisitos Não Funcionais

### Performance
- [ ] Dashboard deve carregar em < 2 segundos
- [ ] Gráficos devem renderizar em < 1 segundo
- [ ] Filtros devem aplicar em < 500ms
- [ ] Paginação para listas grandes (> 100 itens)

### Usabilidade
- [ ] Interface responsiva (mobile, tablet, desktop)
- [ ] Skeleton loading em todos os carregamentos
- [ ] Animações suaves (< 300ms)
- [ ] Feedback visual imediato em ações
- [ ] Estados vazios amigáveis
- [ ] Mensagens de erro claras

### Segurança
- [ ] RLS policies para todas as tabelas novas
- [ ] Validação de tenant_id em todas as operações
- [ ] Não permitir transferências entre tenants
- [ ] Logs de auditoria para operações críticas

### Acessibilidade
- [ ] Cores com contraste adequado (WCAG AA)
- [ ] Labels em todos os inputs
- [ ] Navegação por teclado
- [ ] ARIA labels apropriados

---

## Dependências Técnicas

### Bibliotecas Necessárias
- ✅ recharts (já instalado) - gráficos
- ✅ jspdf, jspdf-autotable (já instalados) - PDF
- ✅ papaparse (já instalado) - CSV
- ✅ date-fns (já instalado) - datas
- ✅ react-hook-form (já instalado) - formulários
- ✅ sonner (já instalado) - toasts

### Novas Tabelas/Campos
- Migrations para novos campos em bank_accounts
- Campos em cash_movements para conciliação
- Tabela de metas (ou campos em bank_accounts)
- Tabela de alertas/notificações

---

## Ordem de Implementação Sugerida

1. **Fase 1** - Cadastro melhorado (base para tudo)
2. **Fase 2** - Dashboard individual (valor imediato)
3. **Fase 3** - Seletores melhorados (melhora UX em todo sistema)
4. **Fase 4** - Transferências (funcionalidade chave)
5. **Fase 5** - Exportação (relatórios)
6. **Fase 6** - Metas e alertas (engajamento)
7. **Fase 7** - Conciliação (avançado)
8. **Fase 8** - Integrações finais (polish)

---

## Métricas de Sucesso

- [ ] Tempo médio para encontrar uma conta reduzido em 50%
- [ ] Usuários conseguem identificar visualmente contas sem ler nomes
- [ ] 100% das operações financeiras vinculadas a contas
- [ ] Usuários usam dashboard de conta regularmente
- [ ] Transferências entre contas funcionam sem erros
- [ ] Exportações geram arquivos corretos
- [ ] Metas ajudam usuários a atingir objetivos financeiros

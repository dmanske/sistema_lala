# Guia de Teste - Melhorias de Contas Bancárias

## 🎯 O que foi implementado (Fase 1)

Melhorias completas no sistema de cadastro e visualização de contas bancárias com personalização visual, organização inteligente e visão financeira consolidada.

---

## 🧪 Roteiro de Testes

### 1. Visualização da Lista de Contas

**Acesse:** `/contas`

**O que testar:**
- [ ] Página carrega com skeleton loading
- [ ] Cards de contas aparecem em grid responsivo
- [ ] Cada card mostra:
  - Ícone grande e colorido
  - Nome da conta
  - Tipo (Banco/Cartão/Carteira)
  - Saldo atual (verde se positivo, vermelho se negativo)
  - Estrela amarela se for favorita
  - Dados bancários (se cadastrados)
  - Badge de status (Ativa/Inativa)
- [ ] Cards têm borda colorida com a cor da conta
- [ ] Contas estão ordenadas: favorita primeiro, depois por ordem customizada

**Resultado esperado:**
- 5 contas aparecem: Caixa Geral (favorita), Nubank, Banco Bradesco, PicPay, Cartão Crédito
- Cada uma com cor e ícone únicos
- Caixa Geral tem estrela amarela

---

### 2. Cards de Resumo Financeiro

**Localização:** Topo da página `/contas`

**O que testar:**
- [ ] Card "Saldo Total" mostra soma de todas as contas ativas
- [ ] Card "Saldos Positivos" mostra total em verde
- [ ] Card "Saldos Negativos" mostra total em vermelho
- [ ] Cada card mostra quantidade de contas

**Resultado esperado:**
- Valores corretos baseados nos saldos das contas
- Cores apropriadas (verde/vermelho)
- Ícones corretos (Wallet, TrendingUp, TrendingDown)

---

### 3. Gráfico de Distribuição

**Localização:** Abaixo dos cards de resumo

**O que testar:**
- [ ] Gráfico de pizza aparece
- [ ] Cada fatia tem cor da conta correspondente
- [ ] Labels mostram nome e percentual
- [ ] Tooltip mostra valor em R$ ao passar mouse
- [ ] Legenda lista todas as contas

**Resultado esperado:**
- Gráfico renderiza corretamente
- Cores correspondem às cores das contas
- Valores somam 100%

---

### 4. Filtros e Busca

**Localização:** Abaixo do gráfico

**O que testar:**
- [ ] Campo de busca funciona
  - Digite "Nubank" → só Nubank aparece
  - Digite "Bradesco" → só Bradesco aparece
  - Limpe → todas voltam
- [ ] Botões de filtro funcionam
  - Clique "Todas" → mostra todas
  - Clique "Ativas" → mostra só ativas
  - Clique "Inativas" → mostra só inativas (se houver)
- [ ] Busca e filtro funcionam juntos

**Resultado esperado:**
- Busca é case-insensitive
- Busca funciona em nome e banco
- Filtros atualizam a lista instantaneamente

---

### 5. Criar Nova Conta

**Ação:** Clique "Nova Conta"

**O que testar:**
- [ ] Dialog abre com formulário
- [ ] Preview da conta aparece no topo
- [ ] Campos obrigatórios: Nome e Tipo
- [ ] Seletor de ícone mostra 15 opções
- [ ] Seletor de cor mostra 10 cores + input customizado
- [ ] Preview atualiza ao mudar nome, ícone ou cor
- [ ] Estrela aparece no preview se marcar como favorita
- [ ] Tipo "Cartão" mostra campo de limite de crédito
- [ ] Seção de dados bancários é opcional
- [ ] Botão "Salvar" cria a conta

**Teste específico:**
1. Nome: "Teste Banco"
2. Tipo: Banco
3. Ícone: 🏧
4. Cor: Azul claro
5. Saldo Inicial: 1000
6. Marque como favorita
7. Banco: "Banco Teste"
8. Agência: "0001"
9. Conta: "12345-6"
10. Salve

**Resultado esperado:**
- Conta criada com sucesso
- Toast de confirmação aparece
- Nova conta aparece na lista
- Está no topo (favorita)
- Tem estrela amarela
- Mostra dados bancários no card

---

### 6. Editar Conta Existente

**Ação:** Clique no ícone de lápis em qualquer conta

**O que testar:**
- [ ] Dialog abre com dados preenchidos
- [ ] Preview mostra conta atual
- [ ] Pode mudar cor → preview atualiza
- [ ] Pode mudar ícone → preview atualiza
- [ ] Pode adicionar descrição
- [ ] Pode marcar/desmarcar favorita
- [ ] Pode adicionar dados bancários
- [ ] Saldo inicial NÃO aparece (só na criação)
- [ ] Salvar atualiza a conta

**Teste específico:**
1. Edite "Nubank"
2. Mude cor para roxo mais escuro
3. Adicione descrição: "Conta principal digital"
4. Marque como favorita
5. Salve

**Resultado esperado:**
- Conta atualizada
- Nova cor aplicada
- Agora tem 2 favoritas (Caixa Geral e Nubank)
- Descrição aparece no card

---

### 7. Desativar/Ativar Conta

**Ação:** Clique no ícone de power em qualquer conta

**O que testar:**
- [ ] Confirmação aparece (ou ação direta)
- [ ] Conta muda status
- [ ] Badge muda de "Ativa" para "Inativa"
- [ ] Toast de confirmação
- [ ] Filtro "Inativas" mostra a conta
- [ ] Pode reativar clicando novamente

**Resultado esperado:**
- Status muda corretamente
- Conta inativa não conta nos resumos
- Pode ser reativada

---

### 8. Ver Dashboard da Conta

**Ação:** Clique no ícone de olho em qualquer conta

**O que testar:**
- [ ] Navega para `/contas/[id]`
- [ ] Página do dashboard carrega (ainda é o extrato simples)

**Nota:** O dashboard completo será implementado na Fase 2

---

### 9. Estado Vazio

**Teste:** Use filtro ou busca que não retorna resultados

**O que testar:**
- [ ] Mensagem amigável aparece
- [ ] Ícone de carteira
- [ ] Texto explicativo
- [ ] Botão "Nova Conta" (se não houver busca)

**Resultado esperado:**
- Estado vazio bem apresentado
- Não mostra erro
- Oferece ação clara

---

### 10. Responsividade

**Teste em diferentes tamanhos:**

**Desktop (>1024px):**
- [ ] 3 colunas de cards
- [ ] Gráfico ocupa largura total
- [ ] Filtros em linha horizontal

**Tablet (768-1024px):**
- [ ] 2 colunas de cards
- [ ] Gráfico ajustado
- [ ] Filtros ainda em linha

**Mobile (<768px):**
- [ ] 1 coluna de cards
- [ ] Cards de resumo empilhados (2x2)
- [ ] Gráfico responsivo
- [ ] Filtros empilhados verticalmente
- [ ] Busca ocupa largura total

**Resultado esperado:**
- Layout se adapta perfeitamente
- Nada quebra ou sobrepõe
- Touch targets são grandes o suficiente

---

## 🎨 Verificações Visuais

### Cores das Contas (Padrão)
- Caixa Geral: 💰 Amber (#F59E0B)
- Nubank: 💜 Roxo (#820AD1)
- Banco Bradesco: 🏦 Vermelho (#CC092F)
- PicPay: 💚 Verde (#11C76F)
- Cartão Crédito: 💳 Vermelho (#EF4444)

### Glassmorphism
- [ ] Cards têm backdrop blur
- [ ] Fundo semi-transparente
- [ ] Bordas sutis
- [ ] Sombras em hover

### Animações
- [ ] Hover nos cards aumenta sombra
- [ ] Transições suaves (< 300ms)
- [ ] Skeleton loading anima
- [ ] Toast aparece/desaparece suavemente

---

## 🐛 Casos de Erro para Testar

### 1. Validações do Formulário
- [ ] Tentar salvar sem nome → erro
- [ ] Nome com só espaços → erro
- [ ] Nome com mais de 100 caracteres → erro
- [ ] Limite de crédito negativo → erro

### 2. Duplicação
- [ ] Criar conta com nome existente → deve permitir (não há constraint de unique)

### 3. Contas Inativas
- [ ] Conta inativa não aparece em seletores (quando implementado)
- [ ] Conta inativa não conta nos totais
- [ ] Pode ser reativada

---

## ✅ Checklist Final

Antes de aprovar, verifique:

- [ ] Todas as contas aparecem corretamente
- [ ] Cores e ícones estão corretos
- [ ] Favorita tem estrela
- [ ] Saldos estão corretos (positivo/negativo)
- [ ] Gráfico renderiza
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Criar conta funciona
- [ ] Editar conta funciona
- [ ] Desativar/ativar funciona
- [ ] Responsivo em mobile
- [ ] Sem erros no console
- [ ] Build passou
- [ ] Performance é boa (< 2s para carregar)

---

## 🚀 Próximos Testes (Fase 2)

Quando o dashboard individual for implementado:
- Gráficos de evolução
- Estatísticas detalhadas
- Extrato melhorado
- Filtros avançados

---

## 📞 Reportar Problemas

Se encontrar bugs:
1. Anote o que estava fazendo
2. Tire screenshot se possível
3. Verifique console do navegador
4. Descreva o comportamento esperado vs atual

---

**Bom teste! 🎉**

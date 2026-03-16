---
inclusion: auto
description: "Workflow de planejamento de features com fases estruturadas"
---

# Feature Planning Workflow - Regra Global

## Processo Padrão para Planejamento de Módulos/Features

Quando o usuário solicitar análise, melhorias ou criação de um novo módulo/feature, SEMPRE seguir este workflow:

### 1. Análise e Documentação Completa

#### 1.1 Análise Inicial
- Analisar o módulo/feature existente (se aplicável)
- Identificar problemas, gaps e oportunidades
- Propor soluções e melhorias
- Ativar skills relevantes se disponíveis

#### 1.2 Criar Documentação Detalhada
Criar arquivo em `docs/[NOME_DO_MODULO]_IMPROVEMENTS.md` contendo:
- 🎯 Visão Geral
- 📋 Situação Atual
- ❌ Problemas Identificados
- 🚀 Roadmap de Implementação (dividido em fases)
- 📊 Métricas e KPIs
- 🎨 Design System
- 🧪 Testes
- 📚 Documentação
- 🔐 Segurança e Permissões
- 📦 Dependências

#### 1.3 Criar Tasks Detalhadas por Fase
Criar arquivos em `docs/tasks/FASE_[N]_[NOME].md` para cada fase, contendo:
- Objetivo da fase
- Tasks individuais com:
  - Prioridade (🔴 ALTA, 🟡 MÉDIA, 🟢 BAIXA)
  - Complexidade
  - Tempo estimado
  - Entregas detalhadas
  - Componentes a criar
  - Migrations SQL (se aplicável)
  - Interfaces TypeScript
  - Lógica de negócio
  - Critérios de aceitação
  - Testes necessários

### 2. Consolidação em Spec Única

#### 2.1 Criar Arquivo de Spec
Criar arquivo único em `.kiro/specs/[nome-do-modulo]/IMPLEMENTATION_STATUS.md` contendo:

**Estrutura obrigatória:**
```markdown
# [Nome do Módulo] - Status de Implementação

**Data de Criação:** [data]
**Status:** 📋 PLANEJAMENTO
**Prioridade:** 🔴 ALTA / 🟡 MÉDIA / 🟢 BAIXA
**Duração Total:** [estimativa]

---

## 🎯 VISÃO GERAL
- Objetivo
- Problema Atual
- Solução Proposta

---

## 📋 FASE [N] - [NOME DA FASE]

### Objetivo da Fase
[descrição]

---

### TASK [N.M]: [Nome da Task] [emoji prioridade]
**Prioridade:** [ALTA/MÉDIA/BAIXA]
**Tempo:** [estimativa]
**Status:** ⏳ NÃO INICIADO

#### Entregas
- [ ] Item 1
- [ ] Item 2

#### Componentes a Criar
```
[estrutura de arquivos]
```

#### Migrations SQL (se aplicável)
```sql
[código SQL]
```

#### Interfaces TypeScript
```typescript
[interfaces]
```

#### Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2

---

## 📦 DEPENDÊNCIAS
[lista de dependências NPM]

---

## 🔄 PROGRESSO GERAL
- [ ] Task 1 (0%)
- [ ] Task 2 (0%)
**PROGRESSO TOTAL:** 0%

---

## 📝 DOCUMENTAÇÃO RELACIONADA
- [links para docs]
```

#### 2.2 Características da Spec
- ✅ Arquivo ÚNICO consolidado (não criar múltiplos arquivos)
- ✅ Todas as tasks em um só lugar
- ✅ Checkboxes para acompanhar progresso
- ✅ Estrutura clara e navegável
- ✅ Pronta para execução via interface do Kiro

### 3. Organização de Arquivos

```
projeto/
├── docs/
│   ├── [MODULO]_IMPROVEMENTS.md          # Documentação completa
│   └── tasks/
│       ├── README.md                      # Índice de tasks
│       ├── FASE_1_[NOME].md              # Tasks detalhadas fase 1
│       └── FASE_2_[NOME].md              # Tasks detalhadas fase 2
│
└── .kiro/
    └── specs/
        └── [modulo-nome]/
            └── IMPLEMENTATION_STATUS.md   # SPEC ÚNICA CONSOLIDADA
```

### 4. Nomenclatura Padrão

- **Documentação:** `[MODULO]_IMPROVEMENTS.md` (UPPER_SNAKE_CASE)
- **Tasks:** `FASE_[N]_[NOME].md` (UPPER_SNAKE_CASE)
- **Specs:** `[modulo-nome]/IMPLEMENTATION_STATUS.md` (kebab-case para pasta)

### 5. Prioridades e Emojis

- 🔴 ALTA - Funcionalidade crítica ou bloqueante
- 🟡 MÉDIA - Funcionalidade importante mas não bloqueante
- 🟢 BAIXA - Melhorias e otimizações

### 6. Status das Tasks

- ⏳ NÃO INICIADO
- 🚧 EM PROGRESSO
- ✅ CONCLUÍDO
- ⚠️ BLOQUEADO
- ❌ CANCELADO

### 7. Divisão em Fases

Sempre dividir o trabalho em fases lógicas:
- **Fase 1:** Fundação/Core (funcionalidades essenciais)
- **Fase 2:** Gestão Avançada (features complementares)
- **Fase 3:** Automação/Integrações (se aplicável)

### 8. Após Criação da Spec

1. Informar ao usuário que a documentação está completa
2. Mostrar estrutura criada
3. Explicar como executar as tasks via interface do Kiro
4. Perguntar se deseja iniciar alguma task específica

## Exemplo de Uso

**Usuário:** "Analise o módulo de vendas e proponha melhorias"

**Processo:**
1. ✅ Analisar módulo atual
2. ✅ Criar `docs/SALES_IMPROVEMENTS.md`
3. ✅ Criar `docs/tasks/FASE_1_FUNDACAO.md`
4. ✅ Criar `docs/tasks/FASE_2_GESTAO_AVANCADA.md`
5. ✅ Criar `.kiro/specs/sales-improvements/IMPLEMENTATION_STATUS.md` (ÚNICO)
6. ✅ Informar usuário e aguardar próximos passos

## Benefícios deste Workflow

- 📋 Documentação completa e organizada
- 🎯 Planejamento claro e estruturado
- ✅ Fácil acompanhamento de progresso
- 🔄 Execução via interface do Kiro
- 📚 Histórico de decisões e implementações
- 🚀 Facilita onboarding de novos desenvolvedores

## Notas Importantes

- **SEMPRE consolidar em arquivo único** - não criar múltiplos arquivos de spec
- **Incluir TODAS as informações necessárias** - migrations, interfaces, lógica
- **Ser específico e detalhado** - facilita execução posterior
- **Manter consistência** - seguir sempre o mesmo padrão
- **Documentar decisões** - explicar o "porquê" das escolhas

---

**Última atualização:** 2025-02-25
**Versão:** 1.0

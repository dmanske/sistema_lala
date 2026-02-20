# 📁 Pasta .kiro - Configurações do Workspace

Esta pasta contém configurações **locais do workspace** do Kiro. Algumas são versionadas no Git, outras são específicas de cada desenvolvedor.

## 🎯 Propósito

A pasta `.kiro/` armazena:
- ✅ **Steering:** Regras e contexto específico do projeto
- ✅ **Hooks:** Automações baseadas em eventos
- ✅ **Specs:** Especificações de features (tasks)
- ⚠️ **Settings:** Configurações locais (MCP servers, etc)

---

## 📂 Estrutura

```
.kiro/
├── steering/       # Regras e contexto do projeto (versionado)
├── hooks/          # Automações (versionado)
├── specs/          # Especificações de features (versionado)
└── settings/       # Configurações locais (não versionado)
    └── mcp.json    # MCP servers
```

---

## 📖 Steering (Regras do Projeto)

### O que é Steering?

Steering files são arquivos markdown que fornecem **contexto e regras** para o Kiro sobre como trabalhar neste projeto.

### Tipos de Inclusão

1. **Always (padrão):** Sempre incluído no contexto
2. **File Match:** Incluído quando um arquivo específico é lido
3. **Manual:** Incluído apenas quando você menciona com `#`

### Exemplo de Steering File

```markdown
---
inclusion: always
---

# Padrões de Código

## Nomenclatura
- Componentes: PascalCase
- Funções: camelCase
- Constantes: UPPER_SNAKE_CASE

## Estrutura de Pastas
- Componentes em `src/components/`
- Hooks em `src/hooks/`
- Utils em `src/lib/`
```

---

## 🪝 Hooks (Automações)

### O que são Hooks?

Hooks automatizam ações baseadas em eventos do IDE.

### Eventos Disponíveis

| Evento | Quando dispara |
|--------|----------------|
| `fileEdited` | Ao salvar um arquivo |
| `fileCreated` | Ao criar um arquivo |
| `fileDeleted` | Ao deletar um arquivo |
| `promptSubmit` | Ao enviar mensagem ao Kiro |
| `agentStop` | Quando o Kiro termina execução |
| `preToolUse` | Antes de usar uma ferramenta |
| `postToolUse` | Depois de usar uma ferramenta |
| `preTaskExecution` | Antes de iniciar uma task (spec) |
| `postTaskExecution` | Depois de completar uma task |
| `userTriggered` | Quando você clica manualmente |

### Ações Disponíveis

1. **askAgent:** Envia uma mensagem ao Kiro
2. **runCommand:** Executa um comando shell

### Exemplo de Hook

```json
{
  "name": "Lint on Save",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["*.ts", "*.tsx"]
  },
  "then": {
    "type": "runCommand",
    "command": "npm run lint"
  }
}
```

---

## 📋 Specs (Especificações)

### O que são Specs?

Specs são uma forma estruturada de construir features complexas com o Kiro.

### Fluxo de Trabalho

1. **Requirements:** Define o que precisa ser feito
2. **Design:** Planeja como será feito
3. **Tasks:** Divide em tarefas menores
4. **Implementation:** Kiro executa as tasks

### Quando Usar

- Features complexas com múltiplos arquivos
- Projetos que precisam de planejamento
- Desenvolvimento incremental com feedback

---

## ⚙️ Settings (Configurações Locais)

### MCP Servers

MCP (Model Context Protocol) permite adicionar ferramentas externas ao Kiro.

**Exemplo de `mcp.json`:**

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

---

## 🔄 Diferença entre .agent e .kiro

| Aspecto | .agent/ | .kiro/ |
|---------|---------|--------|
| **Escopo** | Projeto | Workspace |
| **Git** | ✅ Sempre versionado | ⚠️ Parcialmente |
| **Conteúdo** | Workflows, setup | Steering, hooks, specs |
| **Compartilhado** | ✅ Toda equipe | ⚠️ Depende |

---

## 📚 Documentação Relacionada

- [.agent/README.md](../.agent/README.md) - Workflows e skills
- [docs/KIRO_SETUP.md](../docs/KIRO_SETUP.md) - Setup completo

---

**Última atualização:** Fevereiro 2026

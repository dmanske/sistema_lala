# 📚 Índice da Documentação - Kiro Setup

Guia completo de toda a documentação disponível neste projeto.

---

## 🚀 Início Rápido

**Primeiro acesso? Comece aqui:**

| Arquivo | Descrição | Tempo |
|---------|-----------|-------|
| [SETUP_PC_NOVO.md](../SETUP_PC_NOVO.md) | Guia rápido para PC novo | 2 min |
| [setup/QUICK_START.md](setup/QUICK_START.md) | Setup em 1 minuto | 1 min |
| [setup/CHECKLIST_PC_NOVO.md](setup/CHECKLIST_PC_NOVO.md) | Checklist visual | 5 min |

---

## 📖 Documentação Principal

### Para Desenvolvedores

| Arquivo | Conteúdo | Quando Usar |
|---------|----------|-------------|
| [README.md](../README.md) | Documentação do projeto | Entender o projeto |
| [docs/KIRO_SETUP.md](../docs/KIRO_SETUP.md) | Setup completo do Kiro | Configuração detalhada |
| [setup/SETUP_GUIDE.md](setup/SETUP_GUIDE.md) | Passo a passo detalhado | Setup manual |

### Para Entender a Estrutura

| Arquivo | Conteúdo | Quando Usar |
|---------|----------|-------------|
| [.agent/README.md](README.md) | Workflows e skills | Entender .agent/ |
| [.kiro/README.md](../.kiro/README.md) | Hooks, steering, specs | Entender .kiro/ |
| [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) | Visão geral completa | Overview executivo |

---

## 🛠️ Scripts e Ferramentas

### Scripts de Instalação

| Script | Função | Uso |
|--------|--------|-----|
| [setup/setup-new-pc.sh](setup/setup-new-pc.sh) | Setup completo automático | `bash .agent/setup/setup-new-pc.sh` |
| [setup/install-skills.sh](setup/install-skills.sh) | Instala só as skills | `bash .agent/setup/install-skills.sh` |

### Configurações

| Arquivo | Conteúdo | Quando Usar |
|---------|----------|-------------|
| [setup/global-config.md](setup/global-config.md) | Configs globais | Backup/restauração |
| [setup/MCP_CONFIG.md](setup/MCP_CONFIG.md) | Configuração de MCP | Setup de servidores MCP |
| [workflows/consult-skills.md](workflows/consult-skills.md) | Workflow de skills | Entender automação |
| [.kiro/hooks/consult-skills-before-task.json](../.kiro/hooks/consult-skills-before-task.json) | Hook automático | Entender hooks |

---

## 📊 Por Objetivo

### Quero Configurar um PC Novo

1. [SETUP_PC_NOVO.md](../SETUP_PC_NOVO.md) - Leia primeiro
2. [setup/QUICK_START.md](setup/QUICK_START.md) - Execute
3. [setup/CHECKLIST_PC_NOVO.md](setup/CHECKLIST_PC_NOVO.md) - Verifique

### Quero Entender Como Funciona

1. [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) - Visão geral
2. [.agent/README.md](README.md) - Workflows
3. [.kiro/README.md](../.kiro/README.md) - Hooks

### Quero Configurar Manualmente

1. [setup/SETUP_GUIDE.md](setup/SETUP_GUIDE.md) - Passo a passo
2. [setup/global-config.md](setup/global-config.md) - Configs
3. [docs/KIRO_SETUP.md](../docs/KIRO_SETUP.md) - Referência

### Quero Configurar MCP Servers

1. [setup/MCP_CONFIG.md](setup/MCP_CONFIG.md) - Guia completo
2. [setup/global-config.md](setup/global-config.md) - Configs globais
3. `.kiro/settings/mcp.json` - Arquivo de configuração

### Quero Fazer Backup

1. [setup/global-config.md](setup/global-config.md) - Scripts de backup
2. [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) - Manutenção

### Quero Troubleshooting

1. [SETUP_PC_NOVO.md](../SETUP_PC_NOVO.md) - Seção de problemas
2. [setup/SETUP_GUIDE.md](setup/SETUP_GUIDE.md) - Troubleshooting
3. [setup/CHECKLIST_PC_NOVO.md](setup/CHECKLIST_PC_NOVO.md) - Verificação

---

## 🎯 Por Nível de Experiência

### Iniciante

**Nunca usei Kiro antes:**

1. [SETUP_PC_NOVO.md](../SETUP_PC_NOVO.md)
2. [setup/QUICK_START.md](setup/QUICK_START.md)
3. [docs/KIRO_SETUP.md](../docs/KIRO_SETUP.md)

### Intermediário

**Já uso Kiro, mas não conheço skills:**

1. [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)
2. [.agent/README.md](README.md)
3. [workflows/consult-skills.md](workflows/consult-skills.md)

### Avançado

**Quero customizar e entender tudo:**

1. [setup/global-config.md](setup/global-config.md)
2. [.kiro/README.md](../.kiro/README.md)
3. [setup/SETUP_GUIDE.md](setup/SETUP_GUIDE.md)

---

## 📁 Estrutura de Arquivos

```
📁 Projeto/
│
├── 📄 SETUP_PC_NOVO.md                    # ⭐ Comece aqui
├── 📄 README.md                           # Documentação do projeto
│
├── 📁 .agent/                             # Configurações do projeto
│   ├── 📄 README.md                       # Workflows e skills
│   ├── 📄 RESUMO_EXECUTIVO.md             # Visão geral
│   ├── 📄 INDICE_DOCUMENTACAO.md          # Este arquivo
│   │
│   ├── 📁 workflows/
│   │   └── 📄 consult-skills.md           # Workflow automático
│   │
│   └── 📁 setup/
│       ├── 📄 setup-new-pc.sh             # ⭐ Script principal
│       ├── 📄 install-skills.sh           # Instala skills
│       ├── 📄 SETUP_GUIDE.md              # Guia detalhado
│       ├── 📄 CHECKLIST_PC_NOVO.md        # Checklist
│       ├── 📄 QUICK_START.md              # Início rápido
│       └── 📄 global-config.md            # Configs globais
│
├── 📁 .kiro/                              # Configurações locais
│   ├── 📄 README.md                       # Hooks e steering
│   │
│   └── 📁 hooks/
│       └── 📄 consult-skills-before-task.json  # Hook automático
│
└── 📁 docs/
    └── 📄 KIRO_SETUP.md                   # Documentação completa
```

---

## 🔍 Busca Rápida

### Comandos

| Comando | Onde Encontrar |
|---------|----------------|
| Setup completo | [setup/setup-new-pc.sh](setup/setup-new-pc.sh) |
| Instalar skills | [setup/install-skills.sh](setup/install-skills.sh) |
| Verificar instalação | [setup/CHECKLIST_PC_NOVO.md](setup/CHECKLIST_PC_NOVO.md) |
| Backup configs | [setup/global-config.md](setup/global-config.md) |

### Conceitos

| Conceito | Onde Encontrar |
|----------|----------------|
| O que são skills? | [.agent/README.md](README.md) |
| Como funcionam workflows? | [workflows/consult-skills.md](workflows/consult-skills.md) |
| O que são hooks? | [.kiro/README.md](../.kiro/README.md) |
| O que é MCP? | [setup/MCP_CONFIG.md](setup/MCP_CONFIG.md) |
| Diferença .agent vs .kiro | [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) |

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| Skills não instaladas | [SETUP_PC_NOVO.md](../SETUP_PC_NOVO.md) - Troubleshooting |
| Dependências com erro | [setup/SETUP_GUIDE.md](setup/SETUP_GUIDE.md) - Troubleshooting |
| Kiro não reconhece skills | [setup/CHECKLIST_PC_NOVO.md](setup/CHECKLIST_PC_NOVO.md) - Verificação |
| Hook não dispara | [.kiro/README.md](../.kiro/README.md) - Hooks |

---

## 📊 Estatísticas

- **Total de arquivos de documentação:** 13
- **Scripts automatizados:** 2
- **Guias passo a passo:** 3
- **Checklists:** 1
- **Resumos executivos:** 1
- **READMEs:** 3

---

## 🔗 Links Externos

- [Kiro IDE](https://kiro.ai)
- [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills)
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

---

## 💡 Dicas

### Para Leitura Rápida

1. [SETUP_PC_NOVO.md](../SETUP_PC_NOVO.md) (2 min)
2. [setup/QUICK_START.md](setup/QUICK_START.md) (1 min)
3. Execute: `bash .agent/setup/setup-new-pc.sh`

### Para Entendimento Profundo

1. [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) (10 min)
2. [.agent/README.md](README.md) (5 min)
3. [.kiro/README.md](../.kiro/README.md) (5 min)
4. [docs/KIRO_SETUP.md](../docs/KIRO_SETUP.md) (15 min)

### Para Referência

Mantenha aberto:
- [setup/CHECKLIST_PC_NOVO.md](setup/CHECKLIST_PC_NOVO.md)
- [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)

---

**Última atualização:** Fevereiro 2026

**Versão:** 1.0.0

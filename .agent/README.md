# 📁 Pasta .agent - Configurações do Projeto

Esta pasta contém configurações, workflows e scripts que são **compartilhados com toda a equipe** através do Git.

## 🎯 Propósito

A pasta `.agent/` armazena:
- ✅ Workflows que instruem o Kiro sobre como trabalhar neste projeto
- ✅ Scripts de setup e instalação
- ✅ Configurações compartilhadas entre desenvolvedores
- ✅ Documentação de processos

**Diferença importante:**
- `.agent/` → Versionado no Git, compartilhado com a equipe
- `.kiro/` → Configurações locais do workspace (steering, hooks, specs)
- `~/.agent/` → Configurações globais do usuário (skills)

---

## 📂 Estrutura

```
.agent/
├── workflows/              # Workflows automáticos do Kiro
│   └── consult-skills.md  # Instrui o Kiro a consultar skills antes de tarefas
├── setup/                 # Scripts de instalação e configuração
│   ├── SETUP_GUIDE.md    # Guia completo de setup
│   └── install-skills.sh # Script para instalar skills globais
└── README.md             # Este arquivo
```

---

## 🔄 Workflows

### O que são Workflows?

Workflows são arquivos markdown que instruem o Kiro sobre **como** trabalhar neste projeto. Eles são lidos automaticamente pelo Kiro quando você abre o projeto.

### Workflows Ativos

#### 1. `consult-skills.md`

**Propósito:** Instrui o Kiro a sempre consultar a biblioteca de skills antes de iniciar qualquer tarefa.

**Como funciona:**
1. Você pede algo ao Kiro (ex: "Crie um componente React")
2. O Kiro lê este workflow
3. Ele busca skills relevantes em `~/.agent/skills/`
4. Aplica as melhores práticas da skill encontrada

**Exemplo de uso:**
```
Você: "Preciso criar um formulário de login"
Kiro: *consulta skills de React, forms, security*
Kiro: *aplica padrões das skills encontradas*
```

---

## 🛠️ Setup

### Scripts de Instalação

#### `install-skills.sh`

Instala automaticamente a biblioteca **Antigravity Awesome Skills** (868+ skills).

**Uso:**
```bash
# Instalação
bash .agent/setup/install-skills.sh

# Atualização
bash .agent/setup/install-skills.sh --update
```

**O que faz:**
1. Verifica se Node.js está instalado
2. Instala skills em `~/.agent/skills/`
3. Verifica a instalação
4. Mostra exemplos de uso

---

## 📚 Skills Globais

### O que são Skills?

Skills são "superpoderes" para o Kiro. São arquivos markdown que ensinam o Kiro a executar tarefas específicas com excelência.

### Categorias Disponíveis

| Categoria | Exemplos | Quantidade |
|-----------|----------|------------|
| 🏗️ Architecture | system-design, c4-diagrams, ADRs | 50+ |
| 💻 Development | react-patterns, typescript-expert, python-best-practices | 200+ |
| 🔒 Security | api-security, sql-injection-testing, vulnerability-scanner | 100+ |
| ☁️ Infrastructure | docker-expert, aws-serverless, kubernetes | 80+ |
| 🧪 Testing | test-driven-development, playwright, testing-patterns | 70+ |
| 📊 Data & AI | rag-engineer, prompt-engineer, langgraph | 60+ |
| 📝 General | brainstorming, documentation, planning | 40+ |

**Total:** 868+ skills

### Como Usar Skills

No Kiro, simplesmente mencione a skill:

```
"Use @brainstorming para planejar uma feature de pagamentos"
"Use @react-patterns para criar este componente"
"Use @api-security para revisar esta rota"
```

### Fonte

Skills vêm do repositório: [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)

---

## 🔄 Adicionando Novos Workflows

Para adicionar um novo workflow:

1. Crie um arquivo `.md` em `.agent/workflows/`
2. Use frontmatter para metadados:

```markdown
---
description: Descrição do workflow
---

# Nome do Workflow

Instruções para o Kiro...
```

3. Commit e push para o repositório
4. O Kiro lerá automaticamente na próxima vez que abrir o projeto

---

## 🆘 Troubleshooting

### Workflows não estão sendo aplicados

1. Verifique se o arquivo está em `.agent/workflows/`
2. Reinicie o Kiro
3. Verifique o formato do arquivo (deve ser markdown válido)

### Skills não são encontradas

1. Verifique se estão instaladas: `ls ~/.agent/skills/skills/`
2. Execute: `bash .agent/setup/install-skills.sh`
3. Reinicie o Kiro

---

## 📖 Documentação Relacionada

- [docs/KIRO_SETUP.md](../docs/KIRO_SETUP.md) - Guia completo de setup
- [.kiro/README.md](../.kiro/README.md) - Hooks, steering e specs
- [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) - Biblioteca de skills

---

**Última atualização:** Fevereiro 2026

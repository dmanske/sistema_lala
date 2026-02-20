# 🚀 Guia Completo de Setup do Kiro

Este guia documenta como configurar o Kiro em um novo computador com todas as configurações, skills e workflows deste projeto.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Kiro](#instalação-do-kiro)
3. [Clonando o Projeto](#clonando-o-projeto)
4. [Instalando Skills Globais](#instalando-skills-globais)
5. [Configurações do Projeto](#configurações-do-projeto)
6. [Verificação](#verificação)
7. [Estrutura de Pastas](#estrutura-de-pastas)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **Git**
- **Kiro IDE** ([Download aqui](https://kiro.ai))

---

## 📥 Instalação do Kiro

1. Baixe o Kiro IDE do site oficial
2. Instale seguindo as instruções do instalador
3. Abra o Kiro pela primeira vez e complete o setup inicial

---

## 📦 Clonando o Projeto

```bash
# Clone o repositório
git clone <seu-repositorio>
cd <nome-do-projeto>

# Instale as dependências
npm install
```

---

## 🌟 Instalando Skills Globais

Este projeto usa a biblioteca **Antigravity Awesome Skills** (868+ skills) para melhorar as capacidades do Kiro.

### Opção 1: Script Automático (Recomendado)

```bash
bash .agent/setup/install-skills.sh
```

### Opção 2: Manual

```bash
# Instala em ~/.agent/skills (caminho universal)
npx antigravity-awesome-skills

# Verifica a instalação
test -d ~/.agent/skills && echo "✅ Skills instaladas com sucesso!"
```

### O que são Skills?

Skills são arquivos markdown que ensinam o Kiro a executar tarefas específicas:
- 🏗️ Arquitetura e design de sistemas
- 💻 Desenvolvimento (React, Next.js, TypeScript, Python, etc)
- 🔒 Segurança e testes
- ☁️ DevOps e infraestrutura
- 📊 Data & AI (RAG, LLMs, agents)
- 📝 Documentação e planejamento

**Fonte:** [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)

---

## ⚙️ Configurações do Projeto

### Estrutura de Configuração

```
📁 Projeto/
├── .agent/              # Configurações do projeto (vai no Git)
│   ├── workflows/       # Workflows automáticos
│   └── setup/          # Scripts de instalação
├── .kiro/              # Configurações locais do Kiro
│   ├── steering/       # Regras e contexto do projeto
│   ├── hooks/          # Automações (eventos)
│   └── settings/       # MCP servers, etc
└── ~/.agent/           # Configurações globais do usuário
    └── skills/         # 868+ skills instaladas
```

### Diferença entre .agent e .kiro

| Pasta | Escopo | Versionado no Git? | Uso |
|-------|--------|-------------------|-----|
| `.agent/` | Projeto | ✅ Sim | Workflows, setup, configs compartilhadas |
| `.kiro/` | Workspace | ⚠️ Parcial | Steering, hooks, specs do projeto |
| `~/.agent/` | Global (usuário) | ❌ Não | Skills globais |
| `~/.kiro/` | Global (usuário) | ❌ Não | MCP servers, settings globais |

---

## ✅ Verificação

Após a instalação, verifique se tudo está funcionando:

```bash
# 1. Verifica se as skills estão instaladas
test -d ~/.agent/skills && echo "✅ Skills OK" || echo "❌ Skills não encontradas"

# 2. Verifica se o projeto tem workflows
test -f .agent/workflows/consult-skills.md && echo "✅ Workflows OK" || echo "❌ Workflows não encontrados"

# 3. Lista as skills instaladas
ls ~/.agent/skills/skills/ | head -10
```

### Testando no Kiro

Abra o Kiro e teste:

```
"Use @brainstorming para planejar uma feature de pagamentos"
```

O Kiro deve reconhecer a skill e usá-la automaticamente.

---

## 📂 Estrutura de Pastas

### Pastas do Projeto

```
.agent/
├── workflows/
│   └── consult-skills.md    # Workflow que instrui o Kiro a consultar skills
├── setup/
│   ├── SETUP_GUIDE.md       # Este guia
│   └── install-skills.sh    # Script de instalação automática
└── README.md                # Documentação da estrutura .agent

.kiro/
├── steering/                # Regras e contexto específico do projeto
├── hooks/                   # Automações baseadas em eventos
└── settings/                # Configurações locais (MCP, etc)
```

### Skills Globais

```
~/.agent/skills/
├── skills/
│   ├── architecture/        # Skills de arquitetura
│   ├── development/         # Skills de desenvolvimento
│   ├── security/            # Skills de segurança
│   ├── testing/             # Skills de testes
│   └── ... (868+ skills)
└── README.md
```

---

## 🔄 Atualizando Skills

Para atualizar as skills para a versão mais recente:

```bash
cd ~/.agent/skills
git pull
```

Ou use o script:

```bash
bash .agent/setup/install-skills.sh --update
```

---

## 🆘 Troubleshooting

### Skills não são reconhecidas

1. Verifique se estão instaladas: `ls ~/.agent/skills/skills/`
2. Reinicie o Kiro
3. Tente reinstalar: `npx antigravity-awesome-skills`

### Workflow não está funcionando

1. Verifique se o arquivo existe: `cat .agent/workflows/consult-skills.md`
2. O Kiro lê automaticamente arquivos em `.agent/workflows/`

### Erro no Windows (symlinks)

```bash
# Clone com suporte a symlinks
git clone -c core.symlinks=true https://github.com/sickn33/antigravity-awesome-skills.git ~/.agent/skills
```

---

## 📚 Próximos Passos

1. ✅ Leia [.agent/README.md](.agent/README.md) para entender workflows
2. ✅ Leia [.kiro/README.md](.kiro/README.md) para entender hooks e steering
3. ✅ Explore as skills: `ls ~/.agent/skills/skills/`
4. ✅ Teste algumas skills no Kiro

---

## 🤝 Contribuindo

Se você adicionar novos workflows ou configurações úteis:

1. Adicione em `.agent/workflows/`
2. Documente em `.agent/README.md`
3. Commit e push para o repositório

---

**Última atualização:** Fevereiro 2026

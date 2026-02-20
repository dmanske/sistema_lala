# 🚀 Guia de Setup - Passo a Passo

Este guia detalha como configurar o Kiro em um novo computador com todas as configurações deste projeto.

## 📋 Checklist Rápido

- [ ] Node.js instalado (v18+)
- [ ] Git instalado
- [ ] Kiro IDE instalado
- [ ] Projeto clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Skills globais instaladas
- [ ] Verificação concluída

---

## 1️⃣ Instalação do Kiro IDE

### Download

Acesse: [https://kiro.ai](https://kiro.ai) e baixe a versão para seu sistema operacional.

### Instalação

- **macOS:** Abra o `.dmg` e arraste para Applications
- **Windows:** Execute o instalador `.exe`
- **Linux:** Siga as instruções específicas da distribuição

### Primeiro Acesso

1. Abra o Kiro
2. Complete o setup inicial
3. Configure sua API key (se necessário)

---

## 2️⃣ Clonando o Projeto

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd <nome-do-projeto>

# Instale as dependências do projeto
npm install

# Copie o arquivo de ambiente (se necessário)
cp .env.example .env.local
```

---

## 3️⃣ Instalando Skills Globais

### O que são Skills?

Skills são "superpoderes" para o Kiro. São 868+ arquivos markdown que ensinam o Kiro a executar tarefas específicas com excelência.

### Instalação Automática

```bash
# Execute o script de instalação
bash .agent/setup/install-skills.sh
```

### Instalação Manual

```bash
# Instala em ~/.agent/skills
npx antigravity-awesome-skills

# Verifica a instalação
test -d ~/.agent/skills && echo "✅ Skills instaladas!" || echo "❌ Erro na instalação"
```

### Verificando Skills Instaladas

```bash
# Lista as primeiras 20 skills
ls ~/.agent/skills/skills/ | head -20

# Conta total de skills
ls ~/.agent/skills/skills/ | wc -l
```

---

## 4️⃣ Configurando MCP Servers

### O que é MCP?

Model Context Protocol (MCP) permite adicionar ferramentas externas ao Kiro, como acesso a bancos de dados, APIs, documentação, etc.

### Como Configurar MCP no Kiro

**⚠️ REGRA IMPORTANTE:** O MCP no Kiro se configura de forma simples, trocando apenas o necessário.

### Tipos de Configuração

#### 1. Servidores com Comando (uvx)

Para servidores que precisam ser executados localmente:

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

#### 2. Servidores com URL (como Supabase)

Para servidores remotos que expõem uma URL HTTP:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Nota:** Servidores HTTP precisam do campo `"type": "http"`.

### Configuração deste Projeto

Este projeto usa o MCP do Supabase. O arquivo já está configurado em `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=zmrogojugnsiuwemuwrg",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**⚠️ IMPORTANTE - Configuração por Projeto:**

Cada projeto tem seu próprio `project_ref` na URL do MCP. Para configurar em outro projeto:
1. Pegue o `project_ref` da URL do Supabase (antes de `.supabase.co`)
2. Substitua na URL do MCP: `?project_ref=SEU_PROJECT_REF`
3. Não há risco de misturar dados entre projetos

### Instalando `uv` (para servidores com comando)

Se você for usar servidores MCP que precisam de `uvx`, instale o `uv`:

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Verificando MCP

1. Abra o Kiro
2. Vá em Command Palette (Cmd/Ctrl + Shift + P)
3. Digite "MCP"
4. Selecione "MCP: Show Servers"
5. Verifique se o servidor Supabase está ativo

---

## 5️⃣ Entendendo a Estrutura

### Pastas Importantes

```
📁 Projeto/
├── .agent/              # ✅ Versionado no Git
│   ├── workflows/       # Workflows compartilhados
│   └── setup/          # Scripts de instalação
│
├── .kiro/              # ⚠️ Parcialmente versionado
│   ├── steering/       # Regras do projeto
│   ├── hooks/          # Automações
│   └── settings/       # Configurações locais
│
└── ~/.agent/           # ❌ Não versionado (global)
    └── skills/         # 868+ skills instaladas
```

### Diferenças

| Pasta | Escopo | Git | Descrição |
|-------|--------|-----|-----------|
| `.agent/` | Projeto | ✅ | Workflows e configs compartilhadas |
| `.kiro/` | Workspace | ⚠️ | Steering, hooks, specs |
| `~/.agent/` | Global | ❌ | Skills globais do usuário |
| `~/.kiro/` | Global | ❌ | Settings globais do Kiro |

---

## 5️⃣ Configurações do Projeto

### Workflows

O projeto já vem com workflows configurados em `.agent/workflows/`:

#### `consult-skills.md`

Instrui o Kiro a sempre consultar skills antes de iniciar tarefas.

**Como funciona:**
1. Você pede algo ao Kiro
2. Kiro lê o workflow
3. Busca skills relevantes
4. Aplica as melhores práticas

### Steering (Regras do Projeto)

Steering files em `.kiro/steering/` contêm regras e contexto específico do projeto.

**Exemplo:**
- Padrões de código
- Convenções de nomenclatura
- Estrutura de pastas
- Bibliotecas preferidas

### Hooks (Automações)

Hooks em `.kiro/hooks/` automatizam tarefas baseadas em eventos:

- `fileEdited` → Roda linter ao salvar
- `promptSubmit` → Valida antes de executar
- `preToolUse` → Verifica permissões

---

## 6️⃣ Testando a Instalação

### Teste 1: Skills Instaladas

```bash
# Deve mostrar "✅ Skills OK"
test -d ~/.agent/skills && echo "✅ Skills OK" || echo "❌ Skills não encontradas"
```

### Teste 2: Workflows Ativos

```bash
# Deve mostrar "✅ Workflows OK"
test -f .agent/workflows/consult-skills.md && echo "✅ Workflows OK" || echo "❌ Workflows não encontrados"
```

### Teste 3: Usando Skills no Kiro

Abra o Kiro e teste:

```
"Use @brainstorming para planejar uma feature de autenticação"
```

O Kiro deve:
1. Reconhecer a skill `@brainstorming`
2. Aplicar o framework de brainstorming
3. Gerar um plano estruturado

---

## 7️⃣ Próximos Passos

### Explore as Skills

```bash
# Lista skills de React
ls ~/.agent/skills/skills/ | grep -i react

# Lista skills de segurança
ls ~/.agent/skills/skills/ | grep -i security

# Lista skills de testes
ls ~/.agent/skills/skills/ | grep -i test
```

### Leia a Documentação

1. [.agent/README.md](../README.md) - Workflows e skills
2. [docs/KIRO_SETUP.md](../../docs/KIRO_SETUP.md) - Setup completo
3. [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) - Catálogo de skills

### Configure seu Ambiente

1. Ajuste `.env.local` com suas variáveis
2. Configure MCP servers (se necessário)
3. Personalize hooks e steering

---

## 🆘 Troubleshooting

### Erro: "npx antigravity-awesome-skills" retorna 404

Use o fallback do GitHub:

```bash
npx github:sickn33/antigravity-awesome-skills
```

### Erro: Skills não são reconhecidas no Kiro

1. Verifique a instalação: `ls ~/.agent/skills/skills/`
2. Reinicie o Kiro completamente
3. Tente reinstalar: `npx antigravity-awesome-skills`

### Erro: Workflows não estão funcionando

1. Verifique o arquivo: `cat .agent/workflows/consult-skills.md`
2. Certifique-se que está na raiz do projeto
3. Reinicie o Kiro

### Windows: Erro com Symlinks

```bash
# Clone com suporte a symlinks (execute como Administrador)
git clone -c core.symlinks=true https://github.com/sickn33/antigravity-awesome-skills.git ~/.agent/skills
```

Ou ative o Developer Mode no Windows.

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

## ✅ Checklist Final

Antes de começar a trabalhar, verifique:

- [ ] Kiro abre sem erros
- [ ] Projeto carrega corretamente
- [ ] `npm install` executado com sucesso
- [ ] Skills instaladas em `~/.agent/skills/`
- [ ] Workflows em `.agent/workflows/` presentes
- [ ] Teste com `@brainstorming` funciona
- [ ] `.env.local` configurado (se necessário)

---

**Pronto! Agora você está configurado para trabalhar com o Kiro neste projeto.** 🎉

---

**Última atualização:** Fevereiro 2026

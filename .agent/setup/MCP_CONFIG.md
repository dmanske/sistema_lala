# 🔌 Configuração de MCP (Model Context Protocol)

## O que é MCP?

Model Context Protocol (MCP) permite adicionar ferramentas externas ao Kiro, expandindo suas capacidades com:
- Acesso a bancos de dados (Supabase, PostgreSQL, etc.)
- APIs externas (AWS, GitHub, etc.)
- Documentação (AWS Docs, MDN, etc.)
- Ferramentas customizadas

---

## ⚠️ REGRA IMPORTANTE

**O MCP no Kiro se configura de forma simples, trocando apenas o necessário.**

Não precisa de instalação complexa, apenas configurar o JSON corretamente.

---

## 📍 Localizações dos Arquivos

### 1. Configuração Global (todos os projetos)
```
~/.kiro/settings/mcp.json
```
Use para servidores que você quer em TODOS os projetos.

### 2. Configuração do Workspace (apenas este projeto)
```
.kiro/settings/mcp.json
```
Use para servidores específicos deste projeto (como Supabase).

---

## 🎯 Tipos de Configuração

### Tipo 1: Servidores com Comando (uvx)

Para servidores que rodam localmente via Python/Node:

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Requer:** Instalação do `uv` (veja seção abaixo)

### Tipo 2: Servidores com URL

Para servidores remotos que expõem uma URL HTTP:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Não requer:** Nenhuma instalação adicional

---

## 🚀 Configuração deste Projeto

Este projeto usa o MCP do Supabase para acesso direto ao banco de dados.

### ⚠️ IMPORTANTE: Configuração por Projeto

**Cada projeto tem seu próprio banco de dados!**

O MCP usa o `project_ref` diretamente na URL. Para cada projeto, você precisa trocar o `project_ref` na configuração do MCP.

### Arquivo: `.kiro/settings/mcp.json`

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

**Nota:** O campo `"type": "http"` é obrigatório para servidores HTTP.

### Como Extrair o Project Ref

Da URL do Supabase no `.env.local`, pegue a parte antes de `.supabase.co`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zmrogojugnsiuwemuwrg.supabase.co
                                ^^^^^^^^^^^^^^^^^^^^
                                Este é o project_ref
```

### O que isso faz?

- Conecta o Kiro ao banco Supabase específico do projeto
- Cada projeto usa seu próprio `project_ref`
- Não há risco de misturar dados entre projetos
- Permite queries diretas ao banco
- Facilita debug e análise de dados

### Autenticação

Quando você abrir o Kiro pela primeira vez com o MCP configurado, ele vai pedir para você fazer login no Supabase. Escolha a organização que contém o projeto.

---

## 🛠️ Instalando `uv` (apenas para servidores com comando)

Se você for usar servidores MCP que precisam de `uvx`, instale o `uv`:

### macOS / Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows

```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Verificar Instalação

```bash
uv --version
uvx --version
```

---

## 📝 Exemplos de Configuração

### Exemplo 1: Múltiplos Servidores

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=zmrogojugnsiuwemuwrg",
      "disabled": false,
      "autoApprove": []
    },
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "disabled": false,
      "autoApprove": []
    },
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Nota:** Servidores HTTP usam `"type": "http"`, servidores com comando usam `"command"` e `"args"`.

### Exemplo 2: Desabilitando Temporariamente

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=zmrogojugnsiuwemuwrg",
      "disabled": true,  // ← Desabilitado
      "autoApprove": []
    }
  }
}
```

### Exemplo 3: Auto-Aprovação de Ferramentas

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=zmrogojugnsiuwemuwrg",
      "disabled": false,
      "autoApprove": [
        "list_tables",     // ← Aprova automaticamente
        "execute_sql"
      ]
    }
  }
}
```

**⚠️ Cuidado:** Só aprove automaticamente ferramentas de leitura. Ferramentas de escrita devem ser revisadas manualmente.

---

## ✅ Verificando a Configuração

### 1. Via Command Palette

1. Abra o Kiro
2. Pressione `Cmd/Ctrl + Shift + P`
3. Digite "MCP"
4. Selecione "MCP: Show Servers"
5. Verifique se o servidor está ativo

### 2. Via Arquivo

```bash
# Verificar se o arquivo existe
cat .kiro/settings/mcp.json

# Verificar sintaxe JSON
cat .kiro/settings/mcp.json | python -m json.tool
```

### 3. Via Kiro Chat

No chat do Kiro, pergunte:
```
"Liste os servidores MCP disponíveis"
```

---

## 🔄 Reconectando Servidores

Se você fizer alterações no `mcp.json`:

### Opção 1: Reconexão Automática
O Kiro detecta mudanças e reconecta automaticamente.

### Opção 2: Reconexão Manual
1. Command Palette (`Cmd/Ctrl + Shift + P`)
2. Digite "MCP: Reconnect Servers"
3. Selecione o servidor

### Opção 3: Reiniciar Kiro
Feche e abra o Kiro novamente.

---

## 🆘 Troubleshooting

### ❌ Servidor não aparece

**Causa:** Erro de sintaxe no JSON

**Solução:**
```bash
# Valide o JSON
cat .kiro/settings/mcp.json | python -m json.tool
```

### ❌ Erro "uvx not found"

**Causa:** `uv` não está instalado

**Solução:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### ❌ Servidor com status "Error"

**Causa:** URL inválida ou servidor offline

**Solução:**
1. Verifique a URL no navegador
2. Confirme que o `project_ref` está correto
3. Verifique logs no Kiro (View → Output → MCP)

### ❌ Ferramentas não aparecem

**Causa:** Servidor desabilitado ou não conectado

**Solução:**
1. Verifique `"disabled": false`
2. Reconecte o servidor
3. Reinicie o Kiro

---

## 📚 Servidores MCP Populares

### Bancos de Dados
- **Supabase:** `https://mcp.supabase.com/mcp?project_ref=...`
- **PostgreSQL:** `uvx mcp-server-postgres`
- **SQLite:** `uvx mcp-server-sqlite`

### Documentação
- **AWS Docs:** `uvx awslabs.aws-documentation-mcp-server@latest`
- **MDN:** `uvx mcp-server-mdn`

### Desenvolvimento
- **GitHub:** `uvx mcp-server-github`
- **Git:** `uvx mcp-server-git`
- **Filesystem:** `uvx mcp-server-filesystem`

### Utilitários
- **Fetch (HTTP):** `uvx mcp-server-fetch`
- **Time:** `uvx mcp-server-time`
- **Memory:** `uvx mcp-server-memory`

---

## 🔐 Segurança

### Boas Práticas

1. **Use o project_ref correto para cada projeto**
   ```json
   // ✅ CORRETO - Project ref específico
   {
     "type": "http",
     "url": "https://mcp.supabase.com/mcp?project_ref=zmrogojugnsiuwemuwrg"
   }
   
   // ❌ ERRADO - Sem project_ref (acessa TODOS os projetos)
   {
     "type": "http",
     "url": "https://mcp.supabase.com/mcp"
   }
   ```

2. **Use modo read-only por padrão**
   ```json
   {
     "type": "http",
     "url": "https://mcp.supabase.com/mcp?project_ref=zmrogojugnsiuwemuwrg&read_only=true"
   }
   ```
   Isso previne operações de escrita acidentais.

3. **Não commite tokens no Git**
   ```json
   // ❌ ERRADO
   "env": {
     "API_KEY": "sk-1234567890"
   }
   
   // ✅ CORRETO
   "env": {
     "API_KEY": "${API_KEY}"  // Lê de variável de ambiente
   }
   ```

4. **Use .env.example para documentar**
   ```env
   # .env.example
   GITHUB_TOKEN=seu_token_aqui
   ```

5. **Adicione .env.local ao .gitignore**
   ```gitignore
   # Não versionar
   .env.local
   .env*.local
   ```

6. **Revise autoApprove**
   - Só aprove automaticamente ferramentas seguras de leitura
   - Ferramentas de escrita devem ser revisadas manualmente

---

## 📋 Configuração por Projeto

### Como Funciona

Cada projeto tem seu próprio `project_ref` na URL do MCP:

```
Projeto A/
└── .kiro/settings/mcp.json # project_ref=abc123

Projeto B/
└── .kiro/settings/mcp.json # project_ref=xyz789
```

Quando você abre o Projeto A, o Kiro conecta ao banco `abc123`.
Quando você abre o Projeto B, o Kiro conecta ao banco `xyz789`.

### Como Configurar em Novo Projeto

1. Pegue o `project_ref` da URL do Supabase:
   ```
   https://abc123.supabase.co
           ^^^^^^ <- Este é o project_ref
   ```

2. Crie `.kiro/settings/mcp.json`:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "type": "http",
         "url": "https://mcp.supabase.com/mcp?project_ref=abc123",
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

3. Abra o Kiro e faça login no Supabase quando solicitado

### Vantagens

- ✅ Não mistura dados entre projetos
- ✅ Cada projeto tem suas próprias credenciais
- ✅ Fácil de configurar em PC novo
- ✅ Seguro (não commita credenciais)

---

## 📖 Recursos

- [Documentação oficial do MCP](https://modelcontextprotocol.io/)
- [Lista de servidores MCP](https://github.com/modelcontextprotocol/servers)
- [Kiro MCP Guide](https://docs.kiro.ai/mcp)

---

**Última atualização:** Fevereiro 2026

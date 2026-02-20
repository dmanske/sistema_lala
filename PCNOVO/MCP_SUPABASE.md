# 🔌 MCP do Supabase - Configuração

## O que é?

MCP (Model Context Protocol) conecta o Kiro diretamente ao banco de dados Supabase, permitindo:
- Queries diretas ao banco
- Debug facilitado
- Análise de dados
- Inspeção de tabelas

---

## ⚠️ REGRA IMPORTANTE

**O MCP no Kiro se configura de forma simples, trocando apenas o necessário.**

Para servidores com URL (como Supabase), basta configurar o JSON:

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

---

## 📍 Configuração deste Projeto

### ⚠️ IMPORTANTE: Cada Projeto = Seu Próprio Banco

**O MCP usa o `project_ref` diretamente na URL!**

Isso significa que quando você abre um projeto diferente, precisa configurar o MCP com o `project_ref` correto daquele projeto. Não há risco de misturar dados.

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

```
https://zmrogojugnsiuwemuwrg.supabase.co
        ^^^^^^^^^^^^^^^^^^^^
        Este é o project_ref
```

### O que isso faz?

- Conecta ao banco Supabase do projeto
- Permite queries SQL diretas
- Facilita debug de dados
- Usa RLS (Row Level Security) do Supabase

---

## ✅ Verificando

### 1. Via Command Palette

1. Abra o Kiro
2. `Cmd/Ctrl + Shift + P`
3. Digite "MCP"
4. Selecione "MCP: Show Servers"
5. Verifique se "supabase" está ativo

### 2. Via Arquivo

```bash
cat .kiro/settings/mcp.json
```

### 3. Via Chat

No Kiro, pergunte:
```
"Liste os servidores MCP disponíveis"
```

---

## 🔄 Reconectando

Se fizer alterações no arquivo:

1. Command Palette (`Cmd/Ctrl + Shift + P`)
2. "MCP: Reconnect Servers"
3. Selecione "supabase"

Ou simplesmente reinicie o Kiro.

---

## 🆘 Troubleshooting

### ❌ Servidor não aparece

Valide o JSON:
```bash
cat .kiro/settings/mcp.json | python -m json.tool
```

### ❌ Status "Error"

1. Verifique a URL no navegador
2. Confirme o `project_ref`
3. Veja logs: View → Output → MCP

---

## 📚 Mais Informações

Para configuração avançada de MCP, veja:
- [.agent/setup/MCP_CONFIG.md](../.agent/setup/MCP_CONFIG.md)
- [.agent/setup/global-config.md](../.agent/setup/global-config.md)

---

**Última atualização:** Fevereiro 2026

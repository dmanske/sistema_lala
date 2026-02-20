# 🌍 Configurações Globais do Kiro

Este documento lista todas as configurações globais necessárias para replicar o ambiente de desenvolvimento em outro computador.

## 📋 Checklist de Configurações Globais

### 1. Skills Globais

**Localização:** `~/.agent/skills/`

**Instalação:**
```bash
npx antigravity-awesome-skills
```

**Verificação:**
```bash
test -d ~/.agent/skills && echo "✅ Skills instaladas" || echo "❌ Skills não encontradas"
```

**Descrição:** Biblioteca com 868+ skills que ensinam o Kiro a executar tarefas específicas.

---

### 2. MCP Servers

**Localização:** 
- Global: `~/.kiro/settings/mcp.json`
- Workspace: `.kiro/settings/mcp.json`

**Descrição:** Model Context Protocol servers adicionam ferramentas externas ao Kiro.

**⚠️ IMPORTANTE - Como Configurar MCP no Kiro:**

O MCP no Kiro se configura de forma simples, trocando apenas o necessário:

1. **Servidores com comando (uvx):**
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

2. **Servidores com URL (como Supabase):**
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

**Configuração do Projeto:**

Este projeto usa o MCP do Supabase. A configuração está em `.kiro/settings/mcp.json`:

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

**⚠️ IMPORTANTE:** Cada projeto tem seu próprio `project_ref` na URL. Quando você abre um projeto diferente, troque o `project_ref` na URL para conectar ao banco correto daquele projeto.

**Instalação de `uv` (necessário para MCP com comando):**
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

### 3. Workflows Globais (Opcional)

**Localização:** `~/.agent/workflows/`

**Descrição:** Workflows que se aplicam a todos os projetos.

**Exemplo:**
```markdown
---
description: Sempre use TypeScript strict mode
---

# TypeScript Strict Mode

Sempre configure `strict: true` no tsconfig.json
```

---

### 4. Steering Global (Opcional)

**Localização:** `~/.kiro/steering/`

**Descrição:** Regras que se aplicam a todos os projetos.

**Exemplo:**
```markdown
---
inclusion: always
---

# Padrões Pessoais

- Sempre use ESLint
- Sempre use Prettier
- Commits em inglês
```

---

## 🔄 Backup e Restauração

### Fazer Backup

```bash
# Cria pasta de backup
mkdir -p ~/kiro-backup

# Backup das skills
cp -r ~/.agent/skills ~/kiro-backup/

# Backup das configurações
cp -r ~/.kiro ~/kiro-backup/

# Backup dos workflows
cp -r ~/.agent/workflows ~/kiro-backup/ 2>/dev/null || echo "Sem workflows globais"

echo "✅ Backup concluído em ~/kiro-backup"
```

### Restaurar Backup

```bash
# Restaura skills
cp -r ~/kiro-backup/skills ~/.agent/

# Restaura configurações
cp -r ~/kiro-backup/.kiro ~/

# Restaura workflows
cp -r ~/kiro-backup/workflows ~/.agent/ 2>/dev/null || echo "Sem workflows para restaurar"

echo "✅ Backup restaurado"
```

---

## 📦 Exportar Configurações

Para facilitar a migração, você pode criar um script de exportação:

```bash
#!/bin/bash
# export-kiro-config.sh

EXPORT_DIR="kiro-config-export"
mkdir -p "$EXPORT_DIR"

# Exporta skills
if [ -d ~/.agent/skills ]; then
    echo "Exportando skills..."
    cp -r ~/.agent/skills "$EXPORT_DIR/"
fi

# Exporta MCP config
if [ -f ~/.kiro/settings/mcp.json ]; then
    echo "Exportando MCP config..."
    mkdir -p "$EXPORT_DIR/.kiro/settings"
    cp ~/.kiro/settings/mcp.json "$EXPORT_DIR/.kiro/settings/"
fi

# Exporta workflows globais
if [ -d ~/.agent/workflows ]; then
    echo "Exportando workflows..."
    cp -r ~/.agent/workflows "$EXPORT_DIR/"
fi

# Exporta steering global
if [ -d ~/.kiro/steering ]; then
    echo "Exportando steering..."
    mkdir -p "$EXPORT_DIR/.kiro"
    cp -r ~/.kiro/steering "$EXPORT_DIR/.kiro/"
fi

# Cria arquivo de instruções
cat > "$EXPORT_DIR/INSTALL.md" << 'EOF'
# Instalação das Configurações

## 1. Instalar Skills
```bash
cp -r skills ~/.agent/
```

## 2. Instalar MCP Config (se existir)
```bash
mkdir -p ~/.kiro/settings
cp .kiro/settings/mcp.json ~/.kiro/settings/
```

## 3. Instalar Workflows (se existir)
```bash
cp -r workflows ~/.agent/
```

## 4. Instalar Steering (se existir)
```bash
mkdir -p ~/.kiro
cp -r .kiro/steering ~/.kiro/
```

## 5. Reiniciar o Kiro
EOF

echo "✅ Configurações exportadas para: $EXPORT_DIR"
echo "📦 Compacte esta pasta e copie para o novo computador"
```

---

## 🚀 Setup em Novo Computador

### Passo a Passo

1. **Instalar Kiro IDE**
   ```bash
   # Baixe de https://kiro.ai
   ```

2. **Instalar Skills**
   ```bash
   npx antigravity-awesome-skills
   ```

3. **Clonar Projeto**
   ```bash
   git clone <seu-repositorio>
   cd <projeto>
   npm install
   ```

4. **Restaurar Configurações Globais (se tiver backup)**
   ```bash
   # Descompacte o backup
   cd kiro-config-export
   bash INSTALL.md
   ```

5. **Verificar**
   ```bash
   # Skills
   ls ~/.agent/skills/skills/ | head -10
   
   # MCP
   cat ~/.kiro/settings/mcp.json
   ```

---

## 📝 Notas Importantes

### O que é Versionado no Git

✅ **Versionado (vai no repositório):**
- `.agent/workflows/` - Workflows do projeto
- `.agent/setup/` - Scripts de instalação
- `.kiro/steering/` - Regras do projeto
- `.kiro/hooks/` - Automações do projeto

❌ **NÃO versionado (local):**
- `~/.agent/skills/` - Skills globais
- `~/.kiro/settings/` - Configurações pessoais
- `.kiro/settings/` - MCP servers locais
- `.kiro/specs/` - Specs em andamento

### Sincronização entre Computadores

Para manter múltiplos computadores sincronizados:

1. **Skills:** Rode `cd ~/.agent/skills && git pull` periodicamente
2. **Projeto:** `git pull` normalmente
3. **Configs globais:** Use o script de backup/restauração

---

## 🆘 Troubleshooting

### Skills não aparecem no novo computador

```bash
# Reinstale
npx antigravity-awesome-skills

# Verifique
ls ~/.agent/skills/skills/
```

### MCP servers não funcionam

```bash
# Verifique se uv está instalado
uv --version

# Reinstale se necessário
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Workflows não são aplicados

```bash
# Verifique se estão no lugar certo
ls .agent/workflows/

# Reinicie o Kiro
```

---

**Última atualização:** Fevereiro 2026

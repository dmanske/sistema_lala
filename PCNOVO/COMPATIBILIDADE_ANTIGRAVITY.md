# 🔄 Compatibilidade com Antigravity

## ✅ Totalmente Compatível

Este projeto funciona perfeitamente com:
- ✅ **Kiro** (Kiro AI)
- ✅ **Antigravity** (Google)
- ✅ **Claude Code** (Anthropic CLI)
- ✅ **Cursor**
- ✅ **Gemini CLI**

**Todos compartilham as mesmas 864+ skills!**

---

## 🎯 Como Funciona

### Skills Compartilhadas

Todos os IDEs usam a mesma pasta de skills:

```
~/.agent/skills/  → 864+ skills globais
```

Quando você instala as skills com:

```bash
npx antigravity-awesome-skills
```

Elas ficam disponíveis para **todos** os IDEs automaticamente!

---

## 📁 Diferenças de Estrutura

### Kiro

```
.kiro/
├── hooks/          # Automações
├── steering/       # Regras do projeto
├── specs/          # Especificações
└── settings/       # Configurações locais
```

### Antigravity

```
.antigravity/
├── hooks/          # Automações
├── steering/       # Regras do projeto
├── specs/          # Especificações
└── settings/       # Configurações locais
```

**Nota:** A estrutura é idêntica, apenas o nome da pasta muda!

---

## 🔄 Migração Kiro ↔ Antigravity

### De Kiro para Antigravity

```bash
# Copie as configurações
cp -r .kiro/ .antigravity/

# Pronto! Antigravity vai usar as mesmas regras
```

### De Antigravity para Kiro

```bash
# Copie as configurações
cp -r .antigravity/ .kiro/

# Pronto! Kiro vai usar as mesmas regras
```

---

## 🎨 Usando Skills

### Sintaxe Universal

A sintaxe é **idêntica** em todos os IDEs:

```
"Use @nome-da-skill para fazer algo"
```

### Exemplos

#### No Kiro

```
"Use @brainstorming para planejar uma feature"
```

#### No Antigravity

```
"Use @brainstorming para planejar uma feature"
```

#### No Claude Code

```
"Use @brainstorming para planejar uma feature"
```

**Funciona igual em todos!** 🎉

---

## 🗄️ Regra do Banco de Dados

**IMPORTANTE:** A regra do banco de dados funciona em **todos** os IDEs:

```
✅ SEMPRE use o banco do projeto atual
❌ NUNCA misture dados entre projetos
```

Esta regra está configurada em:
- **Kiro:** `.kiro/steering/regras-projeto.md`
- **Antigravity:** `.antigravity/steering/regras-projeto.md`

---

## 🚀 Setup Automático

O script `PCNOVO/setup-completo.sh` detecta automaticamente qual IDE você está usando:

```bash
bash PCNOVO/setup-completo.sh
```

O script:
1. ✅ Detecta se é Kiro, Antigravity, Claude Code, etc
2. ✅ Configura as pastas corretas
3. ✅ Instala skills globais (compartilhadas)
4. ✅ Cria regras do projeto
5. ✅ Verifica tudo

---

## 📊 Comparação

| Aspecto | Kiro | Antigravity | Claude Code | Cursor |
|---------|------|-------------|-------------|--------|
| **Skills** | ✅ ~/.agent/skills/ | ✅ ~/.agent/skills/ | ✅ ~/.agent/skills/ | ✅ ~/.agent/skills/ |
| **Sintaxe** | @skill-name | @skill-name | @skill-name | @skill-name |
| **Workflows** | ✅ .agent/workflows/ | ✅ .agent/workflows/ | ✅ .agent/workflows/ | ✅ .agent/workflows/ |
| **Hooks** | .kiro/hooks/ | .antigravity/hooks/ | .claude/hooks/ | .cursor/hooks/ |
| **Steering** | .kiro/steering/ | .antigravity/steering/ | .claude/steering/ | .cursor/steering/ |

---

## 🎯 Recomendações

### Para Usar Múltiplos IDEs

Se você usa Kiro E Antigravity no mesmo projeto:

1. **Mantenha ambas as pastas:**
   ```
   .kiro/
   .antigravity/
   ```

2. **Sincronize as regras:**
   ```bash
   # Quando atualizar regras no Kiro
   cp .kiro/steering/regras-projeto.md .antigravity/steering/
   
   # Quando atualizar regras no Antigravity
   cp .antigravity/steering/regras-projeto.md .kiro/steering/
   ```

3. **Skills são compartilhadas automaticamente:**
   - Não precisa instalar duas vezes
   - Ambos usam `~/.agent/skills/`

---

## ✅ Checklist de Compatibilidade

- [ ] Skills instaladas em `~/.agent/skills/`
- [ ] Workflows em `.agent/workflows/`
- [ ] Regras do projeto configuradas
- [ ] Banco de dados isolado por projeto
- [ ] .env.local configurado

---

## 🆘 Problemas Comuns

### Skills não funcionam no Antigravity

```bash
# Verifique se estão instaladas
ls ~/.agent/skills/

# Reinstale se necessário
npx antigravity-awesome-skills

# Reinicie o Antigravity
```

### Regras não são aplicadas

```bash
# Verifique se o arquivo existe
cat .antigravity/steering/regras-projeto.md

# Crie se não existir
mkdir -p .antigravity/steering
cp .kiro/steering/regras-projeto.md .antigravity/steering/
```

---

## 📚 Documentação

- [COMO_USAR.md](COMO_USAR.md) - Guia de uso
- [REGRAS_PROJETO.md](REGRAS_PROJETO.md) - Regras importantes
- [README.md](README.md) - Setup rápido

---

**Última atualização:** Fevereiro 2026

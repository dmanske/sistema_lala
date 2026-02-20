# 🎯 Como Usar - Guia Completo

## ⚡ Início Rápido

### Para Kiro

```
"Use @brainstorming para planejar uma feature de notificações"
```

### Para Antigravity

```
"Use @brainstorming para planejar uma feature de notificações"
```

**Funciona igual!** Ambos usam as mesmas 864+ skills.

---

## 🗄️ REGRA CRÍTICA: Banco de Dados

### ⚠️ IMPORTANTE

**O banco de dados é SEMPRE do projeto atual!**

```
✅ CORRETO:
- Usar banco configurado em .env.local DESTE projeto
- Acessar apenas dados deste projeto
- Manter isolamento entre projetos

❌ ERRADO:
- Acessar banco de outros projetos
- Misturar dados entre projetos
- Usar credenciais de outro .env.local
```

### Como Verificar

Antes de qualquer operação de banco, confirme:

1. **Arquivo correto:** `.env.local` deste projeto
2. **Variáveis corretas:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Isolamento:** Dados não se misturam com outros projetos

---

## 🎨 Como Usar Skills

### Sintaxe Universal (Kiro, Antigravity, Claude Code, Cursor)

```
"Use @nome-da-skill para fazer algo"
```

### Exemplos Práticos

#### 💻 Desenvolvimento

```
"Use @react-patterns para criar um componente de modal"
"Use @typescript-expert para melhorar este código"
"Use @nextjs-best-practices para otimizar esta página"
```

#### 🔒 Segurança

```
"Use @api-security para revisar esta rota"
"Use @sql-injection-testing para testar este endpoint"
```

#### 🏗️ Arquitetura

```
"Use @brainstorming para planejar uma feature de pagamentos"
"Use @system-design para arquitetar este módulo"
```

#### 🧪 Testes

```
"Use @test-driven-development para criar testes"
"Use @playwright para testar esta interface"
```

---

## 🔄 Como Funciona (Automático)

```
Você: "Crie um componente de tabela"
   ↓
Hook/Workflow dispara automaticamente
   ↓
AI busca skills relevantes
   ↓
AI lê a skill
   ↓
AI aplica melhores práticas
   ↓
✅ Componente criado com qualidade profissional
```

---

## 🎯 Diferenças: Kiro vs Antigravity

### Semelhanças

- ✅ Usam as mesmas 864+ skills
- ✅ Mesma sintaxe: `@nome-da-skill`
- ✅ Mesmos workflows
- ✅ Mesma qualidade de código

### Diferenças

| Aspecto | Kiro | Antigravity |
|---------|------|-------------|
| **Empresa** | Kiro AI | Google |
| **Pasta config** | `.kiro/` | `.antigravity/` |
| **Hooks** | `.kiro/hooks/` | `.antigravity/hooks/` |
| **Steering** | `.kiro/steering/` | `.antigravity/steering/` |

**Importante:** As skills em `~/.agent/skills/` são compartilhadas entre todos!

---

## 📚 Skills Disponíveis (864+)

### Por Categoria

| Categoria | Exemplos | Quantidade |
|-----------|----------|------------|
| 🏗️ Architecture | system-design, c4-diagrams | 50+ |
| 💻 Development | react, typescript, python | 200+ |
| 🔒 Security | api-security, vulnerability-scanner | 100+ |
| ☁️ Infrastructure | docker, kubernetes, aws | 80+ |
| 🧪 Testing | tdd, playwright, testing-patterns | 70+ |
| 📊 Data & AI | rag-engineer, prompt-engineer | 60+ |
| 📝 General | brainstorming, documentation | 40+ |

### Buscar Skills

```bash
# Listar todas
ls ~/.agent/skills/

# Buscar por tema
ls ~/.agent/skills/ | grep -i react
ls ~/.agent/skills/ | grep -i security
```

---

## 🔧 Comandos Úteis

### Verificar Instalação

```bash
# Skills instaladas?
ls ~/.agent/skills/ | head -10

# Quantas skills?
ls ~/.agent/skills/ | wc -l

# Regras do projeto?
cat .kiro/steering/regras-projeto.md
```

### Atualizar

```bash
# Atualizar skills
cd ~/.agent/skills && git pull

# Atualizar projeto
git pull && npm install
```

---

## 🆘 Problemas Comuns

### Skills não funcionam

```bash
# Reinstale
npx antigravity-awesome-skills

# Verifique
ls ~/.agent/skills/

# Reinicie o IDE
```

### Banco de dados errado

```bash
# Verifique o .env.local
cat .env.local | grep SUPABASE

# Confirme que é deste projeto
```

### Dependências com erro

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Documentação Completa

- [REGRAS_PROJETO.md](REGRAS_PROJETO.md) - Regras importantes
- [docs/KIRO_SETUP.md](../docs/KIRO_SETUP.md) - Setup técnico
- [.agent/README.md](../.agent/README.md) - Workflows

---

**Última atualização:** Fevereiro 2026

# 🎯 Como Usar o Kiro - Guia Visual

## ⚡ Setup Rápido (PC Novo)

```bash
# 1. Clone o projeto
git clone <seu-repo>
cd <projeto>

# 2. Execute o setup (FAZ TUDO AUTOMATICAMENTE)
bash .agent/setup/setup-new-pc.sh

# 3. Abra no Kiro
kiro .
```

**Pronto!** Tudo configurado em 3-5 minutos.

---

## 🎨 Como Usar Skills

### Sintaxe

```
"Use @nome-da-skill para fazer algo"
```

### Exemplos Práticos

#### 💻 Desenvolvimento

```
"Use @react-patterns para criar um componente de modal"
"Use @typescript-expert para melhorar este código"
"Use @nextjs-best-practices para otimizar esta página"
"Use @python-patterns para refatorar esta função"
```

#### 🔒 Segurança

```
"Use @api-security para revisar esta rota"
"Use @sql-injection-testing para testar este endpoint"
"Use @vulnerability-scanner para auditar o código"
```

#### 🏗️ Arquitetura

```
"Use @brainstorming para planejar uma feature de pagamentos"
"Use @system-design para arquitetar este módulo"
"Use @c4-diagrams para documentar a arquitetura"
```

#### 🧪 Testes

```
"Use @test-driven-development para criar testes"
"Use @playwright para testar esta interface"
"Use @testing-patterns para melhorar a cobertura"
```

---

## 🔄 Como Funciona (Automático)

```
┌─────────────────────────────────────────────────────────┐
│  Você: "Crie um componente de tabela"                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Hook dispara automaticamente                           │
│  (você não precisa fazer nada)                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Kiro busca skills relevantes                           │
│  ls ~/.agent/skills/ | grep -i "react\|component"       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Kiro lê a skill                                        │
│  cat ~/.agent/skills/react-patterns/SKILL.md            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Kiro aplica melhores práticas                          │
│  - Padrões de React                                     │
│  - TypeScript correto                                   │
│  - Acessibilidade                                       │
│  - Performance                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ✅ Componente criado com qualidade profissional        │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Skills Disponíveis (864+)

### Por Categoria

| Categoria | Exemplos | Quantidade |
|-----------|----------|------------|
| 🏗️ **Architecture** | system-design, c4-diagrams, ADRs | 50+ |
| 💻 **Development** | react, typescript, python, nextjs | 200+ |
| 🔒 **Security** | api-security, vulnerability-scanner | 100+ |
| ☁️ **Infrastructure** | docker, kubernetes, aws, vercel | 80+ |
| 🧪 **Testing** | tdd, playwright, testing-patterns | 70+ |
| 📊 **Data & AI** | rag-engineer, prompt-engineer | 60+ |
| 📝 **General** | brainstorming, documentation | 40+ |

### Buscar Skills

```bash
# Listar todas
ls ~/.agent/skills/

# Buscar por tema
ls ~/.agent/skills/ | grep -i react
ls ~/.agent/skills/ | grep -i security
ls ~/.agent/skills/ | grep -i test
```

---

## 🎯 Casos de Uso Comuns

### 1. Criar Componente React

```
"Use @react-patterns para criar um componente de formulário de login"
```

**O que o Kiro faz:**
- ✅ Usa TypeScript
- ✅ Aplica padrões de React
- ✅ Adiciona validação
- ✅ Considera acessibilidade
- ✅ Otimiza performance

### 2. Revisar Segurança

```
"Use @api-security para revisar as rotas de autenticação"
```

**O que o Kiro faz:**
- ✅ Verifica vulnerabilidades
- ✅ Checa validação de input
- ✅ Analisa autenticação
- ✅ Revisa autorização
- ✅ Sugere melhorias

### 3. Planejar Feature

```
"Use @brainstorming para planejar um sistema de notificações"
```

**O que o Kiro faz:**
- ✅ Faz perguntas estratégicas
- ✅ Valida requisitos
- ✅ Identifica edge cases
- ✅ Sugere arquitetura
- ✅ Cria especificação

### 4. Criar Testes

```
"Use @test-driven-development para criar testes do componente X"
```

**O que o Kiro faz:**
- ✅ Cria testes unitários
- ✅ Adiciona testes de integração
- ✅ Considera edge cases
- ✅ Usa melhores práticas
- ✅ Garante cobertura

---

## 💡 Dicas de Uso

### ✅ Faça

- Mencione a skill explicitamente: `@nome-da-skill`
- Seja específico no que quer
- Deixe o Kiro consultar skills automaticamente
- Confie no processo

### ❌ Não Faça

- Não tente fazer tudo manualmente
- Não pule o processo de consulta
- Não ignore sugestões das skills
- Não assuma que o Kiro sabe tudo sem skills

---

## 🔧 Comandos Úteis

### Verificar Instalação

```bash
# Skills instaladas?
ls ~/.agent/skills/ | head -10

# Quantas skills?
ls ~/.agent/skills/ | wc -l

# Workflows ativos?
cat .agent/workflows/consult-skills.md

# Hooks configurados?
cat .kiro/hooks/consult-skills-before-task.json
```

### Atualizar

```bash
# Atualizar skills
cd ~/.agent/skills && git pull

# Atualizar projeto
git pull && npm install
```

### Reinstalar

```bash
# Reinstalar skills
npx antigravity-awesome-skills

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 Problemas Comuns

### Skills não funcionam

```bash
# 1. Verifique se estão instaladas
ls ~/.agent/skills/

# 2. Reinstale
npx antigravity-awesome-skills

# 3. Reinicie o Kiro
```

### Kiro não consulta skills automaticamente

```bash
# 1. Verifique o workflow
cat .agent/workflows/consult-skills.md

# 2. Verifique o hook
cat .kiro/hooks/consult-skills-before-task.json

# 3. Reinicie o Kiro
```

### Dependências com erro

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Documentação Completa

- [SETUP_PC_NOVO.md](SETUP_PC_NOVO.md) - Setup rápido
- [.agent/RESUMO_EXECUTIVO.md](.agent/RESUMO_EXECUTIVO.md) - Visão geral
- [.agent/INDICE_DOCUMENTACAO.md](.agent/INDICE_DOCUMENTACAO.md) - Índice completo
- [docs/KIRO_SETUP.md](docs/KIRO_SETUP.md) - Documentação detalhada

---

## 🎉 Benefícios

### Antes (Sem Skills)

```
Você: "Crie um componente React"
Kiro: *cria um componente básico*
```

### Depois (Com Skills)

```
Você: "Use @react-patterns para criar um componente React"
Kiro: *cria um componente profissional com:*
  ✅ TypeScript
  ✅ Padrões de React
  ✅ Validação
  ✅ Acessibilidade
  ✅ Performance
  ✅ Testes
  ✅ Documentação
```

---

## 🚀 Comece Agora

1. **Abra o Kiro**
2. **Teste uma skill:**
   ```
   "Use @brainstorming para planejar uma feature de chat"
   ```
3. **Veja a mágica acontecer!** ✨

---

**Última atualização:** Fevereiro 2026

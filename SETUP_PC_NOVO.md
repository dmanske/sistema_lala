# 🚀 Setup Rápido - PC Novo

## ⚡ Setup Automático (1 comando)

```bash
bash .agent/setup/setup-new-pc.sh
```

Este script faz **TUDO automaticamente**:
- ✅ Verifica Node.js, npm, Git
- ✅ Instala dependências do projeto (`npm install`)
- ✅ Instala 864+ skills globais
- ✅ Configura ambiente (.env.local)
- ✅ Verifica a instalação
- ✅ Mostra próximos passos

**Tempo estimado:** 3-5 minutos

---

## 📋 Passo a Passo Manual

Se preferir fazer manualmente:

### 1. Pré-requisitos

Instale:
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- [Kiro IDE](https://kiro.ai)

### 2. Clone e Instale

```bash
# Clone o projeto
git clone <seu-repositorio>
cd <nome-do-projeto>

# Instale dependências
npm install

# Configure ambiente (se necessário)
cp .env.example .env.local
```

### 3. Instale Skills Globais

```bash
bash .agent/setup/install-skills.sh
```

Ou manualmente:
```bash
npx antigravity-awesome-skills
```

### 4. Abra no Kiro

```bash
kiro .
```

Ou abra o Kiro e selecione a pasta do projeto.

---

## ✅ Verificação

Após o setup, verifique:

```bash
# Skills instaladas?
ls ~/.agent/skills/ | head -10

# Dependências OK?
ls node_modules/ > /dev/null && echo "✅ OK"

# Workflows presentes?
cat .agent/workflows/consult-skills.md
```

---

## 🎯 Testando

No Kiro, teste:

```
"Use @brainstorming para planejar uma feature de notificações"
```

O Kiro deve:
1. Buscar a skill `brainstorming`
2. Ler as instruções
3. Aplicar o framework de brainstorming

---

## 📚 Documentação Completa

- [docs/KIRO_SETUP.md](docs/KIRO_SETUP.md) - Guia completo
- [.agent/README.md](.agent/README.md) - Workflows e skills
- [.kiro/README.md](.kiro/README.md) - Hooks e steering

---

## 🆘 Problemas?

### Skills não instaladas

```bash
npx antigravity-awesome-skills
```

### Dependências com erro

```bash
rm -rf node_modules package-lock.json
npm install
```

### Kiro não reconhece skills

1. Verifique: `ls ~/.agent/skills/`
2. Reinicie o Kiro completamente
3. Reabra o projeto

---

## 🔄 Atualizando Skills

Para atualizar as skills:

```bash
cd ~/.agent/skills
git pull
```

---

**Última atualização:** Fevereiro 2026

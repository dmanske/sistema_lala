---
description: Always consult the skills library before starting any task to find relevant best practices and patterns
---

# ⚡ REGRA OBRIGATÓRIA: Consultar Skills Antes de Qualquer Tarefa

**ATENÇÃO KIRO:** Esta é uma regra OBRIGATÓRIA que você DEVE seguir em TODAS as interações neste projeto.

## 🎯 Regra Principal

Antes de iniciar QUALQUER tarefa (codificação, design, debugging, refatoração, arquitetura, testes, etc), você DEVE:

1. **IDENTIFICAR** o tema/tecnologia da tarefa
2. **BUSCAR** skills relevantes em `~/.agent/skills/`
3. **LER** a skill encontrada
4. **APLICAR** as melhores práticas ao executar a tarefa

**Não pule esta etapa. Não assuma que sabe tudo. Sempre consulte as skills primeiro.**

## 📋 Processo Obrigatório (Siga Sempre)

### Passo 1: Identifique o Tema
Analise a solicitação do usuário e identifique:
- Tecnologia principal (React, TypeScript, Python, etc)
- Tipo de tarefa (componente, API, teste, deploy, etc)
- Área (frontend, backend, segurança, performance, etc)

### Passo 2: Busque Skills Relevantes
```bash
# Exemplo: usuário pediu para criar um componente React
ls ~/.agent/skills/ | grep -i "react"

# Exemplo: usuário pediu para revisar segurança de API
ls ~/.agent/skills/ | grep -i "security\|api"

# Exemplo: usuário pediu para criar testes
ls ~/.agent/skills/ | grep -i "test"
```

### Passo 3: Leia a Skill
```bash
# Leia o SKILL.md da skill encontrada
cat ~/.agent/skills/<nome-da-skill>/SKILL.md
```

### Passo 4: Aplique as Práticas
- Siga as instruções da skill
- Use os padrões recomendados
- Considere scripts auxiliares (se houver)

### Passo 5: Execute a Tarefa
Agora sim, execute a tarefa aplicando o conhecimento da skill.

## Exemplos de Busca

| Tarefa do Usuário | Buscar por |
|---|---|
| Criar componente React | `react`, `component`, `ui-patterns` |
| Configurar API | `api-design`, `api-patterns`, `api-security` |
| Fazer deploy | `deploy`, `vercel`, `docker` |
| Corrigir bug | `debugging`, `troubleshooting` |
| Otimizar performance | `performance`, `optimization` |
| Estilizar interface | `css`, `tailwind`, `ui`, `design` |
| Testes | `testing`, `test`, `jest`, `playwright` |
| Banco de dados | `database`, `supabase`, `postgres`, `sql` |
| Autenticação | `auth`, `security` |
| Next.js | `nextjs`, `next` |

## Notas

- O diretório de skills está em: `~/.agent/skills/`
- Cada skill tem um `SKILL.md` com instruções detalhadas
- Algumas skills têm pastas `scripts/`, `examples/` e `resources/` adicionais
- São 864+ skills cobrindo diversas tecnologias e padrões
- Para atualizar as skills: `cd ~/.agent/skills && git pull`

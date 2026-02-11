---
description: Always consult the skills library before starting any task to find relevant best practices and patterns
---

# Consultar Skills Antes de Qualquer Tarefa

**Regra Global:** Antes de iniciar qualquer tarefa de codificação, design, debugging, deploy ou arquitetura, SEMPRE consulte a biblioteca de skills instalada para encontrar padrões, boas práticas e guias relevantes.

## Passos

1. Identifique o tema/tecnologia da tarefa solicitada pelo usuário (ex: React, Next.js, API, CSS, testes, deploy, segurança, etc.)

2. Procure skills relevantes no diretório `~/.agent/skills/skills/` usando `find_by_name` ou `list_dir`:
   ```
   ls ~/.agent/skills/skills/ | grep -i <tema>
   ```

3. Se encontrar uma skill relevante, leia o arquivo `SKILL.md` dentro da pasta da skill:
   ```
   cat ~/.agent/skills/skills/<nome-da-skill>/SKILL.md
   ```

4. Siga as instruções e boas práticas documentadas na skill ao executar a tarefa.

5. Se existirem scripts auxiliares na skill (pasta `scripts/`), considere utilizá-los.

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

- O diretório de skills está em: `~/.agent/skills/skills/`
- Cada skill tem um `SKILL.md` com instruções detalhadas
- Algumas skills têm pastas `scripts/`, `examples/` e `resources/` adicionais
- São 710+ skills cobrindo diversas tecnologias e padrões
- Para atualizar as skills: `cd ~/.agent/skills && git pull`

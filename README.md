# Sistema Lala - Módulo Clientes (MVP)

Sistema de gestão para salão de beleza, focado em UX premium e arquitetura escalável.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Icons**: Lucide React
- **Validation**: Zod
- **Data Layer**: Repository Pattern (LocalStorage default)

## Getting Started

1.  **Instalar dependências**:
    ```bash
    npm install
    ```

2.  **Rodar servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

3.  Acesse `http://localhost:3000`.

## Funcionalidades (MVP)
- **Sidebar**: Navegação completa com placeholders.
- **Lista de Clientes**: Busca, Filtros, Listagem (Cidade oculta).
- **Cadastro/Edição**: Validação com Zod (Cidade obrigatória).
- **Perfil**: Visualização de dados e crédito (read-only).
- **Regras de Delete**:
    - Bloqueio se houver histórico (`hasHistory` flag).
    - Confirmação via Dialog se permitido.
    - Sugestão de "Inativar" caso bloqueado.

## Arquitetura & Migração para Supabase

O projeto utiliza o padrão **Repository** para desacoplar a UI da fonte de dados.
Atualmente, utilizamos `LocalStorageClientRepository`.

### Para migrar para Supabase:

1.  Crie uma implementação de `ClientRepository` que chame o Supabase client.
    - Arquivo: `src/infrastructure/repositories/SupabaseClientRepository.ts`
2.  Atualize a `ClientService` ou a injeção de dependência para usar o novo repositório.

Exemplo:
```typescript
// src/core/services/ClientFactory.ts (Sugestão para o futuro)
const repo = new SupabaseClientRepository();
const service = new ClientService(repo);
```

### Dados Mockados (Seed)
Ao abrir o sistema pela primeira vez, 3 clientes são criados automaticamente no LocalStorage para testes:
1.  **Ana Silva** (Ativo, Com Histórico) -> Tente deletar para ver o bloqueio.
2.  **Bruno Souza** (Inativo, Sem Histórico) -> Pode deletar.
3.  **Carla Dias** (Atenção, Com Histórico) -> Bloqueado.

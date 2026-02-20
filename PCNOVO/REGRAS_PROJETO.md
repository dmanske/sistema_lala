# 📋 Regras Importantes do Projeto

## 🗄️ REGRA CRÍTICA: Banco de Dados

### ⚠️ SEMPRE Use o Banco do Projeto Atual

**NUNCA misture dados entre projetos!**

```
✅ CORRETO:
- Usar banco configurado em .env.local DESTE projeto
- Acessar apenas dados deste projeto
- Manter isolamento total entre projetos

❌ ERRADO:
- Acessar banco de outros projetos
- Misturar dados entre projetos
- Usar credenciais de outro .env.local
- Compartilhar dados entre projetos diferentes
```

### Como Verificar

Antes de qualquer operação de banco:

1. **Confirme o arquivo:** `.env.local` deste projeto
2. **Verifique as variáveis:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Confirme isolamento:** Dados não se misturam

### Exemplo de Verificação

```bash
# Veja as credenciais do projeto atual
cat .env.local | grep SUPABASE

# Confirme que são deste projeto
```

---

## 📁 Estrutura do Projeto

### Tecnologias

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Validation:** Zod
- **Database:** Supabase (ou LocalStorage para testes)
- **Auth:** Supabase Auth

### Pastas Principais

```
src/
├── app/              # Páginas (App Router)
├── components/       # Componentes React
├── core/            # Lógica de negócio
├── infrastructure/  # Repositórios, APIs
└── lib/             # Utilitários
```

---

## 🎯 Padrões de Código

### TypeScript

- ✅ Use TypeScript sempre
- ✅ Defina tipos explícitos
- ✅ Evite `any`
- ✅ Use interfaces para objetos

### Componentes

- ✅ Componentes em `src/components/`
- ✅ Um componente por arquivo
- ✅ Use PascalCase para nomes
- ✅ Props tipadas com TypeScript

### Validação

- ✅ Use Zod para validação
- ✅ Valide todos os inputs do usuário
- ✅ Sanitize dados antes de salvar

---

## 🔒 Segurança

### Variáveis de Ambiente

- ❌ NUNCA commite `.env.local`
- ✅ Use `.env.example` como template
- ✅ Documente variáveis necessárias

### Dados do Usuário

- ✅ Valide todos os inputs
- ✅ Sanitize dados
- ✅ Use prepared statements
- ✅ Evite SQL injection

---

## 📝 Commits

### Formato

```
tipo: descrição curta

Descrição detalhada (opcional)
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Exemplos

```
feat: adiciona autenticação com Supabase
fix: corrige validação do formulário de cliente
docs: atualiza README com instruções de setup
```

---

## 🎨 UI/UX

### Responsividade

- ✅ Mobile-first
- ✅ Breakpoints: 360px, 768px, 1024px
- ✅ Touch-friendly (44px mínimo)

### Acessibilidade

- ✅ Labels em todos os inputs
- ✅ Alt text em imagens
- ✅ Contraste adequado
- ✅ Navegação por teclado

---

## 🧪 Testes

### Quando Testar

- ✅ Lógica de negócio crítica
- ✅ Validações importantes
- ✅ Fluxos principais

### Não Testar Automaticamente

- ❌ Não crie testes sem ser solicitado
- ❌ Usuário decide quando testar

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório
2. Configure variáveis de ambiente
3. Deploy automático

### Variáveis Necessárias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Última atualização:** Fevereiro 2026

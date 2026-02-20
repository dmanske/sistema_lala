# 🎯 Fluxo com GitHub Desktop + Kiro

## 📋 Seu Fluxo de Trabalho

Este guia é específico para quem usa **GitHub Desktop** para clonar e **Kiro** para desenvolver.

---

## 🔄 Passo a Passo Completo

### 1️⃣ Clone pelo GitHub Desktop

```
1. Abra o GitHub Desktop
2. File > Clone Repository (Ctrl+Shift+O)
3. Selecione o repositório na lista
   OU
   Cole a URL do repositório
4. Escolha a pasta de destino
   Exemplo: C:\Users\SeuNome\Projetos\sistema_lala
5. Clique em "Clone"
6. Aguarde o download
```

**Tempo:** 1-2 minutos

---

### 2️⃣ Abra o Terminal na Pasta

#### Windows

```
1. Abra o Explorador de Arquivos
2. Navegue até a pasta do projeto
3. Clique na barra de endereço
4. Digite "cmd" e pressione Enter
   OU
5. Shift + Botão Direito > "Abrir janela do PowerShell aqui"
```

#### macOS

```
1. Abra o Finder
2. Navegue até a pasta do projeto
3. Botão direito na pasta
4. Services > New Terminal at Folder
   OU
5. Arraste a pasta para o Terminal
```

---

### 3️⃣ Execute o Setup

No terminal que você acabou de abrir:

```bash
bash PCNOVO/setup-completo.sh
```

**O que acontece:**
- ✅ Verifica Node.js, npm, Git
- ✅ Instala dependências (`npm install`)
- ✅ Instala 864+ skills globais
- ✅ Configura .env.local
- ✅ Cria regras do projeto
- ✅ Verifica tudo

**Tempo:** 3-5 minutos

---

### 4️⃣ Configure .env.local

```
1. Abra o arquivo .env.local
   (foi criado automaticamente pelo script)

2. Adicione suas credenciais do Supabase:
   NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-key-aqui

3. Salve o arquivo
```

---

### 5️⃣ Abra no Kiro

```
1. Abra o Kiro
2. File > Open Folder (Ctrl+K Ctrl+O)
3. Navegue até a pasta do projeto
4. Selecione a pasta
5. Clique em "Abrir"
```

**Pronto!** O Kiro vai carregar o projeto com todas as configurações.

---

### 6️⃣ Teste

No Kiro, digite:

```
"Use @brainstorming para planejar uma feature de notificações"
```

**O que deve acontecer:**
1. Hook dispara automaticamente
2. Kiro busca a skill `brainstorming`
3. Kiro lê as instruções
4. Kiro aplica o framework de brainstorming
5. ✅ Funciona!

---

## 🎨 Fluxo Visual

```
┌─────────────────────────────────────────────────────────────┐
│  1. GitHub Desktop                                          │
│     Clone Repository                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Terminal                                                │
│     bash PCNOVO/setup-completo.sh                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Editor de Texto                                         │
│     Configure .env.local                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Kiro                                                    │
│     File > Open Folder                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Teste                                                   │
│     "Use @brainstorming..."                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ PRONTO PARA TRABALHAR!                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Dicas

### Atalhos do GitHub Desktop

- `Ctrl+Shift+O` - Clone Repository
- `Ctrl+Shift+F` - Fetch
- `Ctrl+Shift+P` - Push
- `Ctrl+Enter` - Commit

### Atalhos do Kiro

- `Ctrl+K Ctrl+O` - Open Folder
- `Ctrl+`` - Toggle Terminal
- `Ctrl+Shift+P` - Command Palette

### Abrir Terminal Rápido

**Windows:**
- Na pasta do projeto, digite `cmd` na barra de endereço

**macOS:**
- Arraste a pasta para o ícone do Terminal no Dock

---

## 🔄 Atualizações Futuras

### Quando Houver Mudanças no Repositório

```
1. GitHub Desktop
   - Fetch origin (Ctrl+Shift+F)
   - Pull origin (Ctrl+Shift+P)

2. Terminal
   - npm install (se houver mudanças no package.json)

3. Kiro
   - Recarregue a janela (Ctrl+R)
```

### Quando Quiser Atualizar Skills

```bash
cd ~/.agent/skills
git pull
```

---

## 🆘 Problemas Comuns

### "bash: command not found"

**Windows:**
- Use PowerShell em vez de CMD
- Ou instale Git Bash

**macOS:**
- Bash já vem instalado, verifique se está no terminal correto

### "npm: command not found"

- Instale Node.js: https://nodejs.org/
- Reinicie o terminal após instalar

### "Permission denied"

**Windows:**
- Execute o PowerShell como Administrador

**macOS/Linux:**
```bash
chmod +x PCNOVO/setup-completo.sh
bash PCNOVO/setup-completo.sh
```

### Kiro não abre a pasta

- Verifique se selecionou a pasta raiz do projeto
- Não selecione subpastas como `src/` ou `PCNOVO/`

---

## ✅ Checklist Rápido

- [ ] Clonei pelo GitHub Desktop
- [ ] Abri terminal na pasta do projeto
- [ ] Executei `bash PCNOVO/setup-completo.sh`
- [ ] Configurei .env.local
- [ ] Abri a pasta no Kiro (File > Open Folder)
- [ ] Testei com `@brainstorming`
- [ ] Funcionou! ✅

---

## 📚 Próximos Passos

Após o setup:

1. [COMO_USAR.md](COMO_USAR.md) - Guia de uso completo
2. [REGRAS_PROJETO.md](REGRAS_PROJETO.md) - Regras importantes
3. Comece a desenvolver!

---

**Última atualização:** Fevereiro 2026

**Criado especialmente para o fluxo: GitHub Desktop → Terminal → Kiro**

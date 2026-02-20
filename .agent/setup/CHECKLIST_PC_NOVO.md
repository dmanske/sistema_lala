# ✅ Checklist - Setup PC Novo

Use este checklist para configurar o projeto em um novo computador.

---

## 📋 Pré-Instalação

- [ ] **Node.js instalado** (v18+)
  - Verificar: `node -v`
  - Download: https://nodejs.org/

- [ ] **npm instalado**
  - Verificar: `npm -v`
  - (Vem com Node.js)

- [ ] **Git instalado**
  - Verificar: `git --version`
  - Download: https://git-scm.com/

- [ ] **Kiro IDE instalado**
  - Download: https://kiro.ai

---

## 🚀 Setup Automático

- [ ] **Clone o repositório**
  ```bash
  git clone <seu-repositorio>
  cd <nome-do-projeto>
  ```

- [ ] **Execute o script de setup**
  ```bash
  bash .agent/setup/setup-new-pc.sh
  ```

- [ ] **Aguarde a instalação** (3-5 minutos)

---

## ✅ Verificação

- [ ] **Skills instaladas**
  ```bash
  ls ~/.agent/skills/ | head -10
  ```
  Deve mostrar: `3d-web-experience`, `ab-test-setup`, etc.

- [ ] **Dependências instaladas**
  ```bash
  ls node_modules/ > /dev/null && echo "✅ OK"
  ```

- [ ] **Workflows presentes**
  ```bash
  cat .agent/workflows/consult-skills.md
  ```

- [ ] **Hooks configurados**
  ```bash
  cat .kiro/hooks/consult-skills-before-task.json
  ```

- [ ] **Ambiente configurado**
  ```bash
  test -f .env.local && echo "✅ OK" || echo "⚠️  Configure .env.local"
  ```

---

## 🧪 Teste no Kiro

- [ ] **Abrir o Kiro**
  ```bash
  kiro .
  ```
  Ou abra manualmente e selecione a pasta do projeto

- [ ] **Testar skill**
  No Kiro, digite:
  ```
  "Use @brainstorming para planejar uma feature de notificações"
  ```

- [ ] **Verificar resposta**
  O Kiro deve:
  - Buscar a skill `brainstorming`
  - Ler as instruções
  - Aplicar o framework

---

## 📊 Estrutura Esperada

Após o setup, você deve ter:

```
📁 Projeto/
├── .agent/
│   ├── workflows/
│   │   └── consult-skills.md       ✅
│   ├── setup/
│   │   ├── setup-new-pc.sh         ✅
│   │   └── install-skills.sh       ✅
│   └── README.md                    ✅
│
├── .kiro/
│   ├── hooks/
│   │   └── consult-skills-before-task.json  ✅
│   └── README.md                    ✅
│
├── node_modules/                    ✅
├── .env.local                       ✅
└── package.json                     ✅

📁 ~/.agent/
└── skills/                          ✅
    ├── brainstorming/
    ├── react-patterns/
    ├── api-security/
    └── ... (864+ skills)
```

---

## 🎯 Configurações Adicionais (Opcional)

- [ ] **Configurar .env.local**
  - Adicione suas API keys
  - Configure variáveis de ambiente

- [ ] **Verificar MCP Servers**
  - Arquivo: `.kiro/settings/mcp.json`
  - Deve conter configuração do Supabase
  ```bash
  cat .kiro/settings/mcp.json
  ```

- [ ] **Configurar MCP Global** (opcional)
  - Arquivo: `~/.kiro/settings/mcp.json`
  - Para servidores que você usa em todos os projetos

- [ ] **Personalizar Steering** (se necessário)
  - Adicione regras em `.kiro/steering/`

---

## 🆘 Troubleshooting

### ❌ Skills não instaladas

```bash
npx antigravity-awesome-skills
```

### ❌ Dependências com erro

```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Kiro não reconhece skills

1. Verifique: `ls ~/.agent/skills/`
2. Reinicie o Kiro completamente
3. Reabra o projeto

### ❌ Hook não dispara

1. Verifique: `cat .kiro/hooks/consult-skills-before-task.json`
2. Reinicie o Kiro
3. Envie uma nova mensagem

---

## 📚 Documentação

- [ ] **Ler documentação principal**
  - [SETUP_PC_NOVO.md](../../../SETUP_PC_NOVO.md)
  - [docs/KIRO_SETUP.md](../../../docs/KIRO_SETUP.md)

- [ ] **Entender estrutura**
  - [.agent/README.md](../../README.md)
  - [.kiro/README.md](../../../.kiro/README.md)

---

## 🎉 Pronto!

Se todos os itens estão marcados, você está pronto para trabalhar!

**Próximos passos:**
1. Abra o Kiro
2. Comece a desenvolver
3. O Kiro vai automaticamente consultar skills quando necessário

---

**Tempo total estimado:** 5-10 minutos

**Última atualização:** Fevereiro 2026

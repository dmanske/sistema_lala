# ⚡ Quick Start - 1 Minuto

## 🎯 Setup em 1 Comando

```bash
bash .agent/setup/setup-new-pc.sh
```

**Pronto!** Tudo configurado automaticamente.

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│  1. Clone o Projeto                                     │
│     git clone <repo> && cd <projeto>                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. Execute o Setup                                     │
│     bash .agent/setup/setup-new-pc.sh                   │
│                                                         │
│     Isso instala:                                       │
│     ✅ Dependências (npm install)                       │
│     ✅ 864+ Skills globais                              │
│     ✅ Configura ambiente                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Abra no Kiro                                        │
│     kiro .                                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. Teste                                               │
│     "Use @brainstorming para planejar uma feature"      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ✅ Pronto para trabalhar!                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 O que é Instalado

| Item | Localização | Descrição |
|------|-------------|-----------|
| **Skills** | `~/.agent/skills/` | 864+ skills globais |
| **Workflows** | `.agent/workflows/` | Instruções automáticas |
| **Hooks** | `.kiro/hooks/` | Automações |
| **Dependências** | `node_modules/` | Libs do projeto |

---

## 🎯 Como Funciona

### Antes (Sem Skills)

```
Você: "Crie um componente React"
   ↓
Kiro: *cria do jeito dele*
```

### Depois (Com Skills)

```
Você: "Crie um componente React"
   ↓
Hook dispara automaticamente
   ↓
Kiro busca: ls ~/.agent/skills/ | grep -i react
   ↓
Kiro lê: cat ~/.agent/skills/react-patterns/SKILL.md
   ↓
Kiro aplica: Melhores práticas de React
   ↓
Kiro cria: Componente seguindo padrões profissionais
```

---

## 🧪 Teste Rápido

No Kiro, teste qualquer um destes:

```
"Use @brainstorming para planejar uma feature de pagamentos"
"Use @react-patterns para criar um componente de modal"
"Use @api-security para revisar esta rota"
"Use @typescript-expert para melhorar este código"
```

---

## 🆘 Problemas?

### Skills não funcionam

```bash
# Reinstale
npx antigravity-awesome-skills

# Verifique
ls ~/.agent/skills/ | head -10

# Reinicie o Kiro
```

### Dependências com erro

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Mais Informações

- [Checklist Completo](CHECKLIST_PC_NOVO.md)
- [Setup Detalhado](SETUP_GUIDE.md)
- [Documentação Kiro](../../docs/KIRO_SETUP.md)

---

**Tempo total:** 3-5 minutos

**Última atualização:** Fevereiro 2026

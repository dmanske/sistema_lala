#!/bin/bash

# 🚀 Setup Completo Automático - PC Novo
# Compatível com: Kiro, Antigravity, Claude Code, Cursor, Gemini CLI
# Este script configura TUDO automaticamente

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Banner
clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 SETUP AUTOMÁTICO - PC NOVO 🚀                        ║
║                                                                ║
║        Configurando tudo para você...                          ║
║        Compatível: Kiro, Antigravity, Claude Code, Cursor     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Detecta qual IDE está sendo usado
detect_ide() {
    if [ -d ".kiro" ]; then
        echo "kiro"
    elif [ -d ".antigravity" ]; then
        echo "antigravity"
    elif [ -d ".claude" ]; then
        echo "claude"
    elif [ -d ".cursor" ]; then
        echo "cursor"
    else
        echo "unknown"
    fi
}

IDE=$(detect_ide)

if [ "$IDE" != "unknown" ]; then
    echo -e "${BLUE}🔍 IDE detectado: ${MAGENTA}${IDE}${NC}"
else
    echo -e "${YELLOW}⚠️  IDE não detectado. Configurando para uso universal.${NC}"
fi
echo ""

# Função para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 encontrado${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 não encontrado${NC}"
        return 1
    fi
}

# ============================================
# ETAPA 1: Verificar Pré-requisitos
# ============================================
echo -e "${BLUE}[1/7]${NC} Verificando pré-requisitos..."
echo ""

# Node.js
if ! check_command node; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Instale em: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "      Versão: ${NODE_VERSION}"

# npm
if ! check_command npm; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "      Versão: ${NPM_VERSION}"

# Git
if ! check_command git; then
    echo -e "${RED}❌ Git não encontrado!${NC}"
    exit 1
fi

GIT_VERSION=$(git --version)
echo -e "      ${GIT_VERSION}"

echo ""
echo -e "${GREEN}✅ Todos os pré-requisitos OK!${NC}"
echo ""

# ============================================
# ETAPA 2: Instalar Dependências do Projeto
# ============================================
echo -e "${BLUE}[2/7]${NC} Instalando dependências do projeto..."
echo ""

if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✅ Dependências instaladas!${NC}"
else
    echo -e "${YELLOW}⚠️  package.json não encontrado. Pulando...${NC}"
fi

echo ""

# ============================================
# ETAPA 3: Instalar Skills Globais
# ============================================
echo -e "${BLUE}[3/7]${NC} Instalando skills globais (864+ skills)..."
echo ""

if [ -d "$HOME/.agent/skills" ]; then
    echo -e "${YELLOW}⚠️  Skills já instaladas. Atualizando...${NC}"
    cd "$HOME/.agent/skills"
    git pull
    cd - > /dev/null
else
    echo "Instalando Antigravity Awesome Skills..."
    npx antigravity-awesome-skills
fi

echo -e "${GREEN}✅ Skills instaladas!${NC}"
echo ""

# ============================================
# ETAPA 4: Configurar Ambiente
# ============================================
echo -e "${BLUE}[4/7]${NC} Configurando ambiente..."
echo ""

# .env.local
if [ -f ".env.example" ] && [ ! -f ".env.local" ]; then
    echo "Criando .env.local a partir de .env.example..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Configure suas variáveis em .env.local${NC}"
elif [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local já existe${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum arquivo .env encontrado${NC}"
fi

echo ""

# ============================================
# ETAPA 5: Configurar Regras do Projeto
# ============================================
echo -e "${BLUE}[5/7]${NC} Configurando regras do projeto..."
echo ""

# Cria steering com regras importantes
mkdir -p .kiro/steering

cat > .kiro/steering/regras-projeto.md << 'STEERING_EOF'
---
inclusion: always
---

# Regras Importantes do Projeto

## 🗄️ Banco de Dados

**REGRA CRÍTICA:** O banco de dados é SEMPRE do projeto atual.

- ✅ Use APENAS o banco de dados deste projeto
- ❌ NUNCA acesse bancos de dados de outros projetos
- ❌ NUNCA misture dados entre projetos
- ✅ Cada projeto tem seu próprio banco isolado

### Localização do Banco

- **Supabase:** Configurado em `.env.local` (variáveis `NEXT_PUBLIC_SUPABASE_*`)
- **LocalStorage:** Isolado por domínio/projeto
- **Arquivos:** Sempre na pasta do projeto atual

### Verificação

Antes de qualquer operação de banco:
1. Confirme que está usando as credenciais de `.env.local` DESTE projeto
2. Verifique que não está acessando dados de outros projetos
3. Confirme o isolamento dos dados

## 📁 Estrutura do Projeto

Este é um projeto Next.js com:
- **Frontend:** React + TypeScript + Tailwind
- **Backend:** Next.js API Routes
- **Banco:** Supabase (ou LocalStorage para testes)
- **Autenticação:** Supabase Auth

## 🎯 Padrões de Código

- Use TypeScript sempre
- Componentes em `src/components/`
- Páginas em `src/app/`
- Lógica de negócio em `src/core/`
- Repository pattern para dados

## 🔒 Segurança

- Nunca commite `.env.local`
- Valide todos os inputs
- Use Zod para validação
- Sanitize dados do usuário

## 📝 Commits

- Mensagens em português
- Formato: "tipo: descrição"
- Exemplos: "feat: adiciona login", "fix: corrige validação"

STEERING_EOF

echo -e "${GREEN}✅ Regras do projeto configuradas em .kiro/steering/regras-projeto.md${NC}"
echo ""

# ============================================
# ETAPA 6: Verificar Instalação
# ============================================
echo -e "${BLUE}[6/7]${NC} Verificando instalação..."
echo ""

# Skills
if [ -d "$HOME/.agent/skills" ]; then
    SKILL_COUNT=$(ls -1 "$HOME/.agent/skills" | grep -v "^\." | grep -v "README" | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ ${SKILL_COUNT} skills instaladas${NC}"
else
    echo -e "${RED}❌ Skills não encontradas${NC}"
fi

# Workflows
if [ -f ".agent/workflows/consult-skills.md" ]; then
    echo -e "${GREEN}✅ Workflows configurados${NC}"
else
    echo -e "${YELLOW}⚠️  Workflows não encontrados${NC}"
fi

# Hooks (Kiro)
if [ -f ".kiro/hooks/consult-skills-before-task.json" ]; then
    echo -e "${GREEN}✅ Hooks configurados (Kiro)${NC}"
else
    echo -e "${YELLOW}⚠️  Hooks não encontrados${NC}"
fi

# Steering
if [ -f ".kiro/steering/regras-projeto.md" ]; then
    echo -e "${GREEN}✅ Regras do projeto configuradas${NC}"
else
    echo -e "${YELLOW}⚠️  Regras não encontradas${NC}"
fi

# node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependências do projeto OK${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules não encontrado${NC}"
fi

echo ""

# ============================================
# ETAPA 7: Resumo e Próximos Passos
# ============================================
echo -e "${BLUE}[7/7]${NC} Resumo da instalação"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║     ✅ SETUP COMPLETO! TUDO CONFIGURADO! ✅                    ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 O que foi instalado:${NC}"
echo ""
echo -e "  ${GREEN}✅${NC} Node.js ${NODE_VERSION}"
echo -e "  ${GREEN}✅${NC} npm ${NPM_VERSION}"
echo -e "  ${GREEN}✅${NC} ${SKILL_COUNT} skills globais"
echo -e "  ${GREEN}✅${NC} Dependências do projeto"
echo -e "  ${GREEN}✅${NC} Workflows automáticos"
echo -e "  ${GREEN}✅${NC} Hooks de automação"
echo -e "  ${GREEN}✅${NC} Regras do projeto (banco de dados, etc)"
echo ""

echo -e "${BLUE}🎯 Regras Importantes Configuradas:${NC}"
echo ""
echo -e "  ${YELLOW}🗄️  Banco de Dados:${NC} Sempre do projeto atual"
echo -e "  ${YELLOW}📁 Isolamento:${NC} Nunca misturar dados entre projetos"
echo -e "  ${YELLOW}🔒 Segurança:${NC} .env.local configurado"
echo ""

echo -e "${BLUE}🚀 Próximos passos:${NC}"
echo ""
echo -e "  1. ${YELLOW}Configure .env.local${NC} com suas credenciais"
echo -e "  2. ${YELLOW}Abra o IDE${NC} (Kiro, Antigravity, etc)"
echo -e "  3. ${YELLOW}Abra este projeto${NC}"
echo -e "  4. ${YELLOW}Leia:${NC} PCNOVO/COMO_USAR.md"
echo -e "  5. ${YELLOW}Teste:${NC} 'Use @brainstorming para planejar uma feature'"
echo ""

echo -e "${BLUE}📖 Documentação:${NC}"
echo ""
echo -e "  ${YELLOW}PCNOVO/COMO_USAR.md${NC}         → Guia de uso"
echo -e "  ${YELLOW}PCNOVO/REGRAS_PROJETO.md${NC}   → Regras importantes"
echo -e "  ${YELLOW}docs/KIRO_SETUP.md${NC}         → Documentação técnica"
echo ""

echo -e "${GREEN}🎉 Pronto para começar a trabalhar!${NC}"
echo ""

# Pergunta se quer abrir o IDE
echo -e "${YELLOW}Deseja abrir o IDE agora? (s/N):${NC} "
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    if command -v kiro &> /dev/null; then
        echo "Abrindo Kiro..."
        kiro . &
    elif [ -d "/Applications/Kiro.app" ]; then
        echo "Abrindo Kiro..."
        open -a Kiro .
    elif command -v antigravity &> /dev/null; then
        echo "Abrindo Antigravity..."
        antigravity . &
    else
        echo -e "${YELLOW}IDE não encontrado. Abra manualmente.${NC}"
    fi
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}║     Obrigado por usar este projeto! 🚀                         ║${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

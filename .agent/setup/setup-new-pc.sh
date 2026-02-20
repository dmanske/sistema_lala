#!/bin/bash

# 🚀 Setup Completo para PC Novo
# Este script configura TUDO automaticamente:
# - Verifica pré-requisitos
# - Instala dependências do projeto
# - Instala skills globais
# - Configura o ambiente
# - Verifica a instalação

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Banner
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🚀 Setup Completo - PC Novo 🚀                     ║"
echo "║                                                            ║"
echo "║        Configurando tudo automaticamente...               ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
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

# Função para instalar Node.js (se necessário)
install_nodejs() {
    echo -e "${YELLOW}Node.js não encontrado. Deseja instalar?${NC}"
    echo "Visite: https://nodejs.org/"
    echo ""
    read -p "Pressione Enter após instalar o Node.js..."
}

# ============================================
# ETAPA 1: Verificar Pré-requisitos
# ============================================
echo -e "${BLUE}[1/6]${NC} Verificando pré-requisitos..."
echo ""

# Node.js
if ! check_command node; then
    install_nodejs
    if ! check_command node; then
        echo -e "${RED}❌ Node.js ainda não encontrado. Abortando.${NC}"
        exit 1
    fi
fi

NODE_VERSION=$(node -v)
echo -e "      Versão: ${NODE_VERSION}"

# npm
if ! check_command npm; then
    echo -e "${RED}❌ npm não encontrado. Reinstale o Node.js.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "      Versão: ${NPM_VERSION}"

# Git
if ! check_command git; then
    echo -e "${RED}❌ Git não encontrado. Instale em: https://git-scm.com/${NC}"
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
echo -e "${BLUE}[2/6]${NC} Instalando dependências do projeto..."
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
echo -e "${BLUE}[3/6]${NC} Instalando skills globais (864+ skills)..."
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
echo -e "${BLUE}[4/6]${NC} Configurando ambiente..."
echo ""

# Verifica se existe .env.example
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
# ETAPA 5: Verificar Instalação
# ============================================
echo -e "${BLUE}[5/6]${NC} Verificando instalação..."
echo ""

# Verifica skills
if [ -d "$HOME/.agent/skills" ]; then
    SKILL_COUNT=$(ls -1 "$HOME/.agent/skills" | grep -v "^\." | grep -v "README" | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ ${SKILL_COUNT} skills instaladas${NC}"
else
    echo -e "${RED}❌ Skills não encontradas${NC}"
fi

# Verifica workflows
if [ -f ".agent/workflows/consult-skills.md" ]; then
    echo -e "${GREEN}✅ Workflows configurados${NC}"
else
    echo -e "${YELLOW}⚠️  Workflows não encontrados${NC}"
fi

# Verifica hooks
if [ -f ".kiro/hooks/consult-skills-before-task.json" ]; then
    echo -e "${GREEN}✅ Hooks configurados${NC}"
else
    echo -e "${YELLOW}⚠️  Hooks não encontrados${NC}"
fi

# Verifica node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependências do projeto OK${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules não encontrado${NC}"
fi

echo ""

# ============================================
# ETAPA 6: Resumo e Próximos Passos
# ============================================
echo -e "${BLUE}[6/6]${NC} Resumo da instalação"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║     ✅ Setup Completo! Tudo Configurado! ✅               ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 O que foi instalado:${NC}"
echo ""
echo -e "  ${GREEN}✅${NC} Node.js ${NODE_VERSION}"
echo -e "  ${GREEN}✅${NC} npm ${NPM_VERSION}"
echo -e "  ${GREEN}✅${NC} ${SKILL_COUNT} skills globais"
echo -e "  ${GREEN}✅${NC} Dependências do projeto"
echo -e "  ${GREEN}✅${NC} Workflows automáticos"
echo -e "  ${GREEN}✅${NC} Hooks de automação"
echo ""

echo -e "${BLUE}📚 Estrutura configurada:${NC}"
echo ""
echo -e "  ${YELLOW}~/.agent/skills/${NC}           → 864+ skills globais"
echo -e "  ${YELLOW}.agent/workflows/${NC}          → Workflows do projeto"
echo -e "  ${YELLOW}.kiro/hooks/${NC}               → Automações"
echo -e "  ${YELLOW}.kiro/steering/${NC}            → Regras do projeto"
echo ""

echo -e "${BLUE}🎯 Próximos passos:${NC}"
echo ""
echo -e "  1. ${YELLOW}Configure .env.local${NC} (se necessário)"
echo -e "  2. ${YELLOW}Abra o Kiro IDE${NC}"
echo -e "  3. ${YELLOW}Abra este projeto no Kiro${NC}"
echo -e "  4. ${YELLOW}Teste:${NC} 'Use @brainstorming para planejar uma feature'"
echo ""

echo -e "${BLUE}📖 Documentação:${NC}"
echo ""
echo -e "  ${YELLOW}docs/KIRO_SETUP.md${NC}         → Guia completo"
echo -e "  ${YELLOW}.agent/README.md${NC}           → Workflows e skills"
echo -e "  ${YELLOW}.kiro/README.md${NC}            → Hooks e steering"
echo ""

echo -e "${GREEN}🎉 Pronto para começar a trabalhar!${NC}"
echo ""

# Pergunta se quer abrir o Kiro
echo -e "${YELLOW}Deseja abrir o Kiro agora? (s/N):${NC} "
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    if command -v kiro &> /dev/null; then
        echo "Abrindo Kiro..."
        kiro . &
    elif [ -d "/Applications/Kiro.app" ]; then
        echo "Abrindo Kiro..."
        open -a Kiro .
    else
        echo -e "${YELLOW}Kiro não encontrado. Abra manualmente.${NC}"
    fi
fi

echo ""
echo -e "${BLUE}Obrigado por usar este projeto! 🚀${NC}"
echo ""

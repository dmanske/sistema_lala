#!/bin/bash

# 🚀 Script de Instalação das Antigravity Awesome Skills
# Este script instala 868+ skills globais para o Kiro
# Fonte: https://github.com/sickn33/antigravity-awesome-skills

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     🌟 Antigravity Awesome Skills Installer 🌟            ║"
echo "║                                                            ║"
echo "║     868+ Skills para Kiro, Claude Code, Cursor, etc       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Verifica se Node.js está instalado
echo -e "${BLUE}[1/5]${NC} Verificando pré-requisitos..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Por favor, instale Node.js (v18+) antes de continuar."
    echo "Download: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js encontrado: ${NODE_VERSION}${NC}"
echo ""

# Verifica se npx está disponível
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx não encontrado!${NC}"
    echo "npx geralmente vem com Node.js. Tente reinstalar o Node.js."
    exit 1
fi

echo -e "${GREEN}✅ npx encontrado${NC}"
echo ""

# Define o caminho de instalação
SKILLS_PATH="$HOME/.agent/skills"

# Verifica se já existe instalação
if [ -d "$SKILLS_PATH" ]; then
    echo -e "${YELLOW}⚠️  Skills já instaladas em: ${SKILLS_PATH}${NC}"
    echo ""
    read -p "Deseja atualizar? (s/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}[2/5]${NC} Atualizando skills..."
        cd "$SKILLS_PATH"
        git pull
        echo -e "${GREEN}✅ Skills atualizadas!${NC}"
    else
        echo -e "${YELLOW}⏭️  Pulando instalação${NC}"
    fi
else
    # Instala as skills
    echo -e "${BLUE}[2/5]${NC} Instalando skills em: ${SKILLS_PATH}"
    echo "Isso pode levar alguns minutos..."
    echo ""
    
    npx antigravity-awesome-skills
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Skills instaladas com sucesso!${NC}"
    else
        echo -e "${RED}❌ Erro na instalação. Tentando método alternativo...${NC}"
        npx github:sickn33/antigravity-awesome-skills
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Falha na instalação. Tente manualmente:${NC}"
            echo "git clone https://github.com/sickn33/antigravity-awesome-skills.git ~/.agent/skills"
            exit 1
        fi
    fi
fi

echo ""

# Verifica a instalação
echo -e "${BLUE}[3/5]${NC} Verificando instalação..."

if [ -d "$SKILLS_PATH" ]; then
    SKILL_COUNT=$(ls -1 "$SKILLS_PATH" | grep -v "^\." | grep -v "README" | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ ${SKILL_COUNT} skills encontradas!${NC}"
else
    echo -e "${RED}❌ Pasta de skills não encontrada!${NC}"
    exit 1
fi

echo ""

# Mostra exemplos de skills
echo -e "${BLUE}[4/5]${NC} Exemplos de skills instaladas:"
echo ""
ls "$SKILLS_PATH" | grep -v "^\." | grep -v "README" | head -10 | while read skill; do
    echo -e "  ${GREEN}•${NC} $skill"
done
echo -e "  ${YELLOW}... e mais $(($SKILL_COUNT - 10)) skills!${NC}"
echo ""

# Instruções de uso
echo -e "${BLUE}[5/5]${NC} Como usar as skills:"
echo ""
echo -e "${GREEN}No Kiro, simplesmente mencione a skill:${NC}"
echo ""
echo -e '  "Use @brainstorming para planejar uma feature"'
echo -e '  "Use @react-patterns para criar este componente"'
echo -e '  "Use @api-security para revisar esta API"'
echo ""

# Categorias disponíveis
echo -e "${BLUE}📚 Categorias disponíveis:${NC}"
echo ""
echo -e "  ${GREEN}🏗️  Architecture${NC}     - system-design, c4-diagrams, ADRs"
echo -e "  ${GREEN}💻 Development${NC}      - react, typescript, python, nextjs"
echo -e "  ${GREEN}🔒 Security${NC}         - api-security, vulnerability-scanner"
echo -e "  ${GREEN}☁️  Infrastructure${NC}   - docker, kubernetes, aws, vercel"
echo -e "  ${GREEN}🧪 Testing${NC}          - tdd, playwright, testing-patterns"
echo -e "  ${GREEN}📊 Data & AI${NC}        - rag-engineer, prompt-engineer"
echo -e "  ${GREEN}📝 General${NC}          - brainstorming, documentation"
echo ""

# Links úteis
echo -e "${BLUE}🔗 Links úteis:${NC}"
echo ""
echo -e "  Catálogo completo: ${YELLOW}https://github.com/sickn33/antigravity-awesome-skills${NC}"
echo -e "  Documentação: ${YELLOW}docs/KIRO_SETUP.md${NC}"
echo ""

# Finalização
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     ✅ Instalação concluída com sucesso! ✅               ║"
echo "║                                                            ║"
echo "║     Agora o Kiro tem 868+ skills disponíveis! 🚀          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}💡 Dica:${NC} Reinicie o Kiro para garantir que as skills sejam carregadas."
echo ""

# 🚀 Documentação das Landing Pages - Lala System

Este documento descreve as duas novas Landing Pages (LPs) criadas para o ecossistema Lala System, focadas em design moderno, performance e experiência premium (Glassmorphism).

---

## 🎨 Identidade Visual
Ambas as páginas utilizam a identidade visual **"Liquid Glass - Violet/Purple Luxury"** predominante no sistema, com refinamentos específicos para cada público-alvo.

### Temas Utilizados:
- **Vidro Líquido:** Uso de `backdrop-blur`, gradientes suaves e bordas translúcidas.
- **Tipografia:** Foco em hierarquia clara, usando Sans-serif para a App LP e uma combinação de Serif (elegante) + Sans para a Salon LP.
- **Paleta:** Tons de Violeta, Indigo e Branco, com acentos de Esmeralda (financeiro) e Ouro (luxo).

---

## 📱 1. Landing Page do Aplicativo (B2B)
**Rota:** `/lp/app`  
**Objetivo:** Divulgação do sistema para donos de salão.

### Seções Principais:
1.  **Hero Animado:** Título impactante com gradiente, botões de ação com sombras dinâmicas e imagem mock-up do dashboard real.
2.  **Recursos (Features):** Grid interativo com os 4 pilares: Agenda, Financeiro, CRM e Estoque.
3.  **Destaques de Inteligência:** Demonstração visual de métricas (Faturamento, Top Serviços) com elementos de UI flutuantes.
4.  **Prova Social:** Card de depoimento estilizado com efeito de profundidade.
5.  **CTA Final:** Convite direto para criação de conta com destaque em cor sólida.

### Efeitos Específicos:
- `animate-pulse` e `blur` em elementos de fundo para profundidade.
- Transições de hover em todos os cards de recursos.
- Navbar flutuante com efeito Glassmorphism constante.

---

## 💄 2. Landing Page do Salão (B2C)
**Rota:** `/lp/salon`  
**Objetivo:** Atrair e converter clientes finais do salão.

### Seções Principais:
1.  **Hero Imersivo:** Imagem de alta qualidade em tela cheia com efeito de zoom sutil e tipografia boutique (Serif).
2.  **Rituais (Serviços):** Layout assimétrico com imagens que revelam detalhes no hover e botões minimalistas.
3.  **Filosofia & Dados:** Seção de "Sobre" com imagens em perspectiva e contadores de impacto social/profissional.
4.  **Equipe (Artistas):** Cards em tons de cinza que ganham cor no hover, humanizando o atendimento.
5.  **Galeria Infinita:** Fita de imagens com animação de movimento contínuo (CSS keyframes).
6.  **Footer de Luxo:** Informações de contato direto (WhatsApp) integradas ao rodapé escuro.

### Efeitos Específicos:
- Uso de `grayscale` e `sepia` em fotos para um look mais editorial.
- Tipografia em Itálico Serif para passar elegância.
- Seções com fundos alternados (White / Off-white / Slate-900).

---

## 🛠️ Tecnologias e Assets
- **Framework:** Next.js 15 (App Router).
- **Estilização:** Tailwind CSS 4.
- **Ícones:** Lucide React.
- **Imagens:** Geradas via AI e Unsplash para máxima qualidade visual.
- **Assets Locais:**
  - `public/images/app-hero.png`
  - `public/images/salon-hero.png`

---

## 💡 Como Visualizar
Acesse as URLs locais:
- [http://localhost:3000/lp/app](http://localhost:3000/lp/app)
- [http://localhost:3000/lp/salon](http://localhost:3000/lp/salon)

> **Nota:** As páginas são 100% responsivas, testadas para resoluções Mobile, Tablet e Desktop.

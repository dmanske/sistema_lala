# Proposta de Melhorias na Agenda (Calendar)

Análise baseada na implementação atual em `src/app/agenda/page.tsx`.

## 1. Visão Geral Mais Limpa e Compacta (Melhor Visibilidade)

Para atender a necessidade de "ter uma visão melhor geral", sugiro reduzir a altura das linhas e suavizar a grade visual.

### A. Redução da Altura das Linhas (`GRID_HOUR_HEIGHT`)
Atualmente, cada hora ocupa **120px** (`GRID_HOUR_HEIGHT = 120`). Isso significa que para ver o dia todo (5h às 23h), o usuário precisa rolar muito (2160px de altura).
**Sugestão:** Reduzir para **80px** ou **90px** por hora.
- Isso permite visualizar ~50% mais horas na tela sem rolar.
- Ajuste proporcional dos slots de 30 minutos para 40px/45px.

### B. Linhas Mais Finas e Sutis
As linhas atuais usam `border-slate-100` e `border-slate-200`. Para dar a impressão de "linhas mais finas":
**Sugestão:**
- Alterar as linhas de hora cheia para `border-slate-100`.
- Alterar as linhas de meia hora para `border-slate-50` ou `border-slate-100/50` (com opacidade).
- Remover as bordas verticais (`border-r`) entre os dias, ou torná-las visíveis apenas no hover (`group-hover:opacity-100`), mantendo o design mais limpo ("Clean").

## 2. Melhorias na Visualização Mensal

### A. Grade Mais Organizada
O layout mensal atual usa `min-h-[160px]`, o que pode deixar os dias muito altos se houver poucos eventos, ou forçar scroll se houver muitos.
**Sugestão:**
- Reduzir a altura mínima para **100px** ou **120px**.
- Permitir que a célula cresça conforme necessário (`auto-rows-min`), mas limitar o número de eventos visíveis antes de mostrar um botão "+X mais", evitando que uma célula "estoure" o layout.

### B. Estilo dos Dias
- **Dias Vazios:** Reduzir a opacidade ou o destaque dos dias que não são do mês corrente (embora o código atual já trate o deslocamento inicial, os dias finais do mês anterior/início do próximo podem precisar de tratamento visual diferente se implementados).
- **Fim de Semana:** Adicionar um fundo sutil (`bg-slate-50/30`) para diferenciar visualmente Sábado e Domingo.

## 3. Design "Premium" e Detalhes Visuais

### A. Indicador de Hora Atual
Adicionar uma linha horizontal vermelha (fina e com um pequeno ponto na esquerda) indicando o horário atual exato no modo Dia/Semana. Isso ajuda muito na orientação rápida.

### B. Hover Effects (Crosshair)
Melhorar o feedback visual ao passar o mouse sobre um slot:
- Destacar suavemente toda a linha daquela hora e a coluna daquele dia.

### C. Tipografia e Cores
- Usar fontes levemente menores para os horários na lateral (ex: `text-[10px]` para `text-[9px]` ou `font-light`) para reduzir o peso visual.
- Manter os cards de agendamento com as cores vibrantes atuais, mas talvez reduzir a sombra (`shadow-md` para `shadow-sm`) para um look mais "flat" e moderno se desejado, ou aumentar o `backdrop-blur` para o efeito glassmorphism.

---

**Aguardando aprovação para implementar estas mudanças.**
Se aprovado, o plano de execução será:
1. Ajustar `GRID_HOUR_HEIGHT` e recalcular estilos dinâmicos.
2. Atualizar as classes Tailwind das bordas para tons mais claros.
3. Refinar o layout do Mês (altura e espaçamento).
4. Adicionar o indicador de hora atual.

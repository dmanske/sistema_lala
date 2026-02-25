# Download de Legendas do Angel.com

## Como usar

### Método 1: Tentar extrair automaticamente

```bash
node scripts/download-angel-subtitle.mjs "https://www.angel.com/pt-BR/watch/for-the-one/episode/2c90c53f-f6dd-429d-b1e5-62047eaf8697"
```

### Método 2: Pegar URL direta do VTT (Recomendado)

1. Abra o vídeo no navegador
2. Pressione **F12** para abrir DevTools
3. Vá na aba **Network** (Rede)
4. Filtre por **vtt** na barra de busca
5. Reproduza o vídeo
6. Quando aparecer o arquivo .vtt, clique com botão direito → Copy → Copy URL
7. Execute:

```bash
node scripts/download-angel-subtitle.mjs "<URL_DO_VTT_COPIADA>"
```

## Exemplo de saída

```
🔍 Buscando legendas para: https://...
📥 Baixando página...
🔎 Procurando por URLs de legendas VTT...
✅ Encontradas 1 URL(s) de legenda:
  1. https://cdn.angel.com/subtitles/...

📥 Baixando legenda 1...
✅ Legenda salva em: subtitle_1.vtt
```

## Troubleshooting

Se não encontrar legendas automaticamente:
- O site pode carregar as legendas dinamicamente via JavaScript
- Use o Método 2 (DevTools) para pegar a URL direta
- As legendas podem estar em um CDN separado

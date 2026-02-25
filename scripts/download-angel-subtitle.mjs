#!/usr/bin/env node

/**
 * Script para baixar legendas VTT do Angel.com
 * Uso: node scripts/download-angel-subtitle.mjs <URL_DO_VIDEO>
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import { URL } from 'url';

const videoUrl = process.argv[2];

if (!videoUrl) {
  console.error('❌ Erro: URL do vídeo não fornecida');
  console.log('Uso: node scripts/download-angel-subtitle.mjs <URL_DO_VIDEO>');
  process.exit(1);
}

console.log('🔍 Buscando legendas para:', videoUrl);

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(outputPath);
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }, (res) => {
      res.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

function extractVttUrls(html) {
  const vttUrls = [];
  
  // Padrões comuns para URLs de legendas
  const patterns = [
    /https?:\/\/[^\s"']+\.vtt/gi,
    /"(https?:\/\/[^"]+\.vtt)"/gi,
    /'(https?:\/\/[^']+\.vtt)'/gi,
    /src:\s*["']([^"']+\.vtt)["']/gi,
    /subtitle[s]?["']?\s*:\s*["']([^"']+\.vtt)["']/gi,
  ];
  
  patterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const url = match[1] || match[0];
      if (url && !vttUrls.includes(url)) {
        vttUrls.push(url);
      }
    }
  });
  
  return vttUrls;
}

async function main() {
  try {
    // Se a URL já é um arquivo .vtt, baixar diretamente
    if (videoUrl.endsWith('.vtt')) {
      console.log('📥 Baixando legenda diretamente...');
      const filename = 'subtitle.vtt';
      
      try {
        await downloadFile(videoUrl, filename);
        console.log(`✅ Legenda salva em: ${filename}`);
        
        // Mostrar preview do conteúdo
        const content = fs.readFileSync(filename, 'utf-8');
        const lines = content.split('\n').slice(0, 20);
        console.log('\n📄 Preview do conteúdo:');
        console.log(lines.join('\n'));
        if (content.split('\n').length > 20) {
          console.log('...');
        }
        return;
      } catch (err) {
        console.error(`❌ Erro ao baixar:`, err.message);
        process.exit(1);
      }
    }
    
    console.log('📥 Baixando página...');
    const html = await fetchPage(videoUrl);
    
    console.log('🔎 Procurando por URLs de legendas VTT...');
    const vttUrls = extractVttUrls(html);
    
    if (vttUrls.length === 0) {
      console.log('\n⚠️  Nenhuma URL de legenda VTT encontrada diretamente no HTML.');
      console.log('\n💡 Dicas:');
      console.log('1. Abra o vídeo no navegador');
      console.log('2. Pressione F12 para abrir DevTools');
      console.log('3. Vá na aba "Network" (Rede)');
      console.log('4. Filtre por "vtt"');
      console.log('5. Reproduza o vídeo');
      console.log('6. Copie a URL do arquivo .vtt que aparecer');
      console.log('7. Execute: node scripts/download-angel-subtitle.mjs <URL_DO_VTT>');
      
      // Tentar encontrar possíveis endpoints de API
      const apiPatterns = [
        /api[^"'\s]*/gi,
        /player[^"'\s]*/gi,
        /video[^"'\s]*/gi,
      ];
      
      console.log('\n🔍 Possíveis endpoints encontrados:');
      apiPatterns.forEach(pattern => {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          console.log('  -', match[0]);
        }
      });
      
      return;
    }
    
    console.log(`\n✅ Encontradas ${vttUrls.length} URL(s) de legenda:`);
    vttUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`);
    });
    
    // Baixar todas as legendas encontradas
    for (let i = 0; i < vttUrls.length; i++) {
      const vttUrl = vttUrls[i];
      const filename = `subtitle_${i + 1}.vtt`;
      
      console.log(`\n📥 Baixando legenda ${i + 1}...`);
      
      try {
        await downloadFile(vttUrl, filename);
        console.log(`✅ Legenda salva em: ${filename}`);
      } catch (err) {
        console.error(`❌ Erro ao baixar ${vttUrl}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
// Confere o site gerado (_site) contra as regras do projeto (docs/SEGURANCA.md: S-24, S-30, S-31).
// Uso: node scripts/verificar-site.mjs _site
// Sem dependências. Só LÊ os arquivos gerados.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const raiz = process.argv[2] || '_site';
if (!existsSync(raiz)) { console.error(`Pasta não encontrada: ${raiz} (rode "npm run build" antes)`); process.exit(2); }

const erros = [];
const falha = (arq, msg) => erros.push(`${arq}: ${msg}`);
const arquivos = [];
(function varrer(d) { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? varrer(p) : arquivos.push(p); } })(raiz);

const rel = (p) => p.slice(raiz.length + 1);
const interno = (u) => u.startsWith('/') && !u.startsWith('//');
function existe(u) {
  const alvo = u.split('#')[0].split('?')[0];
  if (alvo === '') return true;
  const p = join(raiz, alvo);
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html')));
}

let paginas = 0;
for (const arq of arquivos) {
  const ext = extname(arq);
  const texto = ['.html', '.css', '.js'].includes(ext) ? readFileSync(arq, 'utf8') : '';
  const nome = rel(arq);

  if (ext === '.html') {
    paginas++;
    if (!/<html lang="pt-BR">/.test(texto)) falha(nome, 'falta <html lang="pt-BR">');
    if (!/<title>[^<]+<\/title>/.test(texto)) falha(nome, 'falta <title>');
    if (/\sstyle\s*=/.test(texto)) falha(nome, 'atributo style (estilo inline) viola a CSP');
    if (/<style[\s>]/.test(texto)) falha(nome, '<style> inline viola a CSP');
    if (/<script(?![^>]*\ssrc=)[^>]*>/.test(texto)) falha(nome, '<script> inline viola a CSP');
    if (/\son[a-z]+\s*=\s*["']/i.test(texto)) falha(nome, 'manipulador de evento inline (onclick etc.) viola a CSP');
    if (/javascript:/i.test(texto)) falha(nome, 'link javascript:');
    if (/<(iframe|object|embed|form)[\s>]/i.test(texto)) falha(nome, 'iframe, object, embed ou form não são permitidos (regras 4 e 1)');
    for (const m of texto.matchAll(/<img\b[^>]*>/g)) if (!/\salt\s*=/.test(m[0])) falha(nome, 'imagem sem alt');
    // Recursos carregados (src, link href) só do próprio site
    for (const m of texto.matchAll(/<(?:img|script|source|video|audio)\b[^>]*\ssrc="([^"]+)"/g)) {
      if (!interno(m[1])) falha(nome, `recurso de terceiros em src: ${m[1]}`);
      else if (!existe(m[1])) falha(nome, `src quebrado: ${m[1]}`);
    }
    for (const m of texto.matchAll(/<link\b[^>]*\shref="([^"]+)"/g)) {
      if (!interno(m[1])) falha(nome, `recurso de terceiros em <link>: ${m[1]}`);
      else if (!existe(m[1])) falha(nome, `<link> quebrado: ${m[1]}`);
    }
    // Links: internos precisam existir; externos só https://
    for (const m of texto.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)) {
      const u = m[1];
      if (interno(u)) { if (!existe(u)) falha(nome, `link interno quebrado: ${u}`); }
      else if (u.startsWith('mailto:')) { /* ok */ }
      else if (!/^https:\/\//.test(u)) falha(nome, `link não permitido: ${u}`);
    }
  }
  if (ext === '.css') {
    if (/@import/.test(texto)) falha(nome, '@import (carrega de fora)');
    for (const m of texto.matchAll(/url\(\s*["']?([^)"']+)/g)) {
      if (/^(https?:)?\/\//.test(m[1])) falha(nome, `url() externa: ${m[1]}`);
      else if (interno(m[1]) && !existe(m[1])) falha(nome, `url() quebrada: ${m[1]}`);
    }
  }
  if (ext === '.js' && /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket)\b/.test(texto)) falha(nome, 'JS faz chamada de rede (páginas públicas não devem)');
}

if (erros.length) {
  console.error(`\nSite REPROVADO: ${erros.length} problema(s)\n`);
  for (const e of erros) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Site ok: ${paginas} página(s) e ${arquivos.length} arquivo(s) verificados. Sem estilo/script inline, sem terceiros.`);

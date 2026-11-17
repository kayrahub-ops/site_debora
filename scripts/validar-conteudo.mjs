#!/usr/bin/env node
// Valida o repositório de CONTEÚDO antes do build (docs/SEGURANCA.md, S-17 a S-21).
//
// Uso:  node scripts/validar-conteudo.mjs <pasta-do-repo-de-conteudo>
//
// Princípio: o conteúdo é dado NÃO CONFIÁVEL. Este script só LÊ arquivos como
// texto ou bytes. Nunca executa, importa ou interpreta nada vindo dali.
// Sem dependências externas de propósito (menos código de terceiros no build).
// Saída: código 0 se tudo ok; código 1 com a lista de problemas se algo falhar.

import { lstatSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, extname, sep } from 'node:path';

// ---------- Limites e regras (ajuste aqui) ----------
const MAX_IMAGEM_BYTES = 5 * 1024 * 1024; // 5 MB por imagem
const MAX_JSON_BYTES = 200 * 1024; // 200 KB por .json
const MAX_POST_BYTES = 200 * 1024; // 200 KB por post
const MAX_ARQUIVOS = 5000; // trava contra repositório gigante
const MAX_PROFUNDIDADE = 6;
const IGNORAR_NA_RAIZ = new Set(['.git', '.github']); // não entram no build
const ARQUIVOS_PERMITIDOS_NA_RAIZ = new Set(['README.md']);
const EXT_IMAGEM = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const NOME_SIMPLES = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/; // sem espaço, sem "..", sem acento
const SLUG_POST = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const CAMPOS_OBRIGATORIOS = ['titulo', 'data', 'resumo', 'publicado', 'revisado'];
const CAMPOS_OPCIONAIS = ['tema', 'capa', 'capa_alt'];
const DATA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

const erros = [];
const falha = (arquivo, msg) => erros.push(`${arquivo}: ${msg}`);

// ---------- Entrada ----------
const raiz = process.argv[2];
if (!raiz) {
  console.error('Uso: node scripts/validar-conteudo.mjs <pasta-do-repo-de-conteudo>');
  process.exit(2);
}
if (!existsSync(raiz) || !lstatSync(raiz).isDirectory()) {
  console.error(`Pasta não encontrada: ${raiz}`);
  process.exit(2);
}

// ---------- 1. Varredura: só tipos e nomes permitidos ----------
const arquivos = []; // caminhos relativos, com "/"
function varrer(dirAbs, nivel) {
  if (nivel > MAX_PROFUNDIDADE) {
    falha(relative(raiz, dirAbs), `pastas aninhadas demais (máx. ${MAX_PROFUNDIDADE} níveis)`);
    return;
  }
  for (const nome of readdirSync(dirAbs)) {
    const abs = join(dirAbs, nome);
    const rel = relative(raiz, abs).split(sep).join('/');
    if (nivel === 0 && IGNORAR_NA_RAIZ.has(nome)) continue;
    const st = lstatSync(abs); // lstat: NÃO segue link simbólico
    if (st.isSymbolicLink()) {
      falha(rel, 'link simbólico não é permitido');
      continue;
    }
    if (!NOME_SIMPLES.test(nome)) {
      falha(rel, 'nome inválido (use só letras sem acento, números, ponto, hífen e sublinhado)');
      continue;
    }
    if (st.isDirectory()) {
      varrer(abs, nivel + 1);
    } else if (st.isFile()) {
      arquivos.push(rel);
      if (arquivos.length > MAX_ARQUIVOS) {
        falha('(repositório)', `arquivos demais (máx. ${MAX_ARQUIVOS})`);
        return;
      }
    } else {
      falha(rel, 'tipo de arquivo não permitido');
    }
  }
}
varrer(raiz, 0);

// ---------- 2. Cada arquivo precisa estar no lugar certo e ser do tipo certo ----------
const posts = [];
const imagens = new Set();
for (const rel of arquivos) {
  const ext = extname(rel).toLowerCase();
  if (!rel.includes('/')) {
    if (!ARQUIVOS_PERMITIDOS_NA_RAIZ.has(rel)) {
      falha(rel, 'arquivo fora do lugar (na raiz só é aceito README.md)');
    }
    continue;
  }
  if (!rel.startsWith('content/')) {
    falha(rel, 'fora de content/ (nada além de content/ entra no site)');
    continue;
  }
  if (rel.startsWith('content/posts/')) {
    if (rel.split('/').length !== 3 || !SLUG_POST.test(rel.split('/')[2])) {
      falha(rel, 'post deve ser content/posts/<slug>.md, com slug em minúsculas e hífens');
    } else posts.push(rel);
  } else if (rel.startsWith('content/uploads/')) {
    if (!EXT_IMAGEM.has(ext)) falha(rel, `tipo não permitido em uploads (${ext || 'sem extensão'}); só jpg, png e webp`);
    else imagens.add(rel);
  } else if (rel.startsWith('content/data/')) {
    if (ext !== '.json') falha(rel, 'em content/data/ só são aceitos arquivos .json');
    else validarJson(rel);
  } else {
    falha(rel, 'pasta não prevista (use content/posts, content/uploads ou content/data)');
  }
}

// ---------- 3. Imagens: tamanho e assinatura real do arquivo ----------
function validarImagem(rel) {
  const abs = join(raiz, rel);
  const tam = lstatSync(abs).size;
  if (tam === 0) return falha(rel, 'imagem vazia');
  if (tam > MAX_IMAGEM_BYTES) return falha(rel, `imagem maior que ${MAX_IMAGEM_BYTES / 1024 / 1024} MB`);
  const b = readFileSync(abs).subarray(0, 12);
  const ext = extname(rel).toLowerCase();
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP';
  const ok = (['.jpg', '.jpeg'].includes(ext) && jpg) || (ext === '.png' && png) || (ext === '.webp' && webp);
  if (!ok) falha(rel, 'o conteúdo não corresponde à extensão (arquivo renomeado ou corrompido)');
}
imagens.forEach(validarImagem);

// ---------- 4. JSON ----------
function validarJson(rel) {
  const abs = join(raiz, rel);
  if (lstatSync(abs).size > MAX_JSON_BYTES) return falha(rel, `JSON maior que ${MAX_JSON_BYTES / 1024} KB`);
  try {
    JSON.parse(readFileSync(abs, 'utf8')); // só lê como dado; nunca executa
  } catch (e) {
    falha(rel, `JSON inválido (${e.message})`);
  }
}

// ---------- 5. Posts: front matter no padrão e corpo seguro ----------
// Parser mínimo de propósito: aceita só "chave: valor" em uma linha.
function lerFrontMatter(texto, rel) {
  const m = texto.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) {
    falha(rel, 'sem front matter (o arquivo deve começar com ---)');
    return null;
  }
  const campos = {};
  for (const [i, linha] of m[1].split(/\r?\n/).entries()) {
    if (linha.trim() === '' || linha.trimStart().startsWith('#')) continue;
    const kv = linha.match(/^([a-z_]+):[ \t]*(.*)$/);
    if (!kv) {
      falha(rel, `front matter, linha ${i + 1}: formato não aceito ("chave: valor" em uma linha). [VALIDAR] se o Decap quebra textos longos em várias linhas`);
      continue;
    }
    const [, chave, bruto] = kv;
    if (chave in campos) falha(rel, `campo repetido: ${chave}`);
    campos[chave] = valorScalar(bruto.trim());
  }
  return { campos, corpo: m[2] };
}

function valorScalar(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    try {
      return JSON.parse(v); // aspas duplas do YAML são compatíveis com JSON no que usamos
    } catch {
      return v.slice(1, -1);
    }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replace(/''/g, "'");
  return v; // texto sem aspas
}

// Marcação HTML crua no corpo (o render a deixa desligada; aqui barramos cedo).
// Autolinks como <https://exemplo.com> continuam permitidos.
const HTML_CRU = /<\/?(?!https:\/\/)[A-Za-z][^>]*>/;

function validarPost(rel) {
  const abs = join(raiz, rel);
  if (lstatSync(abs).size > MAX_POST_BYTES) return falha(rel, `post maior que ${MAX_POST_BYTES / 1024} KB`);
  const texto = readFileSync(abs, 'utf8');
  const fm = lerFrontMatter(texto, rel);
  if (!fm) return;
  const { campos, corpo } = fm;

  for (const c of CAMPOS_OBRIGATORIOS) if (!(c in campos)) falha(rel, `falta o campo obrigatório: ${c}`);
  for (const c of Object.keys(campos)) {
    if (!CAMPOS_OBRIGATORIOS.includes(c) && !CAMPOS_OPCIONAIS.includes(c)) falha(rel, `campo não previsto: ${c}`);
  }

  const texto1 = (c, max) => {
    if (!(c in campos)) return;
    if (typeof campos[c] !== 'string' || campos[c].trim() === '') falha(rel, `${c} deve ser um texto não vazio`);
    else if (campos[c].length > max) falha(rel, `${c} passa de ${max} caracteres`);
  };
  texto1('titulo', 140);
  texto1('resumo', 300);
  if ('tema' in campos) texto1('tema', 40);
  if ('capa_alt' in campos) texto1('capa_alt', 200);

  if ('data' in campos) {
    if (typeof campos.data !== 'string' || !DATA_ISO.test(campos.data) || Number.isNaN(Date.parse(campos.data))) {
      falha(rel, 'data deve estar no formato 2026-11-17T09:00:00-03:00 (ou terminar em Z)');
    }
  }
  for (const c of ['publicado', 'revisado']) {
    if (c in campos && typeof campos[c] !== 'boolean') falha(rel, `${c} deve ser true ou false`);
  }

  if ('capa' in campos) {
    const capa = String(campos.capa);
    const alvo = capa.startsWith('/uploads/') ? `content${capa}` : null;
    if (!alvo || !imagens.has(alvo)) falha(rel, `capa aponta para imagem que não existe em content/uploads: ${capa}`);
    if (!campos.capa_alt || String(campos.capa_alt).trim() === '') falha(rel, 'capa exige capa_alt (descrição da imagem)');
  } else if ('capa_alt' in campos) {
    falha(rel, 'capa_alt sem capa');
  }

  // Corpo
  if (HTML_CRU.test(corpo)) falha(rel, 'HTML cru no texto não é permitido (use apenas formatação do editor)');
  const links = [...corpo.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)/g)];
  for (const [bruto, url] of links) {
    const eImagem = bruto.startsWith('!');
    if (/^https:\/\//i.test(url)) {
      if (eImagem) falha(rel, `imagem externa não é permitida (use o upload do painel): ${url}`);
    } else if (url.startsWith('/uploads/') && eImagem) {
      if (!imagens.has(`content${url}`)) falha(rel, `imagem não encontrada em content/uploads: ${url}`);
    } else if (url.startsWith('#') || (url.startsWith('/') && !url.startsWith('//') && !eImagem)) {
      // âncora ou link interno do próprio site: ok
    } else {
      falha(rel, `link não permitido (só https://, links internos e imagens de /uploads/): ${url}`);
    }
    if (eImagem) {
      const alt = bruto.match(/^!\[([^\]]*)\]/)[1].trim();
      if (!alt) falha(rel, `imagem sem texto alternativo: ${url}`);
    }
  }
}
posts.forEach(validarPost);

// ---------- Resultado ----------
if (erros.length) {
  console.error(`\nConteúdo REPROVADO: ${erros.length} problema(s)\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error('\nO build foi interrompido. Corrija o que foi listado e rode de novo.');
  process.exit(1);
}
console.log(`Conteúdo ok: ${posts.length} post(s), ${imagens.size} imagem(ns), ${arquivos.length} arquivo(s) verificado(s).`);

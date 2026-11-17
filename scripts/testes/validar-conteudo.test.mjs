// Testes do validador. Rodar com:  node --test scripts/testes/validar-conteudo.test.mjs
// Cada teste monta um repositório de conteúdo falso numa pasta temporária.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'validar-conteudo.mjs');
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

const POST_OK = `---
titulo: "Um texto de exemplo"
data: "2026-11-17T09:00:00-03:00"
resumo: "Resumo curto do texto."
tema: "Leituras e filmes"
publicado: true
revisado: true
---

Parágrafo com [um link](https://exemplo.com.br) e **negrito**.
`;

function montar(arquivos) {
  const raiz = mkdtempSync(join(tmpdir(), 'conteudo-'));
  for (const [rel, conteudo] of Object.entries(arquivos)) {
    const abs = join(raiz, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, conteudo);
  }
  return raiz;
}
function rodar(raiz) {
  const r = spawnSync(process.execPath, [SCRIPT, raiz], { encoding: 'utf8' });
  return { codigo: r.status, saida: r.stdout + r.stderr };
}
function esperaFalha(arquivos, trecho) {
  const raiz = montar(arquivos);
  try {
    const { codigo, saida } = rodar(raiz);
    assert.equal(codigo, 1, saida);
    assert.match(saida, trecho);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
}

test('conteúdo válido passa', () => {
  const raiz = montar({
    'README.md': '# conteúdo',
    '.github/workflows/disparo.yml': 'on: push', // ignorado de propósito
    'content/posts/um-texto.md': POST_OK,
    'content/uploads/foto.png': PNG,
    'content/data/textos.json': '{"a":1}',
  });
  try {
    const { codigo, saida } = rodar(raiz);
    assert.equal(codigo, 0, saida);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('S-37: arquivo .js no conteúdo reprova', () => {
  esperaFalha({ 'content/uploads/x.js': 'alert(1)' }, /tipo não permitido em uploads/);
  esperaFalha({ 'content/data/x.js': 'alert(1)' }, /só são aceitos arquivos \.json/);
  esperaFalha({ 'evil.js': 'alert(1)' }, /fora do lugar/);
  esperaFalha({ 'content/outra/x.md': '# x' }, /pasta não prevista/);
});

test('SVG e HTML em uploads reprovam', () => {
  esperaFalha({ 'content/uploads/a.svg': '<svg onload=alert(1)>' }, /tipo não permitido/);
  esperaFalha({ 'content/uploads/a.html': '<script>' }, /tipo não permitido/);
});

test('imagem renomeada (conteúdo não é imagem) reprova', () => {
  esperaFalha({ 'content/uploads/a.png': 'isto é um script, não uma imagem' }, /não corresponde à extensão/);
});

test('nome de arquivo com espaço, acento ou ".." reprova', () => {
  esperaFalha({ 'content/uploads/minha foto.png': PNG }, /nome inválido/);
  esperaFalha({ 'content/uploads/ação.png': PNG }, /nome inválido/);
});

test('link simbólico reprova', () => {
  const raiz = montar({ 'content/posts/a.md': POST_OK });
  try {
    symlinkSync('/etc/passwd', join(raiz, 'content', 'uploads-link.png'));
    const { codigo, saida } = rodar(raiz);
    assert.equal(codigo, 1, saida);
    assert.match(saida, /link simbólico/);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('front matter fora do padrão reprova', () => {
  esperaFalha({ 'content/posts/a.md': POST_OK.replace('publicado: true\n', '') }, /falta o campo obrigatório: publicado/);
  esperaFalha({ 'content/posts/a.md': POST_OK.replace('revisado: true', 'revisado: "sim"') }, /revisado deve ser true ou false/);
  esperaFalha({ 'content/posts/a.md': POST_OK.replace('---\n\nPar', 'extra: 1\n---\n\nPar') }, /campo não previsto: extra/);
  esperaFalha({ 'content/posts/a.md': POST_OK.replace('2026-11-17T09:00:00-03:00', 'ontem') }, /data deve estar no formato/);
  esperaFalha({ 'content/posts/a.md': 'sem front matter' }, /sem front matter/);
});

test('slug de post inválido reprova', () => {
  esperaFalha({ 'content/posts/Meu_Post.md': POST_OK }, /slug em minúsculas/);
});

test('S-36: HTML cru e links perigosos no corpo reprovam', () => {
  esperaFalha({ 'content/posts/a.md': POST_OK + '\n<script>alert(1)</script>\n' }, /HTML cru/);
  esperaFalha({ 'content/posts/a.md': POST_OK + '\n[clique](javascript:alert(1))\n' }, /link não permitido/);
  esperaFalha({ 'content/posts/a.md': POST_OK + '\n[site](http://exemplo.com)\n' }, /link não permitido/);
  esperaFalha({ 'content/posts/a.md': POST_OK + '\n![x](https://externo.com/a.png)\n' }, /imagem externa/);
});

test('autolink https e título com texto estranho são aceitos como texto', () => {
  const raiz = montar({
    'content/posts/a.md': POST_OK.replace('Um texto de exemplo', 'Título com <b> e "aspas"').replace('"Título com <b> e "aspas""', '"Título com <b> e \\"aspas\\""') + '\nVeja <https://exemplo.com.br>.\n',
  });
  try {
    const { codigo, saida } = rodar(raiz);
    assert.equal(codigo, 0, saida); // o escape do título é responsabilidade do template (S-18)
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
});

test('capa exige imagem existente e capa_alt', () => {
  const comCapa = POST_OK.replace('publicado: true', 'capa: "/uploads/foto.png"\npublicado: true');
  esperaFalha({ 'content/posts/a.md': comCapa, 'content/uploads/foto.png': PNG }, /capa exige capa_alt/);
  esperaFalha({ 'content/posts/a.md': comCapa + '' }, /capa aponta para imagem que não existe/);
});

test('imagem no corpo precisa de texto alternativo e existir', () => {
  esperaFalha({ 'content/posts/a.md': POST_OK + '\n![](/uploads/foto.png)\n', 'content/uploads/foto.png': PNG }, /sem texto alternativo/);
  esperaFalha({ 'content/posts/a.md': POST_OK + '\n![foto](/uploads/nao-existe.png)\n' }, /imagem não encontrada/);
});

test('JSON inválido reprova', () => {
  esperaFalha({ 'content/data/a.json': '{ quebrado' }, /JSON inválido/);
});

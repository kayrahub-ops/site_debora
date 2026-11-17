#!/usr/bin/env node
// SERVIDOR DE TESTE do spike S1. Descartável: roda só no seu computador.
//
// O que faz:
//   1. Mostra o painel (a pasta spikes/s1/admin) em http://localhost:8080/admin/
//   2. Responde em /auth fingindo ser o nosso login. NÃO pede Google: entrega direto
//      o token da conta-robô. Serve para provar UMA coisa: o painel aceita esse token?
//
// O token vem da variável de ambiente TOKEN_ROBO. Ele nunca é impresso nem gravado.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTA = 8080;
const ORIGEM_PAINEL = `http://localhost:${PORTA}`; // única origem que pode receber o token
const TOKEN = process.env.TOKEN_ROBO;
if (!TOKEN) {
  console.error('Falta a variável TOKEN_ROBO. Veja o roteiro (Parte 3).');
  process.exit(1);
}
const ADMIN = join(dirname(fileURLToPath(import.meta.url)), 'admin');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.yml': 'text/yaml; charset=utf-8' };

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Script da janela de login (arquivo à parte, como será na versão final: sem script dentro da página).
const POPUP_JS = `
(function () {
  var el = document.getElementById('dados');
  var resposta = el.getAttribute('data-resposta');   // "authorization:github:success:{...}"
  var origem = el.getAttribute('data-origem');       // origem fixa do painel
  // Passo 1: avisa o painel que a janela abriu.
  window.opener.postMessage('authorizing:github', origem);
  // Passo 2: o painel responde o mesmo aviso; só então entregamos o token, e só a ele.
  window.addEventListener('message', function (e) {
    if (e.origin !== origem) return;
    if (e.data !== 'authorizing:github') return;
    window.opener.postMessage(resposta, origem);
  });
})();
`;

function paginaAuth() {
  const resposta = 'authorization:github:success:' + JSON.stringify({ token: TOKEN, provider: 'github' });
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Entrando…</title></head>
<body><p>Entrando no painel…</p>
<div id="dados" hidden data-origem="${escapar(ORIGEM_PAINEL)}" data-resposta="${escapar(resposta)}"></div>
<script src="/auth/popup.js"></script></body></html>`;
}

createServer(async (req, res) => {
  const url = new URL(req.url, ORIGEM_PAINEL);
  const cab = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  try {
    if (url.pathname === '/') {
      res.writeHead(302, { Location: '/admin/' });
      return res.end();
    }
    if (url.pathname === '/auth') {
      res.writeHead(200, { ...cab, 'Content-Type': TIPOS['.html'] });
      return res.end(paginaAuth());
    }
    if (url.pathname === '/auth/popup.js') {
      res.writeHead(200, { ...cab, 'Content-Type': TIPOS['.js'] });
      return res.end(POPUP_JS);
    }
    if (url.pathname.startsWith('/admin/')) {
      const rel = url.pathname === '/admin/' ? 'index.html' : url.pathname.slice('/admin/'.length);
      const alvo = normalize(join(ADMIN, rel));
      if (!alvo.startsWith(ADMIN + sep)) throw Object.assign(new Error('fora'), { code: 'ENOENT' });
      const corpo = await readFile(alvo);
      res.writeHead(200, { ...cab, 'Content-Type': TIPOS[extname(alvo)] || 'application/octet-stream' });
      return res.end(corpo);
    }
    res.writeHead(404, cab);
    res.end('Não encontrado');
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500, cab);
    res.end(e.code === 'ENOENT' ? 'Não encontrado (o decap-cms.js foi copiado? veja o roteiro)' : 'Erro');
  }
}).listen(PORTA, '127.0.0.1', () => console.log(`Servidor de teste em ${ORIGEM_PAINEL}/admin/  (Ctrl+C para parar)`));

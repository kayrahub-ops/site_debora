# Site da Débora Lima

Projeto da KAYRÁhub. Instruções para o Claude Code em `CLAUDE.md`; documentação em `docs/`.

## Como rodar
```bash
npm install
npm run build        # gera a pasta _site/
npm run verificar    # confere _site/ contra as regras (sem estilo/script inline, sem terceiros)
npm run teste        # testes do validador de conteúdo
npm start            # servidor local com recarga automática
```

## O que existe hoje
- `src/`: site em Eleventy (7 páginas + 404), visual do design aprovado, fontes hospedadas no próprio site, `.htaccess` com cabeçalhos e CSP.
- `scripts/validar-conteudo.mjs`: barra conteúdo fora do padrão antes do build (testes em `scripts/testes/`).
- `scripts/verificar-site.mjs`: confere o site gerado.
- `design/prototipo-html/`: protótipo original (referência do Fabiano; não vai para produção).
- `spikes/`: testes descartáveis (S1 painel/login, diagnóstico da Locaweb).

## Pendências conhecidas
- Contato: preencher `whatsapp` e `email` em `src/_data/site.json`.
- Blog: textos ainda são modelos (`[Título do texto]`); as páginas `/blog/` e `/blog/modelo/` estão com `noindex` até o blog existir (fase 6).
- Link do Lattes trocado para `https://`: clicar e conferir (tarefa 9.2).
- Os estilos vieram do protótipo (`src/assets/css/utilidades.css` é gerado a partir dos estilos que estavam inline). Consolidar com os tokens do Fabiano (tarefas 4.7 e 5.2).
- Painel (`/admin/`) e login ainda não existem (fase 7; spike S1).

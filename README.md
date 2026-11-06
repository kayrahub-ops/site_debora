# Site da Débora Lima

Projeto da KAYRÁhub. Instruções para o Claude Code em `CLAUDE.md`; documentação em `docs/`.

## Estado atual
Ainda não existe o site. O que há em `design/prototipo-html/` é um **protótipo de referência** (HTML estático convertido do design "Site Débora Lima"), para apoiar o handoff do Fabiano (tarefa 4.7). Ele **não** segue as regras do projeto e não deve ir para produção:
- carrega fontes do Google Fonts (regra 4: fontes devem ser hospedadas no próprio domínio);
- usa estilos inline (regra 5: CSP estrita);
- não usa Eleventy nem a estrutura de dois repositórios.

Textos de blog e contato ainda são placeholders (`[Título do texto]`, `wa.me/` sem número, `mailto:` sem endereço). Os textos das páginas vieram do design e ainda precisam de revisão pelo `docs/CFP-CONTEUDO.md` (tarefa 3.4).

Para ver o protótipo: `cd design/prototipo-html && python3 -m http.server`.

## Próximo passo
Fase 5.1: esqueleto Eleventy a partir de `kayrahub-ops/meio_fio`, depois das fases 1 e 2 (contas e spikes), com o João.

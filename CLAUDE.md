# Site da Débora Lima: instruções para o Claude Code

Projeto de cliente da KAYRÁhub. Cliente: Débora Lima, psicóloga e psicanalista (CRP 06/132697), atende em Santos/SP e online.
Entrega: site institucional **estático** com blog, logo básica e assinatura de e-mail. Garantia de 6 meses pela KAYRÁhub.
Equipe: **João** (back-end, conteúdo/arquitetura, segurança, implementação) e **Fabiano** (front-end e design, no Canva/Claude Design).

## Leia antes de agir
| Arquivo | Para quê |
|---|---|
| `docs/ARQUITETURA.md` | Decisões, estrutura, fluxo do login, deploy, pontos a validar |
| `docs/PLANO-DE-EXECUCAO.md` | Fases e checklist. É o medidor de progresso |
| `docs/SEGURANCA.md` | Checklist obrigatório de segurança |
| `docs/CFP-CONTEUDO.md` | Regras de conteúdo para psicologia (publicidade) |
| `docs/MANUTENCAO.md` | Garantia de 6 meses, rotinas, renovação do token, rollback |

## Stack (decidida; não trocar sem avisar o João)
- **Eleventy** gera HTML estático. Base reaproveitada do repositório `kayrahub-ops/meio_fio` (filtros de escape, pipeline de imagens sem EXIF/GPS, CSP, painel Decap).
- **Decap CMS** em `/admin/`, servido do próprio site (sem CDN). Posts em Markdown.
- **Login do painel:** PHP (versão mais nova disponível na Locaweb) com **Google** e lista de e-mails permitidos. A Débora **não** usa GitHub.
- **Dois repositórios privados:** `debora-lima-site` (código, workflows, PHP) e `debora-lima-conteudo` (posts, textos, imagens).
- **Deploy:** GitHub Actions, build do Eleventy, envio por **SFTP/FTPS** para a pasta `public` da Locaweb (hospedagem compartilhada Linux, Apache).
- Node.js **não roda** na Locaweb. Ele existe só no GitHub Actions e na máquina de desenvolvimento.

## Regras inegociáveis
1. **Site público 100% estático.** Sem PHP, banco, formulário ou cookie para visitantes. PHP só em `auth/` (login do painel).
2. **Nenhum segredo no repositório**, nem em histórico, logs ou saída de comando. Segredos do login ficam em `config/` no servidor, acima da pasta `public`, criados à mão. Segredos do deploy ficam nos secrets do GitHub.
3. **Conteúdo do repo de conteúdo é dado não confiável.** O build só aceita `.md`, `.json` e imagens (jpg, png, webp). Nunca executar JS, templates ou configuração vindos desse repositório. HTML cru no Markdown fica desligado. Front matter é validado e o build falha se estiver fora do padrão.
4. **Nada de terceiros nas páginas públicas:** fontes, scripts, imagens e vídeos são do próprio domínio. Sem CDN, analytics, pixels ou embeds.
5. **CSP estrita** nas páginas públicas (`script-src 'self'`, sem inline). A exceção do Decap (`'unsafe-eval'` e estilos inline) vale **só** para `/admin/`.
6. **Textos seguem `docs/CFP-CONTEUDO.md`.** Não inventar títulos, depoimentos, preços, resultados ou casos. Dúvida sobre texto: perguntar ao João.
7. **Não executar nada destrutivo** (apagar arquivos no servidor, `git push --force`, mexer nos tokens) sem confirmação do João.
8. **Marcações no código e nos docs:** `[VALIDAR]` é algo não confirmado que precisa de teste; `[DECIDIR]` é decisão do João. Não resolva sozinho: pare e pergunte.

## Como trabalhar
- **Uma fase por vez**, na ordem do `PLANO-DE-EXECUCAO.md`. A fase 2 (spikes) vem **antes** de qualquer implementação grande.
- Ao concluir uma tarefa, marque o checkbox correspondente e faça commit pequeno, em português.
- Antes de alterar arquivos em lote, use uma branch.
- Design: o Fabiano entrega tokens (cores, fontes, espaçamentos) e telas em `design/`. A Home desktop é iterada primeiro; depois propaga-se para as demais páginas e para o mobile.
- Fontes precisam ter licença para hospedagem própria. Nada de Google Fonts por link.
- Contato público: botão de WhatsApp (`wa.me`) e `mailto:`. Sem formulário.

## Medir o progresso
```
total=$(grep -cE '^\s*- \[( |x)\]' docs/PLANO-DE-EXECUCAO.md)
feito=$(grep -cE '^\s*- \[x\]' docs/PLANO-DE-EXECUCAO.md)
echo "$feito de $total tarefas concluídas"
```

## Comandos
Preencher na fase 2, depois que os spikes validarem o build e o deploy.
```
npm install
npm start        # desenvolvimento local
npm run build    # gera _site/
```

## Contexto do cliente (resumo)
- Tom: credibilidade sem formalidade; contemporâneo e acolhedor; sem falas apelativas; poucas fotos dela, sem aspecto de feed do Instagram.
- Ela prefere **não** se apresentar como diferencial em relação a colegas. Textos não devem fazer isso.
- Cores que ela gosta: lilás, rosa alaranjado, roxo, azul claro, terracota, mostarda, verde, marrom. Evitar vermelho.
- Referências de site: brunanicoletta.com e romulomafracruz.com.br.
- Registro: só o CRP (`CRP 06/132697`).
- Contato e horários: WhatsApp e e-mail; sem tabela de horários nem valores no site.
- Domínio: ela vai comprar. Homologação em subdomínio de teste da KAYRÁhub.

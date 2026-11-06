# Plano de execução: site da Débora Lima

**Como medir o progresso:** tarefas concluídas ÷ total de tarefas (`[x]` ÷ `[ ]` + `[x]`). O comando está no `CLAUDE.md`.
**Responsáveis:** J = João · F = Fabiano · D = Débora.
Prazo não é o foco por ora; o medidor é o número de tarefas e fases concluídas.

## Visão das fases
| Fase | Nome | Resp. | Critério de pronto |
|---|---|---|---|
| 0 | Decisões e insumos | J, D | Decisões registradas e insumos da Débora recebidos |
| 1 | Contas e infraestrutura | J | Repos, conta-robô, Locaweb de teste e Google OAuth prontos |
| 2 | Spikes (validar riscos) | J | S1 a S6 ok, ou plano B decidido por escrito |
| 3 | Conteúdo e arquitetura de informação | J | Textos de todas as páginas revisados pela regra do CFP |
| 4 | Design | F | Débora aprova visual e telas; handoff entregue |
| 5 | Site estático | J, F | Páginas institucionais implementadas e acessíveis |
| 6 | Blog | J | Posts renderizam com a regra de visibilidade |
| 7 | Painel e login | J | A Débora entra com o Google e publica um post |
| 8 | Segurança e conformidade | J | `SEGURANCA.md` 100% marcado, com evidências |
| 9 | QA | J, F | Fluxos testados em celular e desktop |
| 10 | Aprovação | D | Aprovação formal de textos, visual e painel |
| 11 | Go-live | J | Site no domínio final com HTTPS e login funcionando |
| 12 | Entrega e garantia | J | Documentação entregue; garantia de 6 meses iniciada |

## Fase 0: Decisões e insumos
- [x] 0.1 Plano A: Eleventy + Decap, com PHP só no login (J)
- [x] 0.2 Locaweb confirmada pelo suporte: SFTP/FTPS, Apache com `.htaccess` e `mod_headers`, cURL/OpenSSL, pasta fora da `public`, Let's Encrypt automático (J)
- [x] 0.3 Login por Google (sem GitHub para a Débora); só ela edita e publica (J)
- [x] 0.4 Dois repositórios e conta-robô aprovados (J)
- [x] 0.5 Recursos do blog: rascunhos, agendamento, editor com formatações comuns, capa opcional (J)
- [x] 0.6 Garantia de 6 meses pela KAYRÁhub (J)
- [ ] 0.7 Débora informa o e-mail Google que entrará na lista do painel (D)
- [ ] 0.8 Débora responde os campos em branco do questionário (Apêndice A) (D)
- [ ] 0.9 Débora envia a pasta do ensaio fotográfico e dos marcos da carreira (D)
- [ ] 0.10 Resolver os `[DECIDIR]` de `ARQUITETURA.md`: D-11, D-13, D-15 e frequência do build agendado (J)
- [ ] 0.11 Confirmar com a Débora a compra do domínio e que o registro ficará em nome dela (J)

## Fase 1: Contas e infraestrutura
- [ ] 1.1 Criar `debora-lima-site` e `debora-lima-conteudo`, privados, em `kayrahub-ops` (J)
- [ ] 1.2 Criar a conta-robô do GitHub com 2FA; convite com permissão de escrita só no repo de conteúdo (J)
- [ ] 1.3 Gerar o token fino da conta-robô (só conteúdo; Contents RW e Metadata R; sem Workflows; validade ≤ 12 meses). Guardar só em `config/` no servidor (J)
- [ ] 1.4 Gerar o token fino de disparo (permissão Actions só no repo de código) e guardar como secret do repo de conteúdo (J)
- [ ] 1.5 Ativar Dependabot e alertas de segurança nos dois repos; 2FA em todos os membros (J)
- [ ] 1.6 Criar o subdomínio de teste (`teste.kayrahub.com.br`) e instalar o HTTPS Let's Encrypt pelo painel (J)
- [ ] 1.7 Rodar `diagnostico-locaweb.php` no teste, guardar o resultado em `docs/` e apagar o arquivo do servidor (J)
- [ ] 1.8 Escolher a versão mais nova do PHP no painel e registrar qual (J)
- [ ] 1.9 Criar conta SFTP/FTPS exclusiva do deploy, limitada ao site, se o painel permitir (J)
- [ ] 1.10 Criar o projeto no Google Cloud, o cliente OAuth do tipo Web, a tela de consentimento e as URIs de redirecionamento do teste (J)

## Fase 2: Spikes
- [ ] 2.1 S1 Login: o Decap abre o `/auth` em PHP, o Google valida, a lista de e-mails filtra e a credencial chega ao Decap por `postMessage` com origem fixa; o painel abre o repo de conteúdo `[VALIDAR]` (J)
- [ ] 2.2 S2 Build com dois repos, aceitando apenas `.md`, `.json` e imagens do conteúdo (J)
- [ ] 2.3 S3 Deploy para `public/` por SFTP ou FTPS com a conta restrita; decidir o protocolo (J)
- [ ] 2.4 S4 Agendamento: post futuro não aparece e aparece no build agendado (J)
- [ ] 2.5 S5 `.htaccess`: CSP pública, de `/admin/` e de `/auth/` sem violações no console (J)
- [ ] 2.6 S6 Um push no repo de conteúdo dispara o build do repo de código com permissão mínima `[VALIDAR]` (J)
- [ ] 2.7 Registrar os resultados e atualizar `ARQUITETURA.md`; preencher os comandos do `CLAUDE.md` (J)

## Fase 3: Conteúdo e arquitetura de informação
- [ ] 3.1 Mapa do site: Home, Sobre e Trajetória, Formação e Títulos, Pesquisa, Atendimento (Santos e online), Blog, Contato, Privacidade (J)
- [ ] 3.2 Rascunho dos textos de cada página a partir do questionário, no tom da KAYRÁhub e sem texto com cara de IA (J)
- [ ] 3.3 Fechar as lacunas com a Débora (Apêndice A) (J, D)
- [ ] 3.4 Revisar os textos pela regra de `CFP-CONTEUDO.md` (J)
- [ ] 3.5 Metadados por página: título, descrição, Open Graph, `sitemap.xml` e `robots.txt` (J)
- [ ] 3.6 Política de privacidade (rascunho para revisão jurídica) (J)

## Fase 4: Design
- [ ] 4.1 Paleta, tipografia (fontes com licença para hospedagem própria) e tom visual aprovados pela Débora (F)
- [ ] 4.2 Logo básica (F)
- [ ] 4.3 Home desktop, iterada até a aprovação (F)
- [ ] 4.4 Demais páginas desktop, propagando a Home (F)
- [ ] 4.5 Versão mobile (F)
- [ ] 4.6 Telas do blog: lista, post e página 404 (F)
- [ ] 4.7 Handoff em `design/`: tokens (cores, fontes, espaçamentos) e telas exportadas (F)
- [ ] 4.8 Assinatura de e-mail com Nome, CRP, site e telefone (F)

## Fase 5: Site estático
- [ ] 5.1 Esqueleto Eleventy copiado do Meio Fio: filtros de escape, pipeline de imagens, estrutura de dados (J)
- [ ] 5.2 Layout base e CSS próprio a partir dos tokens do Fabiano, sem CDN (J, F)
- [ ] 5.3 Páginas institucionais (J, F)
- [ ] 5.4 Contato: botão de WhatsApp (`wa.me`) e `mailto:`, sem formulário (J)
- [ ] 5.5 Acessibilidade: contraste, foco visível, `alt`, landmarks, `lang="pt-BR"`, `prefers-reduced-motion` (J, F)
- [ ] 5.6 Rodapé com nome, "Psicóloga" e CRP 06/132697 (J)
- [ ] 5.7 Página 404, favicon e links para Lattes e dissertação (J)

## Fase 6: Blog
- [ ] 6.1 Coleção `posts` lendo do repo de conteúdo (J)
- [ ] 6.2 Renderização segura: HTML cru desligado, links só `https://`, escape em título, resumo e alt (J)
- [ ] 6.3 Regra de visibilidade: `publicado` e `revisado` verdadeiros e `data <= agora` em America/Sao_Paulo (J)
- [ ] 6.4 Lista com paginação, página de post, tempo de leitura e capa opcional com `alt` obrigatório quando houver capa (J)
- [ ] 6.5 RSS e sitemap incluindo os posts (J)
- [ ] 6.6 Validação do front matter no build (falha se estiver fora do padrão) (J)

## Fase 7: Painel e login
- [ ] 7.1 `config.yml` do Decap: backend GitHub, repo de conteúdo, `base_url`, `auth_endpoint` e coleção de posts (título, data e hora, resumo, capa e `alt`, corpo, `publicado` e `revisado` com padrão falso) (J)
- [ ] 7.2 Editor de texto com as formatações comuns; decisão de sublinhado conforme D-11 (J)
- [ ] 7.3 PHP `/auth`: `state`, `nonce`, PKCE e redirecionamento ao Google (J)
- [ ] 7.4 PHP `/auth/callback`: troca de código, validação do ID token, lista de e-mails e entrega ao Decap com origem fixa (J)
- [ ] 7.5 Limite de tentativas e registro de acessos (J)
- [ ] 7.6 Página de erro amigável para conta sem acesso (J)
- [ ] 7.7 Manual de uso para a Débora, com prints e sem jargão (J)

## Fase 8: Segurança e conformidade
- [ ] 8.1 Percorrer `SEGURANCA.md` inteiro e guardar as evidências (J)
- [ ] 8.2 `npm audit` e Dependabot sem alertas altos (J)
- [ ] 8.3 Conferir os cabeçalhos em produção com `curl` (J)
- [ ] 8.4 Varredura de segredos no código e em todo o histórico dos dois repos (J)
- [ ] 8.5 Teste de abuso do login: e-mail fora da lista, `state` inválido, código reutilizado (J)
- [ ] 8.6 Teste de XSS: título, resumo e corpo com HTML e script não executam (J)

## Fase 9: QA
- [ ] 9.1 Celular (iOS e Android) e desktop (Chrome, Firefox, Safari) (J, F)
- [ ] 9.2 Links: Lattes, dissertação, WhatsApp e e-mail (J)
- [ ] 9.3 Lighthouse e verificação de acessibilidade (J, F)
- [ ] 9.4 CSP sem violações no console, nas páginas públicas e no painel (J)
- [ ] 9.5 Fluxo da Débora: entrar, criar rascunho, marcar revisado, agendar, publicar e desfazer (J)

## Fase 10: Aprovação
- [ ] 10.1 Débora aprova os textos (D)
- [ ] 10.2 Débora aprova o visual (D)
- [ ] 10.3 Débora usa o painel sozinha em chamada, com acompanhamento (J, D)

## Fase 11: Go-live
- [ ] 11.1 Débora compra o domínio e informa (D)
- [ ] 11.2 Apontar o DNS para a Locaweb, instalar o Let's Encrypt no domínio e padronizar www (J)
- [ ] 11.3 Atualizar as URIs do Google e o `base_url` e `site_url` do Decap para o domínio final (J)
- [ ] 11.4 Deploy final; remover o arquivo de diagnóstico e o que sobrou do teste (J)
- [ ] 11.5 Conferir HTTPS e cabeçalhos no domínio final (J)
- [ ] 11.6 Enviar o `sitemap.xml` ao Google Search Console, se a Débora quiser (J)

## Fase 12: Entrega e garantia
- [ ] 12.1 Entregar acessos e documentação; definir onde ficam a titularidade dos repos e da hospedagem `[DECIDIR]` (J)
- [ ] 12.2 Entregar a assinatura de e-mail (F)
- [ ] 12.3 Calendário de manutenção de `MANUTENCAO.md`, com lembrete de renovação do token (J)
- [ ] 12.4 Registrar a data de início da garantia de 6 meses (J)
- [ ] 12.5 Revisões no mês 3 e no mês 6 (J)

## Apêndice A: Insumos pendentes da Débora
Campos em branco no questionário:
- Experiências que mais moldaram a forma de trabalhar; momento decisivo; conquistas mais importantes
- Causa ou discussão que considera importante defender; transformação que busca nas pessoas; frase que resume o trabalho
- Principais demandas dos pacientes; o que saber antes da primeira consulta; dúvidas frequentes
- Materiais de supervisão e eventos; inspirações digitais; campo "algo que não perguntamos"
- Link do ensaio fotográfico (pasta no Drive) e pasta de marcos da carreira

Confirmar:
- E-mail Google para o painel; telefone/WhatsApp e e-mail públicos
- Se a graduação em Tecnologia em Gestão de RH (2010) deve aparecer na lista de formação
- Que os links do Lattes e da dissertação abrem
- Que ela **não** usará "Dra." (o título é de mestrado; ver `CFP-CONTEUDO.md`)

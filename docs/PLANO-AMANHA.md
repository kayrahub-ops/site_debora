# Plano de ação para amanhã (passo a passo)

Escrito para ser seguido sem pressa e sem conhecimento prévio. Cada passo diz **o que fazer**, **onde** e **como saber que deu certo**.
Estado de hoje: **6 de 87 tarefas** concluídas (todas da fase 0). O repositório tem os docs em `docs/` e um protótipo HTML de referência em `design/prototipo-html/`. Ainda não existe o site de verdade.

Legenda: **[SOZINHO]** você faz sem depender de ninguém · **[DÉBORA]** depende de resposta dela · **[FABIANO]** depende do design · `[VALIDAR]` / `[DECIDIR]` seguem a regra do `CLAUDE.md`.

---

## 0. A ideia do dia (leia primeiro)

O que mais atrasa um projeto assim é **esperar uma pessoa responder**. Por isso a primeira coisa de amanhã é mandar para a Débora tudo o que precisamos dela, de uma vez só (Parte 4). Enquanto ela responde, você avança no que não depende dela (fases 1 e 2).

Ordem do dia:
1. Enviar a mensagem para a Débora (15 min).
2. Tomar as decisões `[DECIDIR]` que são só suas (30 min).
3. Fase 1: contas e infraestrutura (a maior parte do dia).
4. Fase 2: spikes, só os que as contas já permitirem.
5. Atualizar o plano e fazer commit (15 min).

Regra de ouro: **nenhum segredo vai para o GitHub, nem em mensagem de commit, nem em print**. Senhas e tokens vão para um gerenciador de senhas (1Password, Bitwarden etc.) e depois, onde indicado, para a pasta `config/` do servidor.

---

## 1. Antes de começar (10 min)

1. Abra um gerenciador de senhas. Crie uma pasta/cofre chamado `Débora Lima: projeto`. Tudo que for gerado amanhã (senhas, tokens, client secret) entra aqui.
2. Crie um e-mail ou alias exclusivo para a conta-robô do GitHub, por exemplo `deboralima-bot@seudominio` `[DECIDIR]` qual e-mail usar. O GitHub não deixa criar duas contas com o mesmo e-mail.
3. Tenha à mão: acesso de administrador da organização `kayrahub-ops` no GitHub, o painel da Locaweb da KAYRÁhub e uma conta Google da KAYRÁhub para o Google Cloud.
4. Abra o `docs/PLANO-DE-EXECUCAO.md`. Quando terminar uma tarefa, troque `- [ ]` por `- [x]`.

---

## 2. Passo 1: mensagem para a Débora (15 min) **[SOZINHO, mas destrava o resto]**

Copie o texto da Parte 4, cole no WhatsApp dela e envie. Pronto. Não espere resposta para seguir.

Por que primeiro: o ensaio fotográfico, o e-mail Google e as respostas do questionário são os itens com **maior risco de demora**, porque dependem da agenda dela.

---

## 3. Passo 2: decisões que são suas (30 min) **[SOZINHO]** (tarefa 0.10)

Abra `docs/ARQUITETURA.md`, seção 2. Decida e escreva a decisão na tabela, trocando o `[DECIDIR]`:

| Decisão | O que significa em português | Sugestão (padrão do doc) |
|---|---|---|
| D-08 frequência do build agendado | De quanto em quanto tempo o site olha se há post agendado para publicar | 1 vez por dia, 8h de Brasília |
| D-11 sublinhado | O Markdown não tem sublinhado. Ou criamos um marcador próprio (como no Meio Fio) ou não oferecemos | Não oferecer, a não ser que a Débora peça. Menos código para manter |
| D-13 atualização do PHP | Quem sobe a pasta `app/` do login: você manualmente ou o robô de deploy | Manual por você (padrão). É mais seguro e muda raramente |
| D-15 textos das páginas editáveis pelo painel | Se a Débora pode editar a página "Sobre" etc. sozinha ou só o blog | Só o blog (padrão). Se ela quiser mais, vira fase posterior |
| `[DECIDIR]` de MANUTENCAO.md | O que acontece após os 6 meses de garantia | Pode esperar; **mas decida antes do go-live**, porque o token vence depois da garantia |

Marque a tarefa 0.10 só quando as quatro primeiras estiverem preenchidas. A da manutenção pode ficar para a fase 12.

---

## 4. Passo 3: Fase 1, contas e infraestrutura (maior parte do dia)

Tudo aqui é **[SOZINHO]**, exceto a 1.6 se o domínio de teste depender de DNS que outra pessoa controla.

### 1.1 Criar os dois repositórios privados
1. GitHub → organização `kayrahub-ops` → **New repository**.
2. Nome `debora-lima-site`, visibilidade **Private**, marque "Add a README". Criar.
3. Repita com o nome `debora-lima-conteudo`.
4. Pronto quando: os dois aparecem na lista da organização com o cadeado.

Depois: traga para o `debora-lima-site` o que já existe aqui (`docs/`, `CLAUDE.md`, `design/`). O repositório atual `site_debora` pode virar o de código ou ficar como arquivo `[DECIDIR]`.

### 1.2 Criar a conta-robô do GitHub
1. Saia do GitHub (ou use janela anônima). Crie uma conta nova com o e-mail da Parte 1, nome de usuário tipo `kayrahub-bot-debora`.
2. **Ative a verificação em duas etapas (2FA)** na hora: Settings → Password and authentication. Guarde os códigos de recuperação no gerenciador de senhas.
3. Volte à sua conta de admin. No repo `debora-lima-conteudo` → Settings → Collaborators → convide a conta-robô com permissão **Write**.
4. **Não convide a conta-robô para o `debora-lima-site`.** Essa separação é a segurança do projeto.
5. Aceite o convite logado como robô.

### 1.3 Gerar o token fino da conta-robô
1. Logado como robô: Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Nome: `decap-conteudo`. Validade: **no máximo 12 meses** (anote a data de vencimento).
3. Resource owner: `kayrahub-ops`. Repository access: **Only select repositories** → só `debora-lima-conteudo`.
4. Permissões: **Contents: Read and write** e **Metadata: Read-only**. Nada de Workflows, Administration ou outras.
5. Gere e **copie o token uma única vez** para o gerenciador de senhas. Ele só aparece agora.
6. Anote o vencimento em `docs/MANUTENCAO.md` e crie um lembrete no calendário para 30 dias antes.
Este token só vai para `config/` no servidor (passo 1.7/spike S1). Nunca para o Git.

### 1.4 Token de disparo do build
Serve para o repo de conteúdo avisar o repo de código que há post novo.
1. Na **sua** conta (não na do robô): fine-grained token, só o repo `debora-lima-site`, permissão **Actions: Read and write**, validade ≤ 12 meses.
2. No repo `debora-lima-conteudo` → Settings → Secrets and variables → Actions → New repository secret, nome `DISPARO_BUILD`, valor o token.
3. `[VALIDAR]` no spike S6 se essa permissão mínima basta.

### 1.5 Segurança dos repositórios
Nos dois repos: Settings → Code security → ligue **Dependabot alerts** e **Dependabot security updates**. Na organização: exija 2FA para todos os membros (Settings da organização → Authentication security).

### 1.6 Subdomínio de teste na Locaweb
1. Painel da Locaweb → Hospedagem → Domínios/Subdomínios → criar `teste.kayrahub.com.br` apontando para uma pasta própria (por exemplo `teste`).
2. Instale o certificado **Let's Encrypt** pelo painel.
3. Pronto quando `https://teste.kayrahub.com.br` abre com cadeado (mesmo mostrando página em branco).
`[VALIDAR]` se o DNS do `kayrahub.com.br` está na Locaweb; se estiver em outro lugar (Registro.br, Cloudflare), crie o registro lá.

### 1.7 Diagnóstico da hospedagem
O plano cita um `diagnostico-locaweb.php`. **Ele não está no repositório.** Procure no `meio_fio` ou nos arquivos da KAYRÁhub. Se não existir, pergunte ao João/Fabiano ou crie um arquivo mínimo que mostre `phpversion()`, extensões `curl` e `openssl` e as permissões das pastas. Suba, abra no navegador, copie o resultado para `docs/diagnostico-locaweb.md` **e apague o arquivo do servidor no mesmo momento** (é uma página que expõe informação do servidor).

### 1.8 Versão do PHP
No painel da Locaweb, escolha a versão **mais nova** disponível para o subdomínio de teste. Anote qual em `docs/ARQUITETURA.md`.

### 1.9 Conta SFTP/FTPS exclusiva do deploy
1. Painel → FTP/SFTP → criar usuário `deploy-debora`, restrito à pasta do site (se o painel permitir).
2. Guarde usuário, senha, servidor e porta no gerenciador. Depois eles vão para os **secrets do repo de código** (nunca no código).
3. Anote se o painel oferece SFTP ou só FTPS. Isso decide o protocolo (spike S3). **FTP simples está proibido.**
Se a conta não puder ser limitada, anote isso: vira ponto de atenção na segurança.

### 1.10 Google Cloud e login
1. https://console.cloud.google.com → criar projeto `debora-lima-painel` (conta Google da KAYRÁhub).
2. APIs e serviços → **Tela de consentimento OAuth**: tipo **Externo**, nome do app `Painel Débora Lima`, e-mail de suporte seu. Escopos: apenas `openid` e `email`.
3. Se o app ficar em "Teste", só e-mails cadastrados como "usuários de teste" entram. Cadastre o e-mail da Débora **quando ela informar** `[DÉBORA]`. Para o uso real, publique o app (`[VALIDAR]` se o Google exige verificação para escopos básicos; para `openid` e `email` normalmente não).
4. Credenciais → Criar credenciais → **ID do cliente OAuth** → tipo **Aplicativo da Web**. URI de redirecionamento autorizada: `https://teste.kayrahub.com.br/auth/callback` (o caminho exato `[VALIDAR]` no spike S1).
5. Guarde **ID do cliente** e **chave secreta** no gerenciador. A chave secreta vai só para `config/` no servidor.

Marque no plano 1.1 a 1.10 conforme concluir.

---

## 5. Passo 4: Fase 2, spikes (o que dá para fazer amanhã)

Spike = teste curto para provar que uma peça funciona **antes** de construir em cima. Ordem sugerida, do que depende menos ao que depende mais:

| Spike | Depende de | Dá para amanhã? |
|---|---|---|
| S2 build com dois repos, só `.md`, `.json` e imagens | 1.1 e acesso ao `meio_fio` | Sim, se liberar o `meio_fio` |
| S4 agendamento (post futuro some e aparece) | S2 | Sim, logo depois do S2 |
| S3 deploy SFTP/FTPS | 1.6 e 1.9 | Sim, se 1.6 e 1.9 saírem |
| S5 `.htaccess` e CSP | 1.6 e S3 | Provável |
| S6 push no conteúdo dispara build | 1.4 e S2 | Provável |
| S1 login completo com o Decap | 1.2, 1.3, 1.10 e PHP no teste | É o mais difícil; deixe para o fim ou para o dia seguinte |

Como pedir isso ao Claude Code: abra uma sessão no `debora-lima-site`, cole o trecho do spike do `ARQUITETURA.md` seção 10 e escreva "faça só o spike S2 e registre o resultado em `docs/SPIKES.md`". **Um spike por vez**, sempre marcando o checkbox correspondente. Se um spike falhar, **pare** e anote o plano B antes de seguir (critério de pronto da fase 2).

Ao fim: tarefa 2.7, registrar resultados e preencher a seção "Comandos" do `CLAUDE.md`.

---

## 6. Passo 5: fechar o dia (15 min)

1. Atualize os checkboxes em `docs/PLANO-DE-EXECUCAO.md`.
2. Rode o medidor do `CLAUDE.md` e anote o número.
3. Verifique que **não há segredo** em nenhum arquivo (`git grep -nE "ghp_|github_pat_|GOCSPX|BEGIN .* KEY"` deve voltar vazio).
4. Faça commit pequeno, em português, e envie.
5. Olhe a mensagem da Débora: respondeu? Se não, não cobre ainda, siga.

---

## 7. O que dá para fazer SEM perguntar nada à Débora

| Item | Tarefa |
|---|---|
| Decisões internas (D-08, D-11, D-13, D-15) | 0.10 |
| Todas as contas e infraestrutura | 1.1 a 1.10 (exceto cadastrar o e-mail dela no Google) |
| Todos os spikes, usando um e-mail seu como teste de login | 2.1 a 2.7 |
| Mapa do site e rascunho de estrutura das páginas | 3.1 |
| Metadados, `sitemap.xml`, `robots.txt` | 3.5 |
| Rascunho da política de privacidade | 3.6 |
| Esqueleto Eleventy, filtros, pipeline de imagens | 5.1 |
| Blog completo (coleção, visibilidade, RSS, validação) com posts de teste | 6.1 a 6.6 |
| Painel Decap e login PHP (com e-mail de teste) | 7.1 a 7.6 |
| Cabeçalhos `.htaccess`, página 404, favicon | 2.5, 5.7 |
| Segurança e testes de abuso | fase 8 |

## 8. O que VIRA GARGALO por depender da Débora

Ordenado do maior risco para o menor:

| # | O que | Bloqueia | Risco |
|---|---|---|---|
| 1 | Respostas do questionário (Apêndice A) | Textos das páginas (3.2 a 3.4) e, por tabela, design final, aprovação e go-live | **Alto.** Texto só da cabeça dela; sem isso o site vai com lacunas |
| 2 | Ensaio fotográfico e fotos de marcos | Design final (4.3 a 4.5) e Home | **Alto.** O design atual usa fotos provisórias |
| 3 | Aprovação de textos e visual | Fases 10 e 11 | **Alto.** Cada rodada de ajuste pode levar dias |
| 4 | Compra do domínio em nome dela | Go-live (11.x) e URIs do Google | **Médio.** Registro.br exige CPF dela e pagamento; pode demorar |
| 5 | E-mail Google que entrará na lista | Spike S1 com conta real, 7.x e 9.5 | **Médio, mas simples.** Se for conta pessoal sem 2FA, pedir para ativar |
| 6 | Telefone/WhatsApp e e-mail públicos | Contato (5.4) | **Baixo, rápido** |
| 7 | Confirmar graduação em RH (2010) e links Lattes/dissertação | Página de formação | **Baixo** |
| 8 | Sessão de uso sozinha do painel | 10.3 | **Médio.** Exige agenda dela |

Dica: itens 1 e 2 são os de maior prazo. Se ela estiver sobrecarregada, ofereça **responder por áudio** de WhatsApp, e você transcreve. Evita o formulário em branco.

---

## 9. Possíveis gargalos do SEU lado (e como se adiantar)

1. **Acesso ao `meio_fio`.** A tarefa 5.1 e o spike S2 dependem dele. Confirme se o repositório está acessível e se você lembra como ele funciona (filtros, imagens, CSP). *Adiante:* leia o README dele e liste o que será reaproveitado.
2. **Spike S1 (login com Decap) é o ponto mais incerto.** O próprio plano marca como `[VALIDAR]` se o Decap aceita o token fino da conta-robô e o formato do `/auth`. Se não aceitar, o plano B é uma GitHub App ou um proxy PHP (`api_root`). *Adiante:* reserve meio dia só para isso e não deixe para a última semana.
3. **Locaweb compartilhada:** PHP pode ter `allow_url_fopen`, `open_basedir` ou limites de execução que atrapalham a chamada ao Google. *Adiante:* o diagnóstico (1.7) mostra isso cedo. Sem `curl` ou `openssl`, o login precisa de outro desenho.
4. **Pasta acima da `public`.** O plano assume que dá para criar `config/` e `app/` fora do site. O suporte confirmou (0.2), mas a conta SFTP restrita pode não alcançar essas pastas (D-13). *Adiante:* teste na 1.9 se a conta restrita enxerga só `public`; se sim, o upload de `app/` fica manual.
5. **CSP estrita vs. design atual.** O design do Fabiano usa estilos inline e Google Fonts. Para a CSP (`style-src 'self'`) isso precisa virar CSS em arquivo e as fontes precisam ser hospedadas por nós (Bricolage Grotesque, Literata e Roboto Serif são livres, mas confirme a licença e baixe os arquivos `.woff2`). É trabalho de conversão grande. *Adiante:* combine com o Fabiano que o handoff (4.7) chegue com **tokens e CSS em classes**, não só telas.
6. **Animações do design (SVG, blobs, textos em órbita).** Pesam e podem ferir `prefers-reduced-motion` e acessibilidade. *Adiante:* decidir com o Fabiano o que fica na versão final.
7. **Revisão de texto pelo CFP (3.4).** Alguns textos do design já existem (por exemplo "Mestra pela USP", "Escuta formada na prática"). Todos precisam ser conferidos contra `docs/CFP-CONTEUDO.md`. A frase do design "Atendimento presencial e online" é segura; **frases de resultado ou de transformação precisam de cuidado**. Dúvida de texto vai para você, não para mim decidir sozinho.
8. **Quem é o "João" e quem é você.** O projeto divide tarefas entre João (back-end e segurança) e Fabiano (design). Se você é o João, praticamente toda a fase 1 e 2 é sua, o que concentra o risco em uma pessoa. *Adiante:* se puder, passe a 1.10 (Google Cloud) ou a escrita da política de privacidade a outra pessoa.
9. **Revisão jurídica da política de privacidade (3.6).** Precisa de alguém habilitado. Marque cedo quem vai revisar.
10. **Vencimento do token depois da garantia.** Já anotado em `MANUTENCAO.md`; decida o pós-garantia antes do go-live.
11. **Cansaço e troca de contexto.** Muitas contas novas, muitos segredos. Um erro típico é colar um token no lugar errado. *Adiante:* o gerenciador de senhas e o `git grep` de segredos do passo 6.

---

## 10. Mensagem pronta para enviar à Débora

> Oi, Débora, tudo bem? Estamos avançando com o seu site e precisamos de algumas informações suas para o texto e para a parte técnica. Pode responder por áudio, se for mais fácil. Sem pressa, mas quanto antes melhor.
>
> **Parte rápida (para hoje ou amanhã):**
> 1. Qual e-mail do Google (Gmail) você quer usar para entrar no painel onde vai publicar os textos do blog? Se puder, ative a "verificação em duas etapas" nessa conta, a gente te ajuda se precisar.
> 2. Qual número de WhatsApp (com DDD) e qual e-mail devem aparecer no site para contato?
> 3. Você já comprou, ou vai comprar, o domínio (o endereço do site)? Tem algum nome em mente? O registro precisa ficar no seu nome.
> 4. A graduação em Tecnologia em Gestão de RH (2010) deve aparecer na sua lista de formação, ou prefere deixar de fora?
> 5. Os links do seu Lattes e da sua dissertação estão abrindo normalmente para você?
> 6. Você confirma que não vai usar "Dra." (o título do mestrado é "Mestra")?
>
> **Fotos:**
> 7. Pode nos mandar o link da pasta com o ensaio fotográfico e das fotos dos marcos da sua carreira (formatura, eventos, etc.)?
>
> **Para os textos (pode responder em áudio, do seu jeito):**
> 8. Quais experiências mais moldaram a sua forma de trabalhar? Teve algum momento decisivo na sua carreira?
> 9. Quais as conquistas que você considera mais importantes?
> 10. Existe alguma causa ou discussão que você considera importante defender?
> 11. Que mudança você busca nas pessoas que atende? Se tivesse que resumir seu trabalho em uma frase, qual seria?
> 12. Quais são as principais demandas que chegam no consultório (em termos gerais, sem identificar ninguém)?
> 13. O que uma pessoa precisa saber antes da primeira consulta? Quais as dúvidas que mais aparecem?
> 14. Você tem materiais de supervisão ou eventos que gostaria de mostrar?
> 15. Quais sites, perfis ou pessoas te inspiram?
> 16. Tem algo que a gente não perguntou e que você gostaria que estivesse no site?
>
> Obrigado!

Observações para quem envia:
- Os itens 1 a 7 são rápidos e destravam trabalho técnico. Os itens 8 a 16 são os que mais demoram; se ela travar neles, peça para responder só 8, 11 e 13 primeiro.
- Não prometa data de entrega do site nesta mensagem.
- Se ela mandar casos ou relatos de pacientes sem querer, **não use**: o CFP proíbe, mesmo com autorização (`docs/CFP-CONTEUDO.md`).

---

## 11. Perguntas que são para o João/Fabiano (não para a Débora)

1. O `meio_fio` está acessível? Quem mantém?
2. Existe o arquivo `diagnostico-locaweb.php`? Onde?
3. O Fabiano vai entregar tokens e CSS em classes (sem estilos inline) e as fontes em `.woff2` licenciadas?
4. Quem revisa juridicamente a política de privacidade?
5. O repositório atual `site_debora` vira o `debora-lima-site` ou será arquivado?
6. Quem será dono dos repositórios e da hospedagem após a garantia (12.1)?

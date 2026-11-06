# Arquitetura: site da Débora Lima

## 1. Visão geral
Site institucional estático com blog. O painel de publicação é o Decap CMS (servido do próprio site). O login do painel é feito por um pequeno endpoint PHP na Locaweb, que autentica a Débora pelo **Google** e libera o painel sem que ela precise de conta no GitHub. Todo o resto é HTML gerado no GitHub Actions.

```
Débora → /admin/ (Decap) → "Entrar"
  → /auth (PHP) → login Google (só e-mails da lista)
  → /auth/callback (PHP) → entrega a credencial ao Decap (postMessage, origem fixa)
  → Decap grava o post (Markdown) no repo de CONTEÚDO
  → push no repo de conteúdo dispara o build no repo de CÓDIGO
  → Actions: Eleventy gera _site → SFTP/FTPS → Locaweb (pasta public)
```

## 2. Decisões
| ID | Decisão | Status |
|---|---|---|
| D-01 | Eleventy + blog em Markdown, reaproveitando a base do Meio Fio | Decidido |
| D-02 | Painel Decap servido do próprio site (sem CDN) | Decidido |
| D-03 | Hospedagem Locaweb compartilhada Linux (plano da KAYRÁhub); PHP só no login | Decidido |
| D-04 | Login por Google com lista de e-mails; só a Débora edita e publica | Decidido (e-mail a coletar) |
| D-05 | Dois repositórios privados: código e conteúdo | Decidido |
| D-06 | Conta-robô do GitHub (2FA) com token fino só no repo de conteúdo | Decidido; compatibilidade com Decap em `[VALIDAR]` (S1) |
| D-07 | Deploy por SFTP (preferido) ou FTPS a partir do Actions; FTP simples proibido | Protocolo em `[VALIDAR]` (S3) |
| D-08 | Agendamento: post com data futura + build agendado do Actions | Decidido; frequência em `[DECIDIR]` (padrão: diário às 8h de Brasília) |
| D-09 | Rascunho e revisão por campos `publicado` e `revisado` no post (não usa o fluxo editorial do Decap) | Decidido |
| D-10 | Editor com negrito, itálico, títulos, listas, citação, links e imagem; capa opcional | Decidido |
| D-11 | Sublinhado: não existe no Markdown padrão | `[DECIDIR]`: marcador próprio (como no Meio Fio) ou não oferecer |
| D-12 | Blog sem comentários, sem newsletter, sem analytics, sem formulário | Proposto; confirmar com a Débora |
| D-13 | Atualização do código PHP em `app/` (fora da pasta pública) | `[DECIDIR]`: manual pelo João (padrão) ou conta de deploy com acesso à raiz |
| D-14 | Domínio comprado pela Débora; homologação em `teste.kayrahub.com.br` | Decidido |
| D-15 | Textos das páginas institucionais editáveis pelo painel? | `[DECIDIR]` (padrão: só o blog) |
| D-16 | Garantia de 6 meses pela KAYRÁhub | Decidido |

### Por que não o fluxo editorial do Decap
O `editorial_workflow` trabalha com branches e pull requests no GitHub. Isso exige permissões maiores do token e deixa o estado do rascunho espalhado em branches. Dois campos no post (`publicado` e `revisado`) dão o mesmo resultado com menos peças.

## 3. Repositórios
**`debora-lima-site` (privado): código**
```
src/                 Eleventy: layouts, páginas institucionais, CSS, JS, fontes
src/admin/           Decap (config.yml e HTML do painel)
php/public/auth/     entradas do login (só repassam para app/)
php/app/             lógica do login (validação do token do Google, lista, limites)
design/              entrega do Fabiano (tokens e telas)
.github/workflows/   build e deploy
docs/                esta documentação
```
**`debora-lima-conteudo` (privado): conteúdo**
```
content/posts/       um .md por post
content/uploads/     imagens enviadas pelo painel
content/data/        (opcional) textos editáveis das páginas
.github/workflows/   só o disparo do build no repo de código
```
A conta-robô escreve **apenas** no repo de conteúdo. Ela não tem acesso ao repo de código nem permissão de Workflows. Por isso uma credencial vazada altera conteúdo, mas não o código de build nem os segredos de deploy.

## 4. Estrutura no servidor (Locaweb)
O site apresentado é a pasta `public`. O que fica acima dela não é acessível pela web.
```
/ (raiz da conta)
├── config/   segredos do login: client secret do Google, token da conta-robô, lista de e-mails.
│             Criados à mão (SFTP ou painel). NUNCA passam por Git ou Actions.
├── app/      lógica PHP do login
└── public/   site estático (deploy do Actions) + auth/ (entradas do login)
```
Se a conta de deploy for restrita a `public/`, o Actions não consegue atualizar `app/`. Ver D-13.

## 5. Fluxo de login (Google)
1. O Decap abre uma janela em `{base_url}/auth` (parâmetros do protocolo OAuth do Decap: `[VALIDAR]` no spike S1).
2. `/auth` gera `state`, `nonce` e PKCE, guarda em cookie `HttpOnly`, `Secure`, `SameSite=Lax` de vida curta, e redireciona ao Google com escopos `openid email`.
3. `/auth/callback` confere o `state`, troca o código no servidor (com o client secret) e **valida o ID token**: assinatura pelas chaves públicas do Google, `iss`, `aud`, `exp`, `nonce` e `email_verified`.
4. O e-mail precisa ser **igual** a um da lista (minúsculas, comparação exata). Fora da lista: página de erro amigável e registro da tentativa.
5. Se válido, a página devolve ao Decap, via `postMessage` com **origem fixa** (nunca `*`), a credencial da conta-robô lida de `config/`, e fecha a janela.
6. O callback não usa script inline: dados vão em atributo escapado e o script é um arquivo do próprio site (CSP `script-src 'self'`).
7. Limite de tentativas por IP e registro de acessos (sem dados além do necessário).

**Credencial entregue ao Decap (D-06):** token fino de GitHub da conta-robô, restrito ao repo de conteúdo, com Contents (leitura e escrita) e Metadata (leitura). Sem Workflows, sem Administration, validade máxima de 12 meses. `[VALIDAR]` se o Decap funciona com esse token (S1). Se não, testar uma credencial de GitHub App.
**Endurecimento opcional (fase posterior):** o Decap tem a opção `api_root`. Apontando para um proxy PHP nosso, a credencial real fica só no servidor e o navegador recebe uma sessão curta, com rotas e pastas limitadas. Mais código para manter; `[VALIDAR]` se o Decap aceita antes de decidir.

## 6. Visibilidade dos posts
Um post só aparece no site se **todas** as condições forem verdadeiras:
```
publicado == true  E  revisado == true  E  data <= agora (America/Sao_Paulo)
```
Rascunho = `publicado: false`. Agendado = `publicado: true` com `data` futura; entra no próximo build. `revisado` é a caixa de conformidade com o CFP, nos moldes da caixa "autorizada" do Meio Fio.

## 7. Build e deploy
- Workflow do repo de código: faz checkout do código e do conteúdo (token somente leitura do conteúdo), valida o conteúdo, roda `npm ci` e `npm run build`, e envia `_site/` por SFTP/FTPS para `public/`.
- Gatilhos: disparo manual, disparo vindo do repo de conteúdo (token fino com permissão **Actions** só no repo de código, guardado como secret do repo de conteúdo; `[VALIDAR]` em S6) e agendamento (D-08).
- Validação do conteúdo antes do build: só `.md`, `.json` e imagens; front matter no padrão; nomes de arquivo simples (sem `..`); tamanho máximo de imagem.
- Imagens passam pelo pipeline do Meio Fio (WebP/JPEG, sem EXIF/GPS).
- Remover arquivos órfãos no servidor só com confirmação do João no primeiro deploy.

## 8. Cabeçalhos (`.htaccess`, com `mod_headers`)
Portar do `netlify.toml` do Meio Fio: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- **CSP pública:** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests`.
- **CSP de `/admin/`:** a do Meio Fio, com `'unsafe-eval'` e estilos inline só ali, mais `connect-src` para `https://api.github.com`. `Cache-Control: no-store` e `X-Robots-Tag: noindex, nofollow`.
- **`/auth/`:** CSP pública, `no-store`, `noindex`.
- Bloquear acesso web a `.git`, `.env`, `*.md` de documentação e listagem de diretórios. Redirecionar HTTP para HTTPS e padronizar www/sem www.

## 9. Riscos e mitigação
| Risco | Mitigação |
|---|---|
| Credencial da conta-robô vazar do navegador | Escopo só no repo de conteúdo; sem Workflows; validade ≤ 12 meses; trocar se um dispositivo for perdido |
| Alguém editar o código de build | Conta-robô sem acesso ao repo de código; conteúdo tratado como dado; build recusa tipos de arquivo inesperados |
| XSS por post | HTML cru desligado; escape em título, resumo e alt; CSP sem scripts inline |
| E-mail Google indevido entrar | Lista com comparação exata, `email_verified`, 2FA recomendado na conta Google da Débora |
| Token expirar após a garantia | Runbook de renovação em `MANUTENCAO.md` e lembrete no calendário |
| PHP desatualizado | Escolher a versão mais nova no painel; revisar a cada trimestre |
| FTP sem criptografia | Proibido; só SFTP/FTPS |

## 10. Pontos a validar (spikes da fase 2)
- **S1** Login completo com o Decap, token fino da conta-robô e parâmetros do protocolo do `/auth`.
- **S2** Build com dois repositórios, aceitando apenas arquivos de conteúdo permitidos.
- **S3** Deploy por SFTP ou FTPS com a conta restrita.
- **S4** Agendamento (post futuro oculto e publicado no build seguinte).
- **S5** `.htaccess`: CSP pública e do `/admin/` e `/auth/` sem violações no console.
- **S6** Disparo do build pelo repo de conteúdo com permissão mínima.

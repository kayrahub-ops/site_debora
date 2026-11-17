# Deploy seguro: site da Débora Lima

Rascunho de pipeline (CI/CD) para o repositório de código `debora-lima-site`. **É um modelo:** ainda não existe build Eleventy, e os itens `[VALIDAR]` dependem do servidor da KAYRÁhub e dos spikes S2, S3 e S6 do plano.

## 1. Diagnóstico e suposições
- **Tipo:** site estático (Eleventy) com painel Decap. Só o login do painel usa PHP.
- **Onde roda:** hospedagem compartilhada da KAYRÁhub (Apache, PHP, SFTP). Se ela não passar nos testes, o plano B é a Locaweb. O pipeline é o mesmo, só mudam os segredos.
- **CI:** GitHub Actions (já decidido).
- **Downtime:** alguns segundos são aceitáveis. Por isso não usamos blue/green nem canary, que seriam exagero para um site institucional.
- **Quem publica:** a Débora, pelo painel, sem conta no GitHub. Isso pesa nas escolhas abaixo.

## 2. Plano em linguagem simples
```
Débora salva um post no painel
  → push no repo de CONTEÚDO → dispara o build no repo de CÓDIGO
Repo de CÓDIGO:
  verificar (lint, segredos, validar conteúdo, audit)
  → build (Eleventy gera _site, vira um artefato)
  → deploy (SFTP para a pasta public do servidor)
  → verificação (abre o site e confere os cabeçalhos)
```
O mesmo artefato que passou na verificação é o que vai para o servidor. Não se reconstrói no meio do caminho.

## 3. O que cada parte faz (e por quê)
- **`permissions: {}` no topo:** o workflow nasce sem nenhum poder. Cada job pede só o que precisa. Sem isso, um passo comprometido (caso tj-actions, 2025) poderia mexer no repositório.
- **Actions por SHA completo:** a tag `@v4` é só um apelido que pode ser movido para código malicioso (casos tj-actions e Trivy). O SHA é a impressão digital exata de uma versão.
- **`persist-credentials: false`:** impede que o token do GitHub fique gravado dentro da pasta `.git` e vaze (caso ArtiPACKED).
- **Conteúdo é dado não confiável:** o conteúdo vem de outro repositório, onde a conta-robô escreve. O build só aceita `.md`, `.json` e imagens (regra 3 do `CLAUDE.md`). Um `.js` plantado ali reprova o build.
- **Texto de post nunca entra direto em `run:`:** se um dia o workflow usar título de post ou mensagem de commit, passe por variável de ambiente. Isso evita injeção de comando.
- **`npm ci --ignore-scripts`:** instala só o que o lockfile manda e não roda scripts de instalação de pacotes (porta dos worms tipo Shai-Hulud).
- **SFTP com a chave do servidor fixada:** o runner só se conecta se o servidor for o esperado. Sem isso, alguém no meio do caminho poderia receber a senha.
- **Sem action de terceiros para o deploy:** o envio usa `lftp` do repositório da própria distribuição do runner. É uma dependência a menos para ser adulterada.

## 4. Arquivo pronto (modelo): `.github/workflows/deploy.yml`
Preencha os `<SHA-COMPLETO...>` conforme a seção 6. Não invente valores.

```yaml
name: build-e-deploy

on:
  push:
    branches: [main]
  repository_dispatch:
    types: [conteudo-atualizado]     # disparado pelo repo de conteúdo
  schedule:
    - cron: "0 11 * * *"             # 8h de Brasília (UTC-3); decisão D-08
  workflow_dispatch:
    inputs:
      apagar_orfaos:
        description: "Apagar no servidor o que não existe mais no site (só após conferir)"
        type: boolean
        default: false

permissions: {}

concurrency:
  group: deploy-debora
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@<SHA-COMPLETO-DE-40-CARACTERES> # vX.Y.Z (confirmar)
        with:
          persist-credentials: false

      - name: Baixar o conteúdo (token SOMENTE LEITURA)
        uses: actions/checkout@<SHA-COMPLETO-DE-40-CARACTERES> # vX.Y.Z (confirmar)
        with:
          repository: kayrahub-ops/debora-lima-conteudo
          token: ${{ secrets.CONTEUDO_READ_TOKEN }}
          path: conteudo
          persist-credentials: false

      - uses: actions/setup-node@<SHA-COMPLETO-DE-40-CARACTERES> # vX.Y.Z (confirmar)
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Instalar dependências (só o que o lockfile manda)
        run: npm ci --ignore-scripts

      - name: Validar o conteúdo (só .md, .json e imagens; front matter no padrão)
        run: node scripts/validar-conteudo.mjs conteudo   # a criar (tarefa 6.6 / S-17 a S-21)

      - name: Auditar dependências
        run: npm audit --audit-level=high

      # [VALIDAR] scan de segredos: gitleaks pelo binário oficial, com versão e checksum
      # conferidos. A gitleaks-action exige licença em repositórios de organização.

      - name: Build
        run: npm run build
        env:
          CONTEUDO_DIR: conteudo

      - uses: actions/upload-artifact@<SHA-COMPLETO-DE-40-CARACTERES> # vX.Y.Z (confirmar)
        with:
          name: site
          path: _site
          retention-days: 14        # guarda 14 dias de versões para rollback

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: producao           # ver nota 5.2: restrito à main, sem revisor
    permissions:
      contents: read
    steps:
      - uses: actions/download-artifact@<SHA-COMPLETO-DE-40-CARACTERES> # vX.Y.Z (confirmar)
        with:
          name: site
          path: _site

      - name: Instalar lftp
        run: sudo apt-get update && sudo apt-get install -y lftp

      - name: Fixar a chave do servidor
        run: |
          mkdir -p ~/.ssh
          printf '%s\n' "$SFTP_HOST_KEY" > ~/.ssh/known_hosts
        env:
          SFTP_HOST_KEY: ${{ secrets.SFTP_HOST_KEY }}   # linha known_hosts do servidor

      - name: Enviar por SFTP
        env:
          SFTP_HOST: ${{ secrets.SFTP_HOST }}
          SFTP_USER: ${{ secrets.SFTP_USER }}
          SFTP_PASS: ${{ secrets.SFTP_PASS }}
          APAGAR: ${{ inputs.apagar_orfaos }}
        run: |
          DEL=""
          if [ "$APAGAR" = "true" ]; then DEL="--delete"; fi
          lftp -e "set sftp:auto-confirm no; set net:max-retries 2; \
            open -u \"$SFTP_USER\",\"$SFTP_PASS\" sftp://$SFTP_HOST; \
            mirror --reverse --only-newer $DEL --parallel=4 _site public; bye"
        # [VALIDAR] se o servidor aceita chave SSH no lugar de senha (preferível).
        # [VALIDAR] se só há FTPS: trocar sftp:// por ftps:// e ssl:verify-certificate yes.

      - name: Verificar o site no ar e os cabeçalhos
        env:
          SITE_URL: ${{ vars.SITE_URL }}
        run: |
          curl -fsS --max-time 20 -o /dev/null "$SITE_URL/"
          curl -fsSI --max-time 20 "$SITE_URL/" | grep -i '^content-security-policy:'
          curl -fsSI --max-time 20 "$SITE_URL/" | grep -i '^x-content-type-options:'
```

## 5. Escolhas que merecem explicação
1. **Por que não usar Netlify em produção:** o login do painel é PHP e não roda lá. O link do Netlify serve só para a Débora aprovar o visual e deve ser apagado no go-live.
2. **Por que o ambiente `producao` não tem revisor obrigatório:** o botão "aprovar" travaria toda publicação da Débora, e ela não tem conta no GitHub. A barreira humana aqui é a caixa `revisado` do post e a proteção da branch `main`. O ambiente fica restrito à `main` (Settings → Environments → Deployment branches). **Decisão sua:** se preferir aprovar cada deploy, os posts agendados e os da Débora só saem depois do seu clique.
3. **O deploy não é atômico:** o `lftp` envia arquivo por arquivo. Durante alguns segundos o site pode misturar páginas novas e antigas. Para um site de leitura isso é aceitável. Se incomodar, a alternativa é enviar para uma pasta ao lado e renomear (`[VALIDAR]` se o servidor permite renomear pastas por SFTP).
4. **Apagar órfãos:** fica desligado por padrão e só roda com a caixa marcada no disparo manual. O `CLAUDE.md` pede sua confirmação no primeiro deploy.

## 6. Como preencher os SHAs (sem inventar)
Eu não consegui resolver os SHAs daqui (a sessão não tem acesso a `actions/*`), então deixei marcadores. No seu computador:
```bash
gh api repos/actions/checkout/releases/latest --jq .tag_name
```
```bash
gh api repos/actions/checkout/commits/<TAG-QUE-APARECEU> --jq .sha
```
Repita para `actions/setup-node`, `actions/upload-artifact` e `actions/download-artifact`, e copie o SHA de 40 caracteres com a versão em comentário. A ferramenta `pinact` faz isso para o arquivo todo. Confira que o SHA pertence a uma release do repositório oficial (ataque "imposter commit").

## 7. Segredos: onde cada um vive
| Segredo | Onde fica | Observação |
|---|---|---|
| `SFTP_HOST`, `SFTP_USER`, `SFTP_PASS` ou chave, `SFTP_HOST_KEY` | Secrets do **environment** `producao`, no repo de código | Conta exclusiva de deploy, restrita ao site |
| `CONTEUDO_READ_TOKEN` | Secrets do repo de código | Fine-grained, só leitura, só o repo de conteúdo |
| `DISPARO_BUILD` | Secrets do repo de conteúdo | Permissão Actions só no repo de código |
| Token da conta-robô do Decap, client secret do Google | **Nunca no GitHub**: `config/` no servidor | Criados à mão |
Nada disso vem para o chat. Se algum for colado em mensagem, trate como vazado e gere outro.

## 8. Checklist de segurança do workflow
**Aplicado no modelo**
- [x] `permissions: {}` no topo e permissões por job
- [x] `persist-credentials: false` nos checkouts
- [x] Instalação reprodutível: `npm ci --ignore-scripts`
- [x] `concurrency`: dois deploys não rodam juntos
- [x] Conteúdo tratado como dado, validado antes do build
- [x] Sem `pull_request_target` e sem texto externo em `run:`
- [x] Chave do servidor fixada; sem FTP simples
- [x] Segredos só em Secrets, nunca em `echo`
- [x] Verificação pós-deploy (site no ar e cabeçalhos)

**Depende de você configurar no GitHub ou preencher**
- [ ] SHAs reais nas actions (seção 6) e allowlist de actions na organização
- [ ] Rulesets na `main` dos dois repos: PR obrigatório, checks obrigatórios, sem force push
- [ ] `CODEOWNERS` cobrindo `.github/workflows/`, `scripts/`, `CLAUDE.md`, `docs/`
- [ ] Ambiente `producao` restrito à `main`
- [ ] Dependabot com `cooldown` para `github-actions` e `npm`
- [ ] `actionlint` e `zizmor` no CI (pinados), mais o scan de segredos (`gitleaks`, versão verificada)
- [ ] Secret scanning e push protection ativos nos dois repos
- [ ] 2FA para todos os membros; conta Google da Débora com verificação em duas etapas
- [ ] Criar `scripts/validar-conteudo.mjs` e `.nvmrc`

## 9. Como reverter se algo der errado
- **Deploy ruim:** no GitHub → Actions → abra uma execução anterior que deu certo → "Re-run all jobs". O artefato de até 14 dias é reenviado. Alternativa: `git revert` do commit problemático na `main` e novo deploy.
- **Post errado:** editar no painel ou reverter o commit no repo de conteúdo.
- **Contingência:** enviar manualmente o último `_site` bom pelo gerenciador de arquivos do servidor.
- **Segredo vazado:** pare os workflows, gere de novo todos os segredos do pipeline, confira se há workflow novo ou alterado, e só então reative.
- **Nunca testado = não funciona:** simule um rollback no teste antes do go-live.

## 10. Próximos passos
1. Decidir a nota 5.2 (deploy com ou sem aprovação) e o protocolo SFTP ou FTPS, que o spike S3 confirma no servidor.
2. Criar o `debora-lima-site`, ligar os rulesets, o `CODEOWNERS` e o Dependabot, **antes** do primeiro workflow.
3. Rodar os spikes S2, S3 e S6 com este modelo no ambiente de teste, ajustar e só então apontar para o domínio final.

## 11. O que ficou de fora de propósito
Blue/green, canary, Kubernetes, Docker e assinatura de imagens: não se aplicam a um site estático em hospedagem compartilhada. Também não há Modo B (agente de IA abrindo PR), porque o projeto não tem tickets de infraestrutura. Se um dia um agente editar o repositório, valem as regras da seção 7 da skill: instruções vindas da `main`, sem segredos e com revisão humana.

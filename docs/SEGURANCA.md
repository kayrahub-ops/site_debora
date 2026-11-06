# Checklist de segurança: site da Débora Lima

Marque cada item com a evidência (comando, captura ou link do commit). Modelo: `docs/seguranca.md` do repo `meio_fio`.

## Segredos
- [ ] S-01 Nenhum segredo (client secret do Google, tokens, senhas SFTP) no código nem no histórico dos dois repos
- [ ] S-02 `.gitignore` bloqueia `.env`, `*.pem`, `*.key`, `config/`
- [ ] S-03 Segredos do login só em `config/` no servidor, acima de `public`, com permissão restrita
- [ ] S-04 Segredos do deploy só nos secrets do GitHub, nunca em logs
- [ ] S-05 Tokens com validade anotada em `MANUTENCAO.md` e lembrete de renovação criado

## Contas e repositórios
- [ ] S-06 Repositórios privados; 2FA obrigatório para todos os membros
- [ ] S-07 Conta-robô sem acesso ao repo de código e sem permissão de Workflows
- [ ] S-08 Token fino restrito ao repo de conteúdo (Contents RW, Metadata R)
- [ ] S-09 Dependabot e alertas de segurança ativos nos dois repos
- [ ] S-10 Conta Google da Débora com verificação em duas etapas (orientar e confirmar)

## Login
- [ ] S-11 `state`, `nonce` e PKCE; cookie `HttpOnly`, `Secure`, `SameSite=Lax`, vida curta
- [ ] S-12 ID token validado: assinatura, `iss`, `aud`, `exp`, `nonce` e `email_verified`
- [ ] S-13 Lista de e-mails com comparação exata; e-mail fora da lista é recusado
- [ ] S-14 `postMessage` com origem fixa, nunca `*`
- [ ] S-15 Limite de tentativas por IP e registro de acessos
- [ ] S-16 Erros do login sem detalhes técnicos para quem tenta entrar

## Conteúdo e build
- [ ] S-17 Build aceita só `.md`, `.json` e imagens do repo de conteúdo; nada é executado a partir dele
- [ ] S-18 Markdown sem HTML cru; links só `https://`; título, resumo e `alt` escapados
- [ ] S-19 Front matter validado; build falha se estiver fora do padrão
- [ ] S-20 Imagens recomprimidas e sem EXIF/GPS; limite de tamanho aplicado
- [ ] S-21 Nomes de arquivo sem `..` e sem caracteres especiais

## Servidor e cabeçalhos
- [ ] S-22 HTTPS em tudo, redirecionamento de HTTP e padronização de www; HSTS
- [ ] S-23 Cabeçalhos de segurança presentes (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`)
- [ ] S-24 CSP pública sem `unsafe-inline` nem `unsafe-eval`; exceção só em `/admin/`
- [ ] S-25 Acesso web bloqueado a `.git`, `.env`, documentação e listagem de diretórios
- [ ] S-26 `/admin/` e `/auth/` com `noindex` e `no-store`
- [ ] S-27 Versão do PHP a mais nova disponível; revisão trimestral
- [ ] S-28 Deploy somente por SFTP ou FTPS; FTP simples desativado
- [ ] S-29 Arquivo de diagnóstico removido do servidor

## Privacidade e LGPD
- [ ] S-30 Páginas públicas sem cookies, analytics, pixels, embeds ou fontes externas
- [ ] S-31 Contato só por WhatsApp e e-mail; nenhum formulário que colete dados
- [ ] S-32 Política de privacidade publicada e revisada
- [ ] S-33 O painel guarda apenas o necessário (e-mail da lista e registro de acesso)

## Testes de abuso (evidência obrigatória)
- [ ] S-34 Login com e-mail fora da lista é recusado
- [ ] S-35 `state` inválido e código reutilizado são recusados
- [ ] S-36 Post com `<script>` no título e no corpo não executa
- [ ] S-37 Arquivo `.js` colocado no repo de conteúdo é ignorado ou reprova o build
- [ ] S-38 `curl -sI` no site e no `/admin/` mostra os cabeçalhos esperados (CSP diferente entre os dois)

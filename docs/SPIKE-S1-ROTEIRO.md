# Roteiro do Spike S1: o painel aceita o login que vamos construir?

Escrito para quem está aprendendo enquanto faz. Todo termo técnico é explicado na primeira vez em que aparece. Há também um glossário no fim.

---

## 1. O que é "fazer o spike S1"?

- **Spike** vem do inglês e significa "espeto" ou "ponta". Na prática, em software, é **um teste curto e descartável para descobrir se uma ideia funciona antes de construir o sistema inteiro em cima dela**. Como furar um pedaço da parede com uma broca fina antes de decidir onde pendurar uma prateleira pesada.
- **S1** é só o nome dele: **S** de *spike*, **1** porque é o primeiro da lista (S1 a S6, no `docs/ARQUITETURA.md`, seção 10).
- **Descartável** quer dizer que o código deste teste **não vai para o site final**. O que fica é a resposta: "funciona" ou "não funciona, vamos pelo plano B".

### A pergunta que o S1 responde
Queremos que a Débora publique textos no blog **sem ter conta no GitHub**. O desenho é:

```
Débora abre o painel  →  entra com o Google  →  o nosso login confere o e-mail dela
   →  entrega ao painel a "chave" de uma conta-robô  →  o painel grava o texto no GitHub
```

O risco: **não sabemos se o painel (Decap) aceita a chave da conta-robô do jeito que planejamos.** Se não aceitar, descobrimos cedo (barato) e não depois de construir tudo (caro). Esse é o trabalho do S1.

### Por que dividimos o S1 em três etapas
O S1 completo tem muitas peças (Google, PHP, servidor). Para aprender e para achar defeitos mais fácil, testamos uma peça de cada vez:

| Etapa | O que testa | Onde | Precisa do Google? |
|---|---|---|---|
| **A** | O painel aceita a chave da conta-robô e consegue salvar um texto no GitHub? | No seu computador | Não |
| **B** | O texto salvo pelo painel passa no nosso validador (`validar-conteudo.mjs`)? | No seu computador | Não |
| **C** | O login com Google em PHP entrega a chave ao painel? | No servidor de teste | Sim |

**Hoje cobrimos A e B**, que já respondem a parte mais incerta. A etapa C (seção 8) depende de contas e de um servidor que ainda não existem, e do código PHP, que eu escrevo depois que A e B passarem.

---

## 2. Antes de começar

Você vai precisar de (tarefas 1.1 a 1.3 do plano):
- Uma conta do GitHub com permissão de administrador na organização `kayrahub-ops`.
- Uma **conta-robô** (uma segunda conta do GitHub que só o projeto usa; *bot* é "robô" em inglês). Se ainda não criou, siga o passo 1.2 do `docs/PLANO-AMANHA.md`.
- Um computador com **Node.js** (você já tem: rodou os testes) e **git**.
- Um **gerenciador de senhas** para guardar o token (explicado abaixo).

**Regra de ouro:** o token **nunca** vai para o chat, para um arquivo do projeto, para um print ou para o GitHub. Se escapar, a gente apaga o token e gera outro (leva 1 minuto). Por isso o teste usa um repositório e um token de teste, que depois são descartados.

---

## 3. Etapa A: o painel aceita a chave da conta-robô?

### Passo A1: criar um repositório de teste
**O que é um repositório (repository = "depósito")?** É a pasta de um projeto guardada no GitHub, com o histórico de todas as mudanças. Vamos criar um só para o teste, para não bagunçar o definitivo.

1. No GitHub, em `kayrahub-ops`, clique em **New repository**.
2. Nome: `debora-lima-conteudo-teste`. Marque **Private** (privado) e **Add a README file** (isso cria o ramo `main`, que o painel precisa encontrar).
3. Crie.
4. Em **Settings → Collaborators → Add people**, convide a conta-robô com permissão **Write** (escrita).
5. Saia da sua conta (ou use uma janela anônima), entre como robô e **aceite o convite**.

**Como saber que deu certo:** logado como robô, você consegue abrir o repositório de teste.

### Passo A2: criar o token de teste
**O que é um token (token = "ficha")?** Uma senha feita para programas, não para pessoas. Quem a tem consegue fazer, no GitHub, apenas o que ela permite. **Fine-grained token** (*fine-grained* = "de grão fino") é a versão em que você escolhe exatamente quais repositórios e quais permissões.

Logado como **conta-robô**:
1. Foto de perfil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Nome: `teste-s1`. **Validade: 7 dias** (é só um teste).
3. **Resource owner:** `kayrahub-ops`. **Repository access:** *Only select repositories* → só `debora-lima-conteudo-teste`.
4. **Permissions → Repository permissions:** **Contents: Read and write** e **Metadata: Read-only**. Nenhuma outra.
5. **Generate token** e **copie o valor agora**: o GitHub só mostra uma vez. Guarde no gerenciador de senhas.

`[VALIDAR]` Se o campo Resource owner não listar `kayrahub-ops`, a organização pode exigir aprovação de tokens finos (Settings da organização → Personal access tokens). Se for o caso, um administrador precisa aprovar o pedido. Anote o que aconteceu: isso já é um achado do spike.

### Passo A3: baixar o painel (Decap) para o teste
**O que é o Decap CMS?** CMS é *Content Management System* ("sistema de gerenciamento de conteúdo"): um painel onde se escreve sem mexer em código. Decap é um painel pronto, de código aberto, que grava os textos direto no GitHub. (Antes se chamava Netlify CMS.)

No terminal, dentro da pasta do projeto, entre na pasta do teste:

```bash
cd spikes/s1
```

Baixe o pacote do painel do **npm** (o "catálogo" público de pacotes de Node):

```bash
npm pack decap-cms
```

Isso cria um arquivo `decap-cms-<versão>.tgz` (um zip). Extraia e copie os arquivos para a pasta do painel:

```bash
tar -xzf decap-cms-*.tgz
```

```bash
cp package/dist/* admin/
```

Anote a versão baixada (aparece no nome do `.tgz`); vamos precisar dela no registro.

**Como saber que deu certo:** existe o arquivo `spikes/s1/admin/decap-cms.js`.
**Por que não usar um link da internet (CDN)?** Uma regra do projeto proíbe carregar código de terceiros nas páginas (regra 4 do `CLAUDE.md`). O painel precisa morar no nosso próprio servidor.

### Passo A4: conferir o `config.yml`
Abra `spikes/s1/admin/config.yml`. É o arquivo que diz ao painel *onde* salvar e *quais campos* um texto tem. Confira só a linha `repo:` e troque se o seu repositório de teste tiver outro nome. O resto já está pronto para os campos do nosso validador (título, data, resumo, tema, capa, `publicado`, `revisado`).

### Passo A5: ligar o servidor de teste
O arquivo `spikes/s1/servidor-teste.mjs` é um servidor mínimo **que roda só no seu computador**. **Localhost** (*local host* = "anfitrião local") é o nome do próprio computador; o endereço `http://localhost:8080` só abre aí.

Ele faz duas coisas:
1. mostra o painel em `http://localhost:8080/admin/`;
2. no endereço `/auth`, **finge ser o nosso login**: não pergunta nada ao Google e entrega a chave do robô direto. Assim isolamos a pergunta única da etapa A.

Ele lê o token de uma **variável de ambiente** (uma anotação temporária na memória daquela janela do terminal; desaparece quando você fecha a janela e não é gravada em arquivo). Volte à pasta do projeto e digite:

```bash
cd ~/site_debora
```

```bash
read -rs TOKEN_ROBO
```

Cole o token e aperte Enter. **Nada aparece na tela ao colar**: é de propósito (`-s` = *silent*, silencioso), para ninguém ver por cima do ombro.

```bash
export TOKEN_ROBO
```

```bash
node spikes/s1/servidor-teste.mjs
```

**Como saber que deu certo:** aparece `Servidor de teste em http://localhost:8080/admin/`. Deixe essa janela aberta. Para parar, `Ctrl+C`.

### Passo A6: entrar no painel
1. No navegador, abra `http://localhost:8080/admin/`.
2. Clique em **Login with GitHub**.
3. Uma **janelinha (popup)** abre e fecha sozinha. Isso é o painel trocando mensagens com o nosso `/auth` (veja "O que acontece por baixo" na seção 6).
4. O painel mostra **Textos do blog** (lista vazia).

| O que você vê | O que significa |
|---|---|
| Painel abre com "Textos do blog" | **Ótimo: o painel aceitou o token e leu o repositório.** |
| A janelinha abre e fica parada, ou nada acontece | Falha na troca de mensagens. Aperte F12, aba **Console**, e anote as mensagens em vermelho. |
| Erro dizendo que não encontrou ou não pode acessar o repositório | Nome do `repo:` errado, ou o token não cobre esse repositório. |
| Erro de permissão (403) | Faltou **Contents: Read and write**, ou a conta-robô não é *collaborator* com **Write**. |

### Passo A7: salvar um texto
1. Clique em **Novo Texto**.
2. Preencha: título `Texto de teste`, data e hora, resumo, tema (opcional) e um parágrafo no corpo. Marque **Publicado** e **Revisado**.
3. Clique em **Publicar** → **Publicar agora**.

No GitHub, abra o repositório de teste: deve existir uma pasta `content/posts/` com um arquivo `.md`, e o **commit** deve aparecer **em nome da conta-robô**.

**O que é um commit (commit = "registrar")?** Um "salvamento" no histórico do GitHub, com autor, data e descrição. **Branch (ramo)** é uma linha do histórico; `main` é a principal. Nosso painel grava direto em `main`, sem pedir aprovação de ninguém (decisão do projeto).

### Passo A8: enviar uma imagem
Crie outro texto, escolha uma **Imagem de capa** pequena (menos de 1 MB) e preencha **Descrição da capa**. Salve.
**Como saber que deu certo:** surge `content/uploads/<imagem>` no GitHub.

---

## 4. Etapa B: o texto salvo pelo painel passa no validador?

O validador (`scripts/validar-conteudo.mjs`) foi escrito *supondo* como o painel grava os arquivos. Agora vemos se a suposição estava certa.

Baixe uma cópia do repositório de teste para o seu computador (**clone** = "clonar": fazer uma cópia local). Faça fora da pasta do projeto:

```bash
git clone https://github.com/kayrahub-ops/debora-lima-conteudo-teste.git ~/conteudo-teste
```

Rode o validador sobre ela:

```bash
node scripts/validar-conteudo.mjs ~/conteudo-teste
```

Veja também como o painel escreveu o cabeçalho do texto. **Front matter** (*front matter* = "matéria da frente") é o bloco no topo do arquivo, entre duas linhas `---`, com título, data e outras informações:

```bash
cat ~/conteudo-teste/content/posts/*.md
```

| Resultado | O que significa |
|---|---|
| `Conteúdo ok: ...` | Painel e validador combinam. |
| `Conteúdo REPROVADO` com a lista | O painel escreveu algo diferente do esperado (por exemplo, um texto longo quebrado em duas linhas). **Isso não é erro seu**: é exatamente o tipo de descoberta que o spike procura. Copie a lista e o `cat` e me mande (sem tokens) para eu ajustar o validador ou o `config.yml`. |

---

## 5. Fechando o teste (limpeza)

Faça sempre, mesmo que tenha dado certo:
1. No terminal do servidor: `Ctrl+C`, depois feche a janela (a variável com o token some).
2. No GitHub, logado como robô: **Settings → Developer settings → Fine-grained tokens → `teste-s1` → Delete** (apagar/revogar).
3. Apague a cópia local, se quiser:

```bash
rm -rf ~/conteudo-teste
```

4. Opcional: apague o repositório de teste no GitHub.
5. Confirme que nenhum segredo entrou no Git do projeto:

```bash
git grep -nE "github_pat_|ghp_" || echo "limpo"
```

---

## 6. O que acontece por baixo (para entender, não para decorar)

Li o código do Decap 3.17.3 para confirmar o protocolo. Quando você clica em **Login with GitHub**:

1. O painel abre uma janela em `{base_url}/auth?provider=github&site_id=...`. É por isso que o `config.yml` tem `base_url` e `auth_endpoint`.
2. A janela precisa dizer ao painel "abri": ela envia a mensagem `authorizing:github` **usando `postMessage`** (`postMessage` = "enviar mensagem"; é o jeito de duas janelas do navegador conversarem).
3. O painel só aceita essa mensagem se vier da **origem** esperada. **Origem** é o endereço completo do site: protocolo + domínio + porta (por exemplo `http://localhost:8080`). Ele então devolve a mesma mensagem (um *handshake*, "aperto de mão": as duas partes confirmam que estão falando uma com a outra).
4. Só depois a janela envia `authorization:github:success:{"token":"...","provider":"github"}`, **apenas para a origem do painel** (nunca "para qualquer um", `*`).
5. O painel guarda o token e passa a usá-lo em cada chamada ao GitHub, no cabeçalho `Authorization: token <valor>`.

Isso confirma duas coisas do plano: o formato que o nosso login (PHP) precisa devolver, e que o painel envia o token no formato que os tokens finos do GitHub aceitam. **O que só o teste confirma:** se o GitHub deixa uma conta-robô com token fino fazer tudo o que o painel tenta (por isso a etapa A).

---

## 7. Critério de pronto (etapas A e B)

- [ ] O painel abre e lista o repositório de teste (A6)
- [ ] Um texto novo vira um commit em nome da conta-robô, direto na `main` (A7)
- [ ] Uma imagem de capa chega em `content/uploads/` (A8)
- [ ] O texto salvo passa no validador, ou já sabemos exatamente o que ajustar (B)
- [ ] Token de teste revogado e servidor parado (seção 5)
- [ ] Resultado registrado em `docs/SPIKES.md` (modelo abaixo)

**Se A falhar de forma que não dê para consertar** (por exemplo, o painel recusa o token fino mesmo com todas as permissões), os planos B do `docs/ARQUITETURA.md` seção 5 são: uma credencial de GitHub App, ou um proxy PHP que faz o commit no servidor. **Pare e me chame antes de escolher.** Escolher o plano B é uma decisão `[DECIDIR]` sua.

### Modelo de registro para `docs/SPIKES.md`
```
## S1: login e painel (etapas A e B)
Data:            Quem testou:
Versão do Decap: 
Etapa A: [ ] ok  [ ] falhou. Detalhe:
Etapa B: [ ] ok  [ ] falhou. Detalhe:
Achados (o que funcionou diferente do plano):
Decisão: seguir plano A / precisa ajustar / plano B
Etapa C: pendente (depende de 1.6, 1.8 e 1.10)
```

---

## 8. Etapa C (para depois): trocar o "login de mentira" pelo Google

Na etapa C, o `/auth` deixa de entregar a chave direto. Em vez disso (PHP, no servidor de teste):
1. manda a pessoa para o Google;
2. o Google devolve para o nosso `/auth/callback` (**callback** = "chamada de volta": o endereço para onde o Google manda a pessoa de volta);
3. o PHP **valida o ID token** (a prova de identidade que o Google entrega) e confere se o e-mail está na lista;
4. só então entrega a chave do robô ao painel, pelo mesmo `postMessage` da etapa A.

**Precisa estar pronto antes:** subdomínio de teste com HTTPS (1.6), PHP recente (1.8), projeto no Google Cloud com o cliente OAuth (1.10) e o PHP do login, que eu escrevo depois da etapa A.
**OAuth** (*Open Authorization* = "autorização aberta") é o padrão por trás do botão "Entrar com o Google".

### Armadilhas já conhecidas (para não perder tempo depois)
- **Cabeçalho `Cross-Origin-Opener-Policy` (COOP, "política de abertura entre origens").** O plano manda usá-lo em todo o site. Mas a janela de login passa pelo Google e volta. Com a configuração mais rígida (`same-origin`), o navegador **corta a ligação entre a janela de login e o painel** e o token nunca chega. Em `/admin/` e `/auth/` use `same-origin-allow-popups` no painel e não coloque COOP na janela de login. `[VALIDAR]` na etapa C e no spike S5.
- **Política de segurança de conteúdo (CSP, *Content Security Policy*).** A exceção do painel (`unsafe-eval`, estilos inline) vale **só** em `/admin/`. Confira no Console do navegador se aparecem bloqueios.
- **Chamadas a sites de terceiros.** O arquivo do painel contém menções a endereços externos. Na aba **Rede** (F12), veja se alguma chamada sai do nosso domínio além do GitHub. A regra 4 proíbe terceiros nas páginas **públicas**; no `/admin/` a conexão com `api.github.com` é prevista.

---

## 9. O que eu fiz e o que NÃO consegui testar

- **Testado por mim:** o servidor de teste sobe, responde o `/auth` com o formato certo, serve o painel e bloqueia tentativa de ler arquivos fora da pasta. Os 13 testes do validador passam.
- **Não testado por mim:** o painel de verdade conversando com o GitHub. Esta sessão não tem acesso ao GitHub nem a navegador logado. O protocolo foi conferido **lendo o código do Decap 3.17.3**, não executando-o. É por isso que a etapa A existe.

---

## Glossário

| Termo | Tradução direta | Na prática |
|---|---|---|
| Spike | espeto, ponta | Teste curto e descartável para descobrir se uma ideia funciona |
| CMS | sistema de gerenciamento de conteúdo | Painel para escrever sem mexer em código |
| Back-end | parte de trás | O que roda no servidor, que o visitante não vê |
| Repositório (repo) | depósito | Pasta do projeto no GitHub, com o histórico |
| Commit | registrar, confirmar | Um "salvamento" no histórico, com autor e data |
| Push | empurrar | Enviar commits ao GitHub |
| Branch | ramo | Linha do histórico; `main` é a principal |
| Clone | clonar | Copiar um repositório para o seu computador |
| Token | ficha | Senha para programas, com poderes limitados |
| Fine-grained token | token de grão fino | Token em que você escolhe repositório e permissões |
| Bot (conta-robô) | robô | Conta do GitHub usada só pelo projeto |
| OAuth | autorização aberta | Padrão do "Entrar com o Google" |
| Callback | chamada de volta | Endereço para onde o Google devolve a pessoa |
| Popup | janela que salta | Janelinha aberta pelo navegador |
| postMessage | enviar mensagem | Como duas janelas do navegador conversam |
| Origem (origin) | origem | Endereço completo: protocolo + domínio + porta |
| Handshake | aperto de mão | Troca combinada de mensagens para confirmar quem é quem |
| Localhost | anfitrião local | O seu próprio computador |
| Variável de ambiente | — | Anotação temporária na memória do terminal, some ao fechar |
| Front matter | matéria da frente | Bloco `---` no topo do texto com título, data etc. |
| npm | — | Catálogo público de pacotes do Node |
| CDN | rede de distribuição de conteúdo | Servidor de terceiros de onde páginas carregam arquivos (proibido aqui) |
| CSP | política de segurança de conteúdo | Regra do navegador sobre de onde a página pode carregar coisas |
| COOP | política de abertura entre origens | Regra que isola janelas umas das outras |
| PHP | — | Linguagem que roda no servidor; usada só no login |

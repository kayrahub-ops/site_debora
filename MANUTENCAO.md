# Manutenção e garantia: site da Débora Lima

## Garantia de 6 meses (KAYRÁhub)
Início: data do go-live (tarefa 12.4). Revisões previstas no mês 3 e no mês 6.
Cobre: correção de falhas do que foi entregue, atualização do PHP e das dependências, renovação do token de acesso e acompanhamento da Débora no uso do painel.
**`[DECIDIR]` (João):** o que acontece depois dos 6 meses. O token da conta-robô vale até 12 meses, então a renovação cai **depois** da garantia. Opções: contrato de manutenção, ou entregar à Débora o passo a passo e a titularidade dos acessos.

## Rotinas
| Quando | O quê |
|---|---|
| Todo mês | Conferir alertas do Dependabot; abrir o site e o painel; conferir que o último deploy passou |
| A cada 3 meses | Revisar a versão do PHP no painel da Locaweb; rodar `npm audit`; revisar o relatório de acessos do login |
| 30 dias antes do vencimento | Renovar o token da conta-robô |
| Todo ano | Renovação do domínio (Registro.br, em nome da Débora): avisar com antecedência |
| Sempre | Let's Encrypt renova sozinho (Locaweb); conferir o aviso de certificado |

## Renovar o token da conta-robô
1. Entrar no GitHub como conta-robô (2FA) e gerar um novo token fino: só o repo de conteúdo, Contents RW e Metadata R, validade ≤ 12 meses.
2. Atualizar o token em `config/` no servidor (SFTP).
3. Testar o login no painel e salvar um post de teste.
4. Revogar o token antigo.
5. Registrar a nova data de vencimento aqui e no calendário.

## Se um computador da Débora for perdido ou comprometido
1. Revogar o token da conta-robô e gerar outro (passos acima).
2. Pedir que ela troque a senha da conta Google e confira os dispositivos conectados.
3. Conferir o histórico de commits do repo de conteúdo e o registro de acessos do login.

## Desfazer uma publicação (rollback)
- **Texto errado em um post:** editar no painel e salvar; ou, no repo de conteúdo, reverter o commit (`git revert`). O build seguinte atualiza o site.
- **Site quebrado após um deploy:** no repo de código, refazer o deploy de um commit anterior (re-executar o workflow no commit bom) ou reverter o commit com problema.
- **Contingência:** enviar manualmente o último `_site` bom pelo gerenciador de arquivos do painel da Locaweb.

## Atualizar o código PHP do login (`app/`)
Segundo D-13: o João envia `app/` manualmente quando houver mudança (a conta de deploy automático não alcança essa pasta). Depois, testar o login completo.

## Quando a Débora comprar ou trocar o domínio
Atualizar: DNS, Let's Encrypt, URIs de redirecionamento no Google Cloud, `base_url` e `site_url` do `config.yml` do Decap, e testar o login.

## Registro de manutenção
| Data | O que foi feito | Quem |
|---|---|---|
| | | |

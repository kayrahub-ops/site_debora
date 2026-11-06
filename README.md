# Site Débora Lima

Frontend estático (HTML + CSS) do site da psicóloga e psicanalista Débora Lima, convertido do design "Site Débora Lima".

## Páginas
| Arquivo | Página |
|---|---|
| `index.html` | Home (desktop e versão celular, com menu) |
| `sobre.html` | Trajetória |
| `formacao.html` | Formação e títulos |
| `atendimento.html` | Atendimento |
| `blog.html` | Lista do blog |
| `post.html` | Modelo de texto do blog |
| `contato.html` | Contato |

## Estrutura
- `assets/css/<pagina>.css` estilos de cada página
- `assets/js/site.js` menu do celular e parallax
- `assets/img/` fotos

## Pendências para o backend / conteúdo
- Textos do blog (`[Título do texto]`, `[Mês e ano]`) e os temas do filtro estão como placeholders.
- WhatsApp (`https://wa.me/`) e e-mail (`mailto:`) precisam do número e do endereço reais.
- `post.html` é um modelo: o backend deve gerar uma página por texto.

Para ver localmente: `python3 -m http.server` e abrir http://localhost:8000.

<?php
// DIAGNÓSTICO TEMPORÁRIO da hospedagem (tarefa 1.7). Mostra só o necessário.
// USO: 1) troque CHAVE abaixo por uma sequência longa e aleatória (só letras e números)
//      2) envie este arquivo para a pasta do subdomínio de teste
//      3) abra  https://SEU-SUBDOMINIO/diagnostico-locaweb.php?k=SUA_CHAVE
//      4) copie o resultado para docs/diagnostico-locaweb.md
//      5) apague o arquivo: abra  ...?k=SUA_CHAVE&apagar=1  (ou apague pelo gerenciador de arquivos)
// NUNCA deixe este arquivo no servidor depois do teste (checklist S-29).

const CHAVE = 'TROQUE-ESTA-CHAVE';

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$k = $_GET['k'] ?? '';
if (CHAVE === 'TROQUE-ESTA-CHAVE' || !is_string($k) || !hash_equals(CHAVE, $k)) {
    http_response_code(404);
    exit("Não encontrado\n");
}

if (($_GET['apagar'] ?? '') === '1') {
    echo @unlink(__FILE__) ? "Arquivo apagado.\n" : "Não consegui apagar. Apague pelo gerenciador de arquivos.\n";
    exit;
}

$sim = static fn(bool $b): string => $b ? 'sim' : 'NÃO';
$off = array_filter(array_map('trim', explode(',', (string) ini_get('disable_functions'))));

echo "== PHP ==\n";
echo 'Versão exata:        ' . PHP_VERSION . "\n";   // precisa ser 8.5.12 ou mais nova (ou 8.4.27, 8.3.36, 8.2.35)
echo 'Interface (SAPI):    ' . PHP_SAPI . "\n";
echo 'Servidor web:        ' . ($_SERVER['SERVER_SOFTWARE'] ?? 'desconhecido') . "\n\n";

echo "== Extensões que o login precisa ==\n";
echo 'curl:                ' . $sim(extension_loaded('curl')) . "\n";
echo 'openssl:             ' . $sim(extension_loaded('openssl')) . "\n";
echo 'json:                ' . $sim(extension_loaded('json')) . "\n";
echo 'mbstring:            ' . $sim(extension_loaded('mbstring')) . "\n\n";

echo "== Limites ==\n";
echo 'allow_url_fopen:     ' . (ini_get('allow_url_fopen') ? 'ligado' : 'desligado') . "\n";
echo 'open_basedir:        ' . (ini_get('open_basedir') ?: '(sem limite)') . "\n";
echo 'max_execution_time:  ' . ini_get('max_execution_time') . "s\n";
echo 'funções desativadas: ' . count($off) . "\n\n";

echo "== Pastas (o login precisa de uma pasta ACIMA da pasta pública) ==\n";
$aqui = __DIR__;
$acima = dirname($aqui);
echo 'Pasta deste arquivo: ' . $aqui . "\n";
echo 'Pasta acima:         ' . $acima . "\n";
echo 'Dá para ler a pasta acima?    ' . $sim(is_readable($acima)) . "\n";
echo 'Dá para gravar na pasta acima? ' . $sim(is_writable($acima)) . "\n\n";

echo "== Cabeçalhos (.htaccess) ==\n";
if (function_exists('apache_get_modules')) {
    echo 'mod_headers:         ' . $sim(in_array('mod_headers', apache_get_modules(), true)) . "\n";
} else {
    echo "mod_headers:         não dá para saber por aqui (PHP em modo CGI/FPM); teste no spike S5\n";
}

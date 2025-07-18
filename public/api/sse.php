<?php
// Evitar salida en buffer antes de headers
ob_end_clean();

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

// Ruta absoluta desde el proxy hasta el backend (src)
require_once realpath(__DIR__ . '/../../src/php/sse.php');
?>
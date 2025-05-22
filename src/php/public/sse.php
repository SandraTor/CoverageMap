<?php
// sse.php - Servidor SSE modularizado para cambios en archivos GeoJSON
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/utils.php';

$lastModTimes = [];

while (true) {
    clearstatcache();
    $changedFiles = [];

    foreach (getGeoJSONFiles($watchDir) as $file) {
        $modTime = filemtime($file);
        $filename = basename($file);

        if (!isset($lastModTimes[$filename])) {
            $lastModTimes[$filename] = $modTime;
            continue;
        }

        if ($lastModTimes[$filename] != $modTime) {
            $lastModTimes[$filename] = $modTime;
            $changedFiles[] = $filename;
        }
    }

    if (!empty($changedFiles)) {
        echo "event: update\n";
        echo 'data: ' . json_encode($changedFiles) . "\n\n";
        ob_flush();
        flush();
    }

    sleep(3);
}
?>

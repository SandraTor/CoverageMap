<?php


/*
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
?>*/

// sse.php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');
ignore_user_abort(true); // Permite que el script continúe si el cliente se desconecta
set_time_limit(0); // Desactiva el límite de tiempo de ejecución

// Ruta al directorio donde están los archivos GeoJSON
$dataDir = __DIR__ . '/../../data/';
$lastModifiedTimes = [];

function getGeojsonFilesRecursive($dir) {
    $geojsonFiles = [];
    $items = scandir($dir);

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = $dir . DIRECTORY_SEPARATOR . $item;

        if (is_dir($path)) {
            $geojsonFiles = array_merge($geojsonFiles, getGeojsonFilesRecursive($path));
        } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'geojson') {
            $geojsonFiles[] = $path;
        }
    }

    return $geojsonFiles;
}

while (true) {
    if (connection_aborted()) {
        exit(); // Salir si el cliente cierra la conexión
    }

    clearstatcache();
    $changedFiles = [];

    $files = getGeojsonFilesRecursive($dataDir);
    foreach ($files as $file) {
        $filename = basename($file);
        $modified = filemtime($file);

        if (!isset($lastModifiedTimes[$filename])) {
            $lastModifiedTimes[$filename] = $modified;
        }

        if ($modified > $lastModifiedTimes[$filename]) {
            echo "data: $filename\n\n";
            
            $changedFiles[] = $filename;
            $lastModifiedTimes[$filename] = $modified;
        }
    }
    if (!empty($changedFiles)) {
        echo "event: update\n";
        echo 'data: ' . json_encode($changedFiles) . "\n\n";
        ob_flush();
        flush();
    } else {
        echo "event: ping\n";
        echo "data: keep-alive\n\n";
    }
    if (ob_get_length()) {
        ob_flush();
    }
    flush();

    sleep(3); // Intervalo de verificación
}
?>
<?php
// Establece cabeceras para respuesta JSON y permitir acceso desde el navegador
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Carga configuración general si es necesario
require_once __DIR__ . '/includes/config.php';

// Ruta al directorio público donde se guardan los GeoJSON
$dataDir = __DIR__ . '/../../public/data/';

// Obtiene todos los archivos .geojson del directorio
$files = glob($dataDir . '*.geojson');

// Devuelve solo los nombres de los archivos (no las rutas completas)
$result = array_map(function($file) {
    return basename($file);
}, $files);

// Imprime como JSON
ini_set('display_errors', 1); //Habilitamos que muestre errores
echo json_encode($result);
?>
<?php
header('Content-Type: application/json');

// Ruta absoluta desde el proxy hasta el backend
require_once realpath(__DIR__ . '/../../src/php/list_geojson.php');

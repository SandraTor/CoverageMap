<?php
header('Content-Type: application/json');
// Ruta absoluta desde el proxy hasta el backend
require_once __DIR__ . '/../../src/php/list_geojson.php';
if (isset($_GET['action']) && $_GET['action'] === 'categories') {
    echo json_encode(list_all_categories());
    exit;
}

$category = isset($_GET['category']) ? $_GET['category'] : '';
$result = list_geojson_files_by_category($category);

if (isset($result['error'])) {
    http_response_code(400);
    echo json_encode(['error' => $result['error']]);
    exit;
}

// Ensure the result is always an array
if (!is_array($result)) {
    $result = [];
}
echo json_encode($result);
// Para obtener todas la categorías: /api/list_geojson.php?action=categories
// Para obtener fichero GeoJSON de una categoría: /api/list_geojson.php?category=4g

?>

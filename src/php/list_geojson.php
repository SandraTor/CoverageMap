<?php
function get_available_categories() {
    $dataDir = realpath(__DIR__ . '/../../public/data');
    $dirs = array_filter(glob($dataDir . '/*'), 'is_dir');
    $categories = array_map(function($dir) use ($dataDir) {
        return basename($dir);
    }, $dirs);
    return array_values($categories);
}

function list_geojson_files_by_category($category) {
    $dataDir = realpath(__DIR__ . '/../../public/data');
    $categories = get_available_categories();
    if (!in_array($category, $categories)) {
        return ['error' => 'Invalid category'];
    }
    $dir = $dataDir . DIRECTORY_SEPARATOR . $category;
    if (!is_dir($dir)) {
        return [];
    }
    $files = array_values(array_filter(scandir($dir), function($f) use ($dir) {
        return is_file($dir . DIRECTORY_SEPARATOR . $f) && pathinfo($f, PATHINFO_EXTENSION) === 'geojson';
    }));
    return $files;
}

function list_all_categories() {
    return get_available_categories();
}

// If run directly from CLI for testing
if (php_sapi_name() === 'cli' && isset($argv[1])) {
    if ($argv[1] === '--categories') {
        echo json_encode(list_all_categories());
    } else {
        echo json_encode(list_geojson_files_by_category($argv[1]));
    }
}
?>

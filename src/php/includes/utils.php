<?php
// includes/utils.php
function getGeoJSONFiles($dir) {
    return glob("$dir/*.geojson");
}
?>
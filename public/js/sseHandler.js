// js/sseHandler.js
const source = new EventSource('sse.php');
source.addEventListener('update', e => {
  const changedFiles = JSON.parse(e.data);
  console.log('[SSE] Archivos actualizados:', changedFiles);
  changedFiles.forEach(loadGeoJSON);
});

// Inicializar con capas conocidas o cargar desde listado si hay endpoint PHP
fetch('api/list_geojson.php')
  .then(res => res.json())
  .then(files => loadInitialGeoJSON(files));
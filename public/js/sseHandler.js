// js/sseHandler.js

import { updateLayerList } from './mapLayers.js';

const eventSource = new EventSource('/api/sse.php');

eventSource.onmessage = (event) => {
  try {
    const archivos = JSON.parse(event.data); // ['archivo1.geojson', 'archivo2.geojson']
    const geojsonFiles = archivos
      .filter(name => name.endsWith('.geojson'))
      .map(name => decodeURIComponent(name.replace(/^.*\//, ''))); // Sanitiza nombres

    updateLayerList(geojsonFiles);
  } catch (e) {
    console.error('Error procesando datos SSE:', e);
  }
};

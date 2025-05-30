// js/mapLayers.js
import { loadGeoJSONLayer } from './geojsonLoader.js';

const layerControlContainer = document.getElementById('layerControl');
const geojsonLayers = {}; // Guardar las capas por nombre
let validFiles = [];

export function updateLayerList(files) {
  if (!layerControlContainer) return;

  validFiles = files; // Guardar lista validada
  layerControlContainer.innerHTML = ''; // Limpiar controles

  files.forEach(file => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `layer-${file}`;
    checkbox.dataset.filename = file;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = file;

    checkbox.addEventListener('change', (e) => {
      const filename = e.target.dataset.filename;
      if (!validFiles.includes(filename)) {
        console.warn(`Archivo no permitido: ${filename}`);
        return;
      }

      if (e.target.checked) {
        fetch(`/data/${filename}`)
          .then(res => res.json())
          .then(data => {
            if (geojsonLayers[filename]) {
              map.removeLayer(geojsonLayers[filename]);
            }
            const layer = loadGeoJSONLayer(data);
            geojsonLayers[filename] = layer;
            layer.addTo(map);
          });
      } else {
        if (geojsonLayers[filename]) {
          map.removeLayer(geojsonLayers[filename]);
        }
      }
    });

    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    layerControlContainer.appendChild(div);
  });
}
// Obtiene dinámicamente la lista de archivos GeoJSON desde el backend PHP
export async function fetchAvailableLayers() {
  try {
    const response = await fetch('/api/list_geojson.php');
    const geojsonFiles = await response.json();

    updateLayerList(geojsonFiles);
  } catch (e) {
    console.error('Error al obtener lista de capas:', e);
  }
}

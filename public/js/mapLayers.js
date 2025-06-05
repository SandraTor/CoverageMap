// js/mapLayers.js
import { getMarkersForGeoJSONLayer  } from './geojsonLoader.js';
import { map, clusterGroup, oms } from './map.js';

//const layerControlContainer = document.getElementById('layerControl');
const geojsonLayers = {}; // Guardar las capas por nombre
let validFiles = [];
let layerControlContainer = null;

// Toggle this flag to switch between plain and cluster+spiderfier mode
const USE_CLUSTER_AND_SPIDERFIER = true;

function addRefreshLayersButton() {
  if (!layerControlContainer) return;
  // Comprobación de si existe el botón
  if (document.getElementById('refreshLayersBtn')) return;

  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'refreshLayersBtn';
  refreshBtn.textContent = 'Recargar capas';
  refreshBtn.className = 'refreshLayersBtn'
  refreshBtn.style.marginBottom = '8px';
  refreshBtn.onclick = fetchAvailableLayers;

  // Añadimos botón antes del container del control de capas
  layerControlContainer.appendChild(refreshBtn);
}
function addLayerMarkers(markers) {
  clusterGroup.addLayers(markers);
  markers.forEach(marker => oms.addMarker(marker));
}
function removeLayerMarkers(layerName) {
  const markers = geojsonLayers[layerName];
  if (markers) {
    clusterGroup.removeLayers(markers);
    markers.forEach(marker => oms.removeMarker(marker));
    delete geojsonLayers[layerName];
  }
}

export function updateLayerList(files) {
  if (!layerControlContainer) return;
  validFiles = files;
  layerControlContainer.innerHTML = '';

  files.forEach(file => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `layer-${file}`;
    checkbox.dataset.filename = file;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = file.replace(/\.geojson$/i, '');

    checkbox.addEventListener('change', async (e) => {
      const filename = e.target.dataset.filename;
      if (!validFiles.includes(filename)) {
        console.warn(`Archivo no permitido: ${filename}`);
        return;
      }
      if (e.target.checked) {
        const res = await fetch(`/data/${filename}`);
        const data = await res.json();
        const markers = getMarkersForGeoJSONLayer(data, filename);
        geojsonLayers[filename] = markers;
        addLayerMarkers(markers);
      } else {
        removeLayerMarkers(filename);
      }
    });

    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    layerControlContainer.appendChild(div);
  });
  addRefreshLayersButton();
}

/*
  Limpia todo el container y vuelve a añadir las capas y el botón. Eliminamos riesgo de duplicados
*/
/* export function updateLayerList(files) {
  if (!layerControlContainer) return;

  // Remove all children except the refresh button (if present)
  const refreshBtn = document.getElementById('refreshLayersBtn');
  validFiles = files; // Guardar lista validada
  layerControlContainer.innerHTML = ''; // Limpiar controles

  files.forEach(file => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `layer-${file}`;
    checkbox.dataset.filename = file;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = file.replace(/\.geojson$/i, ''); //Eliminamos extensión del fichero al crear el checkbox

    checkbox.addEventListener('change', (e) => {
      const filename = e.target.dataset.filename;
      if (!validFiles.includes(filename)) {
        console.warn(`Archivo no permitido: ${filename}`);
        return;
      }

      /*if (e.target.checked) {
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
    });*
    if (e.target.checked) {
        fetch(`/data/${filename}`)
          .then(res => res.json())
          .then(data => {
            // Remove previous layer if exists
            if (geojsonLayers[filename]) {
              map.removeLayer(geojsonLayers[filename]);
            }
            // Use the appropriate loader
            let layer;
            if (USE_CLUSTER_AND_SPIDERFIER) {
              layer = loadGeoJSONLayerWithClusterAndSpiderfier(data, map);
            } else {
              layer = loadGeoJSONLayer(data);
            }
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
  // Re-append the refresh button at the end
  addRefreshLayersButton();
} */
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

//Nos aseguramos de que la inicialización de los elementos ocurre después de que DOM está preparado
document.addEventListener('DOMContentLoaded', () => {
  layerControlContainer = document.getElementById('layerControl');
  addRefreshLayersButton();
  fetchAvailableLayers();
});
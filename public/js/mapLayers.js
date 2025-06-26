// js/mapLayers.js
import { getMarkersForGeoJSONLayer  } from './geojsonLoader.js';
import { map, clusterGroup, oms } from './map.js';

//const layerControlContainer = document.getElementById('layerControl');
const geojsonLayers = {}; // Guardar las capas por nombre
let validFiles = [];
let layerControlContainer = null;

// --- Helper: Quita todos los puntos/marcadores del mapa y OMS ---
function removeAllLayerMarkers() {
  Object.keys(geojsonLayers).forEach(layerName => {
    removeLayerMarkers(layerName);
  });
}

// --- UI: Funcionamiento Boton recargar ---
function handleRefreshLayers() {
  // Uncheck checkboxes
  const checkboxes = layerControlContainer.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => { cb.checked = false; });

  // Quitamos markers del mapa
  removeAllLayerMarkers();

  // Recarga las capas disponibles
  fetchAvailableLayers();
}

// --- UI: Boton recargar ---
function addRefreshLayersButton() {
  if (!layerControlContainer) return;
  // Comprobación de si existe el botón
  if (document.getElementById('refreshLayersBtn')) return;

  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'refreshLayersBtn';
  refreshBtn.textContent = 'Recargar capas';
  refreshBtn.className = 'refreshLayersBtn'
  refreshBtn.style.marginBottom = '8px';
  refreshBtn.onclick = handleRefreshLayers;

  // Añadimos botón antes del container del control de capas
  layerControlContainer.appendChild(refreshBtn);
}

/** Marker Management */
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
/** UI: Lista de capas */
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

    checkbox.addEventListener('change', handleLayerCheckboxChange);


    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    layerControlContainer.appendChild(div);
  });
  addRefreshLayersButton();
}

// --- Event Handler: Checkbox de capas---
async function handleLayerCheckboxChange(e) {
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
}
// Obtiene dinámicamente la lista  de capas: archivos GeoJSON desde el backend PHP
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
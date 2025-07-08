//mapLayers.js
import { getMarkersForGeoJSONLayer } from './geojsonLoader.js';
import { map, oms } from './map.js';
import { clusterGroup } from './clusterConfig.js';
const geojsonLayers = {}; // Guardar las capas por nombre
let validFiles = [];
let layerControlContainer = null;

//Carga de frontera CyL desde WFS de IDECyL
export function cargarFronteraCYL(map){
  fetch('https://idecyl.jcyl.es/geoserver/limites/ows?service=WFS&version=1.0.0&request=GetFeature' +
        '&typeName=limites:limites_cyl_autonomia' +
        '&outputFormat=application/json' +
        '&CQL_FILTER=n_auton=%27Castilla y León%27' + //filtro de servidor
        '&srsName=EPSG:4326')
    .then(res => res.json())
    .then(data => {
      const layer = L.geoJSON(data, {
        style: {
          color: '#FF6600',
          weight: 1,
          opacity: 1,
          fill: false
        }
      }).addTo(map);

      return layer;
    });
}

// --- Helpers ---
// Elimina los puntos de una capa en concreto
function removeLayerMarkers(name) {
  const markers = geojsonLayers[name];
  if (!markers) return;
  clusterGroup.removeLayers(markers);
  markers.forEach(m => oms.removeMarker(m));
  delete geojsonLayers[name];
}

// Elimina todos los puntos del mapa
function removeAllLayerMarkers() {
  Object.keys(geojsonLayers)
    .forEach(removeLayerMarkers);
}

// Deselecciona todos los checkboxes de la Interfaz de Usuario (UI)
function clearCheckboxes() {
  const checkboxes = document.getElementById('checkboxesContainer');
  if (checkboxes) checkboxes.remove();
}

// --- UI: Genera la lista checkbox para las capas ---
// Actualiza la lista de capa con los checkboxes
export function updateLayerList(files, category) {
  validFiles = files;
  clearCheckboxes();
  const container = document.createElement('div');
  container.id = 'checkboxesContainer';

  const useRadio = (category === 'air_pollution');

  files.forEach((file, idx) => {
    const input = document.createElement('input');
    input.type = useRadio ? 'radio' : 'checkbox';
    input.name = useRadio ? 'layer-radio' : undefined;
    input.id = `layer-${file}`;
    input.dataset.filename = file;

    // Listener común (se adapta más abajo)
    input.addEventListener('change', changeHandler);

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = file.replace(/\.geojson$/i, '');

    const row = document.createElement('div');
    row.append(input, label);
    container.append(row);
  });
  layerControlContainer.append(container);
  
  //Comprobamos si ya existe el botón, para eliminarlo y volverlo a crear de manera que siempre esté debajo de los checkboxes dinámicos
  const existingBtn = document.getElementById('refreshLayersBtn');
  if (existingBtn) existingBtn.remove();

  addRefreshLayersButton();
}
 //Comportamiento unificado para radio button y checkboxes
async function changeHandler(e) {
  const filename = e.target.dataset.filename;
  const isRadio = e.target.type === 'radio';

  if (isRadio) {
    // Al cambiar radio: limpiar todo y añadir sólo la nueva
    removeAllLayerMarkers();
    document.querySelectorAll('input[type="radio"]').forEach(r => {
      if (r !== e.target) r.checked = false;
    });
  }

  if (e.target.checked) {
    const res = await fetch(`/data/${filename}`);
    const data = await res.json();
    const markers = getMarkersForGeoJSONLayer(data, filename);
    geojsonLayers[filename] = markers;
    clusterGroup.addLayers(markers);
    markers.forEach(m => oms.addMarker(m));
  } else {
    removeLayerMarkers(filename);
  }
}

// --- Fetch & Render Categories ---
// Fetch categories and populate the dropdown
async function fetchCategories() {
  try {
    const res = await fetch('/api/list_geojson.php?action=categories');
    const categories = await res.json();
    populateCategoryDropdown(categories);
  } catch (error) {
    console.error('Error fetching or parsing categories:', error);
  }
}

// Populate category dropdown
function populateCategoryDropdown(categories) {
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '<option value="">Selecciona una categoría</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    sel.append(option);
  });
  if (!sel._listenerAdded) {
    sel.addEventListener('change', async e => {
      const categories = e.target.value;
      clearCheckboxes();
      if (categories) await fetchAvailableLayers(categories);
      removeAllLayerMarkers();
    });
    sel._listenerAdded = true;
  }
}

// --- Fetch layers for one category ---
// Fetch and display layers for the selected category
export async function fetchAvailableLayers(category) {
  if (!category) return;
  try {
    const res = await fetch(`/api/list_geojson.php?category=${encodeURIComponent(category)}`);
    const files = await res.json();
    if (Array.isArray(files)) {
      updateLayerList(files, category);
    } else {
      console.error('Expected array of geojson files', files);
    }
  } catch (error) {
    console.error('Error fetching or parsing available layers:', error);
  }
}

// --- “Recargar capas” button handler ---
// Refresh layers for the current category
function handleRefreshLayers() {
  // mimic a re‐select of the current category
  const sel = document.getElementById('categorySelect');
  const category = sel.value;
  clearCheckboxes();
  if (category) fetchAvailableLayers(category);
  removeAllLayerMarkers();
}

// Add refresh button once
// Ensure the refresh button is added to the UI
function addRefreshLayersButton() {
  if (!layerControlContainer || document.getElementById('refreshLayersBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'refreshLayersBtn';
  btn.textContent = 'Recargar capas';
  btn.className = 'refreshLayersBtn';
  btn.style.marginBottom = '8px';
  btn.addEventListener('click', handleRefreshLayers);
  layerControlContainer.append(btn);
}

// --- Init on DOM load ---
// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  layerControlContainer = document.getElementById('layerControl');
  fetchCategories();
  //addRefreshLayersButton();
});

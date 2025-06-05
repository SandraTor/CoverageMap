// js/map.js
import { gradientLegend } from './leafletGradientLegend.js';
import {fetchAvailableLayers} from './mapLayers.js'

export const map = L.map('map').setView([40.0, -3.7], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

export const clusterGroup = L.markerClusterGroup();
map.addLayer(clusterGroup);

window.map = map;
window.layers = {};
gradientLegend.addTo(map);
// Cargar lista de capas disponibles al inicio
fetchAvailableLayers();

// Robust OMS constructor detection
let OMSConstructor = null;
if (typeof window.OverlappingMarkerSpiderfier === 'function') {
  OMSConstructor = window.OverlappingMarkerSpiderfier;
} else if (
  typeof window.OverlappingMarkerSpiderfier === 'object' &&
  typeof window.OverlappingMarkerSpiderfier.OverlappingMarkerSpiderfier === 'function'
) {
  OMSConstructor = window.OverlappingMarkerSpiderfier.OverlappingMarkerSpiderfier;
} else {
  throw new Error('OverlappingMarkerSpiderfier is not available as a constructor.');
}
export const oms = new OMSConstructor(map);
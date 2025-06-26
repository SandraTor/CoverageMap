// js/map.js
import { gradientLegend } from './leafletGradientLegend.js';
import {fetchAvailableLayers} from './mapLayers.js'
import { getColorByIntensidad } from './geojsonLoader.js';

// Helper to extract intensidad from marker
function getMarkerIntensidad(marker) {
  if (marker.options && typeof marker.options.intensidad !== 'undefined') {
    return marker.options.intensidad;
  }
  if (marker.feature && marker.feature.properties && typeof marker.feature.properties.Intensidad !== 'undefined') {
    return parseFloat(marker.feature.properties.Intensidad);
  }
  return null;
}

// Custom iconCreateFunction for clusters
function iconCreateFunction(cluster) {
  const markers = cluster.getAllChildMarkers();
  const intensities = markers
    .map(getMarkerIntensidad)
    .filter(val => typeof val === 'number' && !isNaN(val));
  const avg = intensities.length
    ? intensities.reduce((a, b) => a + b, 0) / intensities.length
    : -130;
  const color = getColorByIntensidad(avg);

  const count = cluster.getChildCount();
  let size = 'small';
  if (count >= 100) size = 'large';
  else if (count >= 10) size = 'medium';

  return L.divIcon({
    html: `<div style="background:${color};"><span>${count}</span></div>`,
    className: `custom-cluster ${size}`,
    iconSize: L.point(20, 20)
  });
}


export const map = L.map('map').setView([40.0, -3.7], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

export const clusterGroup = L.markerClusterGroup({
  iconCreateFunction,
  //personalización de parámetros del cluster
  maxClusterRadius: 40
});
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
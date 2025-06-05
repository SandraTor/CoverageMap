//js/geojsonLoader.js

export const intensidadBreakpoints = [
  -70,   // Max (best signal)
  -90,   // Green/Yellow
  -100,  // Yellow/Orange
  -110,  // Orange/Red
  -130   // Min (worst signal)
];
/*
  Calculo de color del punto según intensidad
*/
export function getColorByIntensidad(value) {
  if (value > intensidadBreakpoints[1]) return interpolateColor(value, intensidadBreakpoints[0], intensidadBreakpoints[1], '#27ae60', '#2ecc71');  // verde claro a verde
  if (value > intensidadBreakpoints[2]) return interpolateColor(value, intensidadBreakpoints[1], intensidadBreakpoints[2], '#f1c40f', '#f39c12'); // amarillo oscuro a amarillo
  if (value > intensidadBreakpoints[3]) return interpolateColor(value, intensidadBreakpoints[2], intensidadBreakpoints[3], '#e67e22', '#d35400'); // naranja oscuro a naranja
  return interpolateColor(value, intensidadBreakpoints[3], intensidadBreakpoints[4], '#e74c3c', '#c0392b');                   // rojo oscuro a rojo
}

/*
  Gradiente de color para reflejar cambios en la misma franja de intensidad.
*/
function interpolateColor(value, min, max, colorMin, colorMax) {
  const ratio = (value - min) / (max - min);
  const hex = (color) => color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16));
  const [r1, g1, b1] = hex(colorMin);
  const [r2, g2, b2] = hex(colorMax);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r},${g},${b})`;
}

/*
  Estilo con el que se dibujan los puntos
*/
function styleFeature(feature) {
  const intensidad = parseFloat(feature.properties.Intensidad);
  return {
    radius: 6,
    fillColor: getColorByIntensidad(intensidad),
    color: '#333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}
/**
 * Creates a custom circular div icon for Leaflet markers.
 * @param {string} color - The fill color for the circle.
 * @returns {L.DivIcon} - A Leaflet div icon representing a colored circle.
 */
function createCircleIcon(color) {
  return L.divIcon({
    className: 'custom-circle-marker',
    html: `<span style="
      display: block;
      width: 16px;
      height: 16px;
      background: ${color};
      border: 2px solid #333;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      "></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
}

/**
 * Given GeoJSON data, returns an array of L.Marker objects.
 * @param {Object} data - GeoJSON data
 * @returns {L.Marker[]}
 */
export function getMarkersForGeoJSONLayer(data, layerName) {
  const markers = [];
  L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const intensidad = parseFloat(feature.properties.Intensidad);
      const color = getColorByIntensidad(intensidad);
      const marker = L.marker(latlng, { icon: createCircleIcon(color) });
      const date = feature.properties.date || feature.properties.fecha || feature.properties.Date || '';
      let popupHtml = `<strong>Operador:</strong> ${layerName.replace(/\.geojson$/i, '')}`;
      if (layerName) {
        popupHtml += `<br><strong>Intensidad:</strong> ${intensidad} dBm`;
      }
      if (date) {
        popupHtml += `<br><strong>Fecha:</strong> ${date}`;
      }
      marker.bindPopup(popupHtml);
      markers.push(marker);
      return marker;
    }
  });
  return markers;
}

/*
  Carga del fichero geojson y dibujo de los puntos en el mapa como capa
*/
/* export function loadGeoJSONLayer(data) {
  return L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const intensidad = parseFloat(feature.properties.Intensidad);
      const color = getColorByIntensidad(intensidad);
      return L.marker(latlng, { icon: createCircleIcon(color) })
        .bindPopup(`<strong>Intensidad:</strong> ${intensidad} dBm`);
    }
  });
} */
/**
 * Loads GeoJSON data as clustered and spiderfied markers.
 * @param {Object} data - GeoJSON data
 * @param {L.Map} map - Leaflet map instance
 * @returns {L.MarkerClusterGroup} - The cluster group layer
 */
/* export function loadGeoJSONLayerWithClusterAndSpiderfier(data, map) {
  // Create a marker cluster group
  const markerClusterGroup = L.markerClusterGroup();

  // Robustly detect the OMS constructor
  let OMSConstructor = null;
  if (typeof window.OverlappingMarkerSpiderfier === 'function') {
    OMSConstructor = window.OverlappingMarkerSpiderfier;
  } else if (
    typeof window.OverlappingMarkerSpiderfier === 'object' &&
    typeof window.OverlappingMarkerSpiderfier.OverlappingMarkerSpiderfier === 'function'
  ) {
    OMSConstructor = window.OverlappingMarkerSpiderfier.OverlappingMarkerSpiderfier;
  } else {
    console.error(
      '[OMS] OverlappingMarkerSpiderfier is not available as a constructor. ' +
      'Check that the correct OMS script is loaded (leaflet-oms.min.js from jawj/OverlappingMarkerSpiderfier-Leaflet). ' +
      'window.OverlappingMarkerSpiderfier:', window.OverlappingMarkerSpiderfier
    );
    throw new Error('OverlappingMarkerSpiderfier is not available as a constructor.');
  }

  // Initialize OverlappingMarkerSpiderfier on the map
  const oms = new OMSConstructor(map);

  // Create markers and add to cluster group and OMS
  L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const intensidad = parseFloat(feature.properties.Intensidad);
      const color = getColorByIntensidad(intensidad);
      const marker = L.marker(latlng, { icon: createCircleIcon(color) });
      marker.bindPopup(`<strong>Intensidad:</strong> ${intensidad} dBm`);
      markerClusterGroup.addLayer(marker);
      oms.addMarker(marker);
      return marker;
    }
  });

  // Optionally, handle spiderfy/unspiderfy events for custom UI
  // oms.addListener('spiderfy', function(markers) { ... });
  // oms.addListener('unspiderfy', function(markers) { ... });

  return markerClusterGroup;
}
 */
// Usage example in your main map code:
// import { loadGeoJSONLayerWithClusterAndSpiderfier } from './geojsonClusterSpiderfierLoader';
// const clusterLayer = loadGeoJSONLayerWithClusterAndSpiderfier(geojsonData, map);
// map.addLayer(clusterLayer);
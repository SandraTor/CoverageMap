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
      const marker = L.marker(latlng, { icon: createCircleIcon(color), intensidad });
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

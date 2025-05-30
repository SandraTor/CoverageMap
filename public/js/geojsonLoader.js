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

/*
  Carga del fichero geojson y dibujo de los puntos en el mapa como capa
*/
export function loadGeoJSONLayer(data) {
  return L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const intensidad = parseFloat(feature.properties.Intensidad);
      const color = getColorByIntensidad(intensidad);
      return L.circleMarker(latlng, styleFeature(feature))
        .bindPopup(`<strong>Intensidad:</strong> ${intensidad} dBm`);
    }
  });
}
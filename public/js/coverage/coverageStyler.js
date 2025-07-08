//coverageStyler.js
import { interpolateColor } from '../utils/helpers.js'
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
  Estilo con el que se dibujan los puntos
*/
export function styleFeature(feature) {
    const props = feature.properties;
    const intensidadKey = Object.keys(props).find(k => k.toLowerCase().startsWith('intensidad'));
    const intensidad = intensidadKey ? parseFloat(props[intensidadKey]) : NaN;
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
export function createCircleIcon(color) {
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
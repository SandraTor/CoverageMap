//airPollutionStyler.js
import { interpolateColor } from '../utils/helpers.js'
export const concentracionBreakpoints = [
  -70,   // Max (best signal)
  -90,   // Green/Yellow
  -100,  // Yellow/Orange
  -110,  // Orange/Red
  -130   // Min (worst signal)
];
/*
  Calculo de color del punto según concentracion
*/
export function getColorByConcentracion(value) {
  if (value > concentracionBreakpoints[1]) return interpolateColor(value, concentracionBreakpoints[0], concentracionBreakpoints[1], '#27ae60', '#2ecc71');  // verde claro a verde
  if (value > concentracionBreakpoints[2]) return interpolateColor(value, concentracionBreakpoints[1], concentracionBreakpoints[2], '#f1c40f', '#f39c12'); // amarillo oscuro a amarillo
  if (value > concentracionBreakpoints[3]) return interpolateColor(value, concentracionBreakpoints[2], concentracionBreakpoints[3], '#e67e22', '#d35400'); // naranja oscuro a naranja
  return interpolateColor(value, concentracionBreakpoints[3], concentracionBreakpoints[4], '#e74c3c', '#c0392b');                   // rojo oscuro a rojo
}
/*
  Estilo con el que se dibujan los puntos
*/
export function styleFeature(feature) {
    const props = feature.properties;
    const concentracionKey = Object.keys(props).find(k => k.toLowerCase().startsWith('intensidad'));
    const concentracion = concentracionKey ? parseFloat(props[concentracionKey]) : NaN;
    return {
        radius: 6,
        fillColor: getColorByConcentracion(concentracion),
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
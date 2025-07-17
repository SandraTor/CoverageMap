//helpers.js

// Helper to extract intensidad from marker
export function getMarkerIntensidad(marker) {
  if (marker.options && typeof marker.options.intensidad !== 'undefined') {
    return marker.options.intensidad;
  }
  if (marker.feature && marker.feature.properties && typeof marker.feature.properties.Intensidad !== 'undefined') {
    return parseFloat(marker.feature.properties.Intensidad);
  }
  return null;
}

/*
  Gradiente de color para reflejar cambios en la misma franja de intensidad.
*/
export function interpolateColor(value, min, max, colorMin, colorMax) {
  const ratio = (value - min) / (max - min);
  const hex = (color) => color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16));
  const [r1, g1, b1] = hex(colorMin);
  const [r2, g2, b2] = hex(colorMax);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r},${g},${b})`;
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

export function formatearNombreCapa(filename) {
  // Quitar la extensión .geojson
  let nombre = filename.replace(/\.geojson$/i, '');

  // Caso especial: PM_25 → PM 2.5
  if (nombre === "Concentración_PM_25") return "Concentración PM 2.5";

  // Reemplazar todos los guiones bajos por espacios
  nombre = nombre.replace(/_/g, ' ');

  return nombre;
}
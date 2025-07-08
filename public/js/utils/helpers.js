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
//leafletGradientLegend.js
import { getColorByIntensidad , intensidadBreakpoints} from './coverageStyler.js';

import { hideAirPollutionLegend } from '../airPollution/airPollutionLegend.js';

const coverageLegend = document.getElementById('coverageLegendContainer');

export const gradientLegend = L.control({ position: 'bottomright' });

gradientLegend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'legend-gradient');

  // Estilo
  div.style.background = 'white';
  div.style.padding = '12px 16px 8px 16px';
  div.style.borderRadius = '8px';
  div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  div.style.fontSize = '14px';
  div.style.color = '#222';
  div.style.minWidth = '200px';

  // Title
  const title = document.createElement('div');
  title.className = 'legend-title';
  title.innerHTML = '<strong>Intensidad (dBm)</strong>';
  div.appendChild(title);

  // Gradiente
  const gradientBar = document.createElement('div');
  gradientBar.className = 'legend-gradient-bar';
  gradientBar.style.marginBottom = '4px';
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 16;
  gradientBar.appendChild(canvas);
  div.appendChild(gradientBar);

  // Labels
  const labels = document.createElement('div');
  labels.className = 'legend-labels';
  labels.style.position = 'relative';
  labels.style.fontSize = '12px';
  labels.style.marginTop = '2px';
  labels.style.height = '18px';

  // Solo mostramos etiquetas/labels cuando se produce el cambio de color
  //También en los extremos: máximo y mínimo
  const min = intensidadBreakpoints[intensidadBreakpoints.length - 1];
  const max = intensidadBreakpoints[0];

  // Max izq, centrado al inicio del gradiente
  const maxLabel = document.createElement('span');
  maxLabel.innerText = max;
  maxLabel.style.position = 'absolute';
  maxLabel.style.left = '0%';
  maxLabel.style.transform = 'translateX(-50%)';
  maxLabel.style.whiteSpace = 'nowrap';
  labels.appendChild(maxLabel);

  // Leyenda numérica en los cambios de color (Breakpoints)
  for (let i = 1; i < intensidadBreakpoints.length - 1; i++) {
    const bp = intensidadBreakpoints[i];
    // Posición: % desde izq, relativo to min-max
    const percent = (max - bp) / (max - min);
    const label = document.createElement('span');
    label.innerText = bp;
    label.style.position = 'absolute';
    label.style.left = `calc(${percent * 100}%)`;
    label.style.transform = 'translateX(-50%)';
    label.style.whiteSpace = 'nowrap';
    labels.appendChild(label);
  }

  // Min a la derecha
  const minLabel = document.createElement('span');
  minLabel.innerText = min;
  minLabel.style.position = 'absolute';
  minLabel.style.left = '100%';
  minLabel.style.transform = 'translateX(-50%)';
  minLabel.style.whiteSpace = 'nowrap';
  labels.appendChild(minLabel);

  div.appendChild(labels);

  // Dibujo de la leyenda con gradiente usando getColorByIntensidad
  const ctx = canvas.getContext('2d');
  for (let x = 0; x < canvas.width; x++) {
    const value = max - (x / (canvas.width - 1)) * (max - min);
    ctx.fillStyle = getColorByIntensidad(value);
    ctx.fillRect(x, 0, 1, canvas.height);
  }

  return div;
};

export function updateCoverageLegend(category, selectedLayers=[]) {
  if (!coverageLegend) return;

  if (category === 'air_pollution') {
    coverageLegend.style.display = 'none';
    hideAirPollutionLegend();
    return;
  }

  // Mostrar leyenda cobertura
  coverageLegend.style.display = 'block';
  // Aquí va tu lógica actual de cobertura:
  coverageLegend.innerHTML = selectedLayers
    .map(name => `<div>${name}</div>`).join('') || '<div>Ninguna capa seleccionada</div>';

  hideAirPollutionLegend();
}
// coverageLegend.js
import { getColorByIntensidad, intensidadBreakpoints } from './coverageStyler.js';

export const gradientLegend = L.control({ position: 'bottomright' });

gradientLegend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'legend');

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
  title.id = 'legend-title';
  title.innerHTML = '<strong>Intensidad (dBm)</strong>';
  div.appendChild(title);

  // Gradiente
  const gradientBar = document.createElement('div');
  gradientBar.className = 'legend-bar';
  gradientBar.style.marginBottom = '4px';
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 16;
  gradientBar.appendChild(canvas);
  div.appendChild(gradientBar);

  // Labels
  const labels = document.createElement('div');
  labels.className = 'legend-labels';
  labels.id = 'legend-labels'
  labels.style.position = 'relative';
  labels.style.fontSize = '12px';
  labels.style.marginTop = '2px';
  labels.style.height = '18px';

  const min = intensidadBreakpoints[intensidadBreakpoints.length - 1];
  const max = intensidadBreakpoints[0];

  const maxLabel = document.createElement('span');
  maxLabel.innerText = max;
  maxLabel.style.position = 'absolute';
  maxLabel.style.left = '0%';
  maxLabel.style.transform = 'translateX(-50%)';
  maxLabel.style.whiteSpace = 'nowrap';
  labels.appendChild(maxLabel);

  for (let i = 1; i < intensidadBreakpoints.length - 1; i++) {
    const bp = intensidadBreakpoints[i];
    const percent = (max - bp) / (max - min);
    const label = document.createElement('span');
    label.innerText = bp;
    label.style.position = 'absolute';
    label.style.left = `calc(${percent * 100}%)`;
    label.style.transform = 'translateX(-50%)';
    label.style.whiteSpace = 'nowrap';
    labels.appendChild(label);
  }

  const minLabel = document.createElement('span');
  minLabel.innerText = min;
  minLabel.style.position = 'absolute';
  minLabel.style.left = '100%';
  minLabel.style.transform = 'translateX(-50%)';
  minLabel.style.whiteSpace = 'nowrap';
  labels.appendChild(minLabel);

  div.appendChild(labels);
  
  const ctx = canvas.getContext('2d');
  for (let x = 0; x < canvas.width; x++) {
    const value = max - (x / (canvas.width - 1)) * (max - min);
    ctx.fillStyle = getColorByIntensidad(value);
    ctx.fillRect(x, 0, 1, canvas.height);
  }

  return div;
};

/**
 * Función para redibujar el contenido del control gradientLegend
 * @param {L.Map} map - instancia del mapa Leaflet
 */
export function redrawGradientLegend(map) {
  if (!map) return;

  const container = gradientLegend.getContainer();

  if (!container) {
    // Si el control no está añadido, añadirlo
    gradientLegend.addTo(map);
    return;
  }

  // Crear nuevo contenido
  const newContent = gradientLegend.onAdd(map);

  // Limpiar contenido actual y añadir el nuevo
  container.innerHTML = '';
  container.appendChild(newContent);
}

/**
 * Actualiza la leyenda de cobertura.
 * @param {string} category - Categoría seleccionada.
 * @param {string[]} selectedLayers - Capas seleccionadas.
 * @param {L.Map} map - instancia del mapa Leaflet (para redibujar leyenda gradiente)
 */
export function updateCoverageLegend(category, selectedLayers = [], map) {
  if (!coverageLegend) return;

  coverageLegend.style.display = 'block';

  // Redibujar la leyenda gradiente para reflejar el estado actualizado
  redrawGradientLegend(map);
}
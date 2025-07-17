//legendGenerator.js
let legendControl;

export function initLegend(map, config) {
  legendControl = L.control({ position: 'bottomright' });

   legendControl.onAdd = function () {
    // Solo creamos el contenedor fuera y sólo una vez
    const container = L.DomUtil.create('div', 'legend leaflet-control');
    container.id = 'legend-container';

    const content = createGradientLegend(config); // Solo contenido interno
    container.appendChild(content);
    return container;
  };

  legendControl.addTo(map);
}

export function updateLegend(config) {
  const container = legendControl?.getContainer();
  if (container) {
    container.innerHTML = '';
    const content = createGradientLegend(config);
    container.appendChild(content);
  }
}

function createGradientLegend({ titleText, breakpoints, getColor, contaminante }) {

  // Contenedor principal con clase legend
  const legendContainer = document.createDocumentFragment('div');

  // Título
  const title = document.createElement('div');
  title.className = 'legend-title';
  title.innerHTML = `<strong>${titleText}</strong>`;
  legendContainer.appendChild(title);

  const min = breakpoints[0];
  const max = breakpoints[breakpoints.length - 1];

  // Contenedor principal
  const wrapper = document.createElement('div');
  wrapper.className = 'legend-gradient-container';

  // Canvas de gradiente
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 16;
  canvas.className = 'legend-gradient-canvas';
  wrapper.appendChild(canvas);

  // Línea horizontal con marcas (ticks)
  const lineWrapper = document.createElement('div');
  lineWrapper.className = 'legend-line-wrapper';

  const line = document.createElement('div');
  line.className = 'legend-line';
  lineWrapper.appendChild(line);

  // Añadir ticks
  breakpoints.forEach((bp) => {
    const percent = ((bp - min) / (max - min)) * 100;

    const tick = document.createElement('div');
    tick.className = 'legend-tick';
    tick.style.left = `${percent}%`;
    lineWrapper.appendChild(tick);
  });

  // Etiquetas min y max dentro del mismo contenedor de la línea
  const minLabel = document.createElement('span');
  minLabel.innerText = min;
  minLabel.className = 'legend-minmax legend-minmax-left';
  lineWrapper.appendChild(minLabel);

  const maxLabel = document.createElement('span');
  maxLabel.innerText = max;
  maxLabel.className = 'legend-minmax legend-minmax-right';
  lineWrapper.appendChild(maxLabel);

  wrapper.appendChild(lineWrapper);

  // Etiquetas intermedias (sin min/max)
  const labels = document.createElement('div');
  labels.className = 'legend-labels';

  for (let i = 1; i < breakpoints.length - 1; i++) {
    const bp = breakpoints[i];
    const percent = ((bp - min) / (max - min)) * 100;

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.innerText = bp;
    label.style.left = `${percent}%`;

    labels.appendChild(label);
  }

  wrapper.appendChild(labels);
  legendContainer.appendChild(wrapper);


  // Pintar gradiente (manteniendo la coherencia con los nuevos valores)
  const ctx = canvas.getContext('2d');
  for (let x = 0; x < canvas.width; x++) {
    const value = min + (x / (canvas.width - 1)) * (max - min);
    let color;
    try {
      color = getColor.length === 2
        ? getColor(value, contaminante)
        : getColor(value);
    } catch (err) {
      console.warn("Error al obtener color para la leyenda:", err);
      color = "#808080";
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, 1, canvas.height);
  }

  return legendContainer;
}
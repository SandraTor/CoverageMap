// airPollutionLegend.js

const legendContainer = document.getElementById('legend');
const coverageLegend = document.getElementById('coverageLegendContainer');

export function initAirPollutionLegend() {
  const container = document.createElement('div');
  container.id = 'airPollutionLegend';
  container.style.display = 'none';
  legendContainer.appendChild(container);
}

export function updateAirPollutionLegend(filename) {
  const container = document.getElementById('airPollutionLegend');
  coverageLegend.style.display = 'none'; // ocultamos leyenda cobertura
  container.style.display = 'block';
  // nombre legible
  const pollutant = filename.replace(/\.geojson$/i, '').replace(/_/g, ' ');
  container.innerHTML = `<strong>Contaminante:</strong> ${pollutant}`;
}

export function hideAirPollutionLegend() {
  const container = document.getElementById('airPollutionLegend');
  if (container) {
    container.style.display = 'none';
  }
}
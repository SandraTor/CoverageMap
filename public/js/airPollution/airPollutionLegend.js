// airPollutionLegend.js
import { initLegend, updateLegend } from '../utils/legendGenerator.js';
import { getColorByConcentracion, concentracionBreakpoints } from './airPollutionStyler.js';

export function initCoverageLegend(map) {
  initLegend(map, {
    titleText: 'Intensidad (dBm)',
    breakpoints: concentracionBreakpoints,
    getColor: getColorByConcentracion(value, "")
  });
}

export function updateAirPollutionLegend(map, contaminante) {
  console.log("Contaminante recibido:", contaminante);
  updateLegend({
    titleText: contaminante,
    breakpoints: concentracionBreakpoints[contaminante],
    getColor: (value, contaminante) => getColorByConcentracion(value, contaminante),
    contaminante: contaminante
  });
}
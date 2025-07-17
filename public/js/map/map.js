// js/map.js
import { initCoverageLegend } from '../coverage/coverageLegend.js';
import { clusterGroup } from './clusterConfig.js';
import { cargarFronteraCYL } from './mapLayers.js'

export const map = L.map('map', {
  center: [41.5, -4.70], // Centro aproximado de Castilla y León
  zoom: 7
});

// Límites ampliados de Castilla y León, para que ninguna provincia quede fuera
const castillayLeonBounds = [
  [39.85, -7.2],   // Extremo suroeste
  [43.25, -1.3]     // Extremo noreste
];
let vistaInicialAjustada = false;
function ajustarVista() {
  const mapContainer = document.getElementById('map');

  if (!vistaInicialAjustada) {
    map.invalidateSize(); //Fuerza a recalcular tamaño real contenedor mapa antes de centrar
    
    const alto = mapContainer.clientHeight;
    const ancho = mapContainer.clientWidth;

    map.fitBounds(castillayLeonBounds, {
      paddingTopLeft: [ancho * 0.05, alto * 0.05],
      paddingBottomRight: [ancho * 0.05, alto * 0.05],
      maxZoom: 9
    });
    vistaInicialAjustada = true;
  }
}


//Centramos zoom y dibujamos frontera de Castilla y León cuando el mapa está listo.
//Observer para que se reajuste cuando cambie las dimensiones del contenedor del mapa.
map.whenReady(() => {
 
  ajustarVista(); //Ajusta mapa en la carga inicial

  const mapContainer = document.getElementById('map');
  cargarFronteraCYL(map);
  const resizeObserver = new ResizeObserver(() => {
    vistaInicialAjustada=false; //Al detectar movimiento reencuadramos
    ajustarVista();//Ajusta mapa al detectar cambios en dimensiones ventana
  });
  resizeObserver.observe(mapContainer);

});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //maxZoom: 19
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


map.addLayer(clusterGroup);

window.map = map;
window.layers = {};
initCoverageLegend(map); // Inicializa directamente con valores de cobertura

// Robust OMS constructor detection
let OMSConstructor = null;
if (typeof window.OverlappingMarkerSpiderfier === 'function') {
  OMSConstructor = window.OverlappingMarkerSpiderfier;
} else if (
  typeof window.OverlappingMarkerSpiderfier === 'object' &&
  typeof window.OverlappingMarkerSpiderfier.OverlappingMarkerSpiderfier === 'function'
) {
  OMSConstructor = window.OverlappingMarkerSpiderfier.OverlappingMarkerSpiderfier;
} else {
  throw new Error('OverlappingMarkerSpiderfier is not available as a constructor.');
}
export const oms = new OMSConstructor(map);
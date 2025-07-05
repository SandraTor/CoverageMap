// js/map.js
import { gradientLegend } from './leafletGradientLegend.js';
import {fetchAvailableLayers} from './mapLayers.js'
import { getColorByIntensidad } from './geojsonLoader.js';

// Helper to extract intensidad from marker
function getMarkerIntensidad(marker) {
  if (marker.options && typeof marker.options.intensidad !== 'undefined') {
    return marker.options.intensidad;
  }
  if (marker.feature && marker.feature.properties && typeof marker.feature.properties.Intensidad !== 'undefined') {
    return parseFloat(marker.feature.properties.Intensidad);
  }
  return null;
}

// Custom iconCreateFunction for clusters
function iconCreateFunction(cluster) {
  const markers = cluster.getAllChildMarkers();
  const intensities = markers
    .map(getMarkerIntensidad)
    .filter(val => typeof val === 'number' && !isNaN(val));
  const avg = intensities.length
    ? intensities.reduce((a, b) => a + b, 0) / intensities.length
    : -130;
  const color = getColorByIntensidad(avg);

  const count = cluster.getChildCount();
  let size = 'small';
  if (count >= 100) size = 'large';
  else if (count >= 10) size = 'medium';

  return L.divIcon({
    html: `<div style="background:${color};"><span>${count}</span></div>`,
    className: `custom-cluster ${size}`,
    iconSize: L.point(20, 20)
  });
}


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

//Carga de frontera CyL desde WFS de IDECyL
function cargarFronteraCYL(map){
  fetch('https://idecyl.jcyl.es/geoserver/limites/ows?service=WFS&version=1.0.0&request=GetFeature' +
        '&typeName=limites:limites_cyl_autonomia' +
        '&outputFormat=application/json' +
        '&CQL_FILTER=n_auton=%27Castilla y León%27' + // 👈 filtro de servidor
        '&srsName=EPSG:4326')
    .then(res => res.json())
    .then(data => {
      const layer = L.geoJSON(data, {
        style: {
          color: '#FF6600',
          weight: 1,
          opacity: 1,
          fill: false
        }
      }).addTo(map);

      return layer;
    });
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

export const clusterGroup = L.markerClusterGroup({
  iconCreateFunction,
  //personalización de parámetros del cluster
  maxClusterRadius: 40
});
map.addLayer(clusterGroup);

window.map = map;
window.layers = {};
gradientLegend.addTo(map);

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
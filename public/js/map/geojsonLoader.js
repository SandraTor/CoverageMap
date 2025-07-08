//js/geojsonLoader.js
 import { getColorByIntensidad, createCircleIcon } from "../coverage/coverageStyler.js";
/**
 * Given GeoJSON data, returns an array of L.Marker objects.
 * @param {Object} data - GeoJSON data
 * @returns {L.Marker[]}
 */
export function getMarkersForGeoJSONLayer(data, layerName) {
  const markers = [];
  L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const intensidad = parseFloat(feature.properties.Intensidad);
      const color = getColorByIntensidad(intensidad);
      const marker = L.marker(latlng, { icon: createCircleIcon(color), intensidad });
      const date = feature.properties.date || feature.properties.fecha || feature.properties.Date || '';
      let popupHtml = `<strong>Operador:</strong> ${layerName.replace(/\.geojson$/i, '')}`;
      if (layerName) {
        popupHtml += `<br><strong>Intensidad:</strong> ${intensidad} dBm`;
      }
      if (date) {
        popupHtml += `<br><strong>Fecha:</strong> ${date}`;
      }
      marker.bindPopup(popupHtml);
      markers.push(marker);
      return marker;
    }
  });
  return markers;
}

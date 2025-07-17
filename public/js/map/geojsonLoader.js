//js/geojsonLoader.js
 import { getColorByIntensidad } from "../coverage/coverageStyler.js";
 import { getColorByConcentracion, concentracionBreakpoints} from "../airPollution/airPollutionStyler.js";
 import { createCircleIcon } from "../utils/helpers.js";
/**
 * Given GeoJSON data, returns an array of L.Marker objects.
 * @param {Object} data - GeoJSON data
 * @returns {L.Marker[]}
 */
export function getMarkersForGeoJSONLayer(data, layerName) {
  const markers = [];
  const esContaminante = Object.hasOwn(concentracionBreakpoints, layerName)
  console.log("esContaminante y layerName);", esContaminante, layerName);
  L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const props = feature.properties;
      const date = props.date || props.fecha || props.Date || '';
      let valor, color, tipo;

      if (esContaminante) {
        // Normalize keys and layerName to lowercase and remove símbolos
        const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

        const valueKey = Object.keys(props).find(k =>
          normalize(k).includes(normalize(layerName))
        );
        valor = valueKey ? parseFloat(props[valueKey]) : NaN;
        color = getColorByConcentracion(valor, layerName);
        tipo = "Concentración";
        console.log("getColorByConcentracion(valor, layerName);", valor, layerName);
      } else {
        const intensidadKey = Object.keys(props).find(k => k.toLowerCase().startsWith("intensidad"));
        valor = intensidadKey ? parseFloat(props[intensidadKey]) : NaN;
        color = getColorByIntensidad(valor);
        tipo = "Intensidad";
      }

      const marker = L.marker(latlng, {
        icon: createCircleIcon(color),
        [tipo.toLowerCase()]: valor
      });

      let unidad;
      if (/PM/i.test(layerName)) {
        unidad = "µg/m³";
      } else if (/CO/i.test(layerName)) {
        unidad = "ppm";
      } else {
        unidad = "dBm";
      }
      let popupHtml = `<strong>Capa:</strong> ${layerName.replace(/\.geojson$/i, '')}`;
      popupHtml += `<br><strong>${tipo}:</strong> ${valor} <strong> </strong> ${unidad}`;
      if (date) popupHtml += `<br><strong>Fecha:</strong> ${date}`;
      marker.bindPopup(popupHtml);

      markers.push(marker);
      return marker;
    }
  });

  return markers;
}

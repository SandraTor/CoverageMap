//clusterConfig.js

import { getColorByIntensidad } from "../coverage/coverageStyler.js";
import { getMarkerIntensidad } from "../utils/helpers.js"
// Custom iconCreateFunction for clusters
export function iconCreateFunction(cluster) {
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

export const clusterGroup = L.markerClusterGroup({
  iconCreateFunction,
  //personalización de parámetros del cluster
  maxClusterRadius: 40
});
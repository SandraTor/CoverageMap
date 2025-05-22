// js/geojsonLoader.js
function loadGeoJSON(file) {
  const url = `data/${file}?t=${Date.now()}`; // cache-busting con timestamp
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (window.layers[file]) {
        window.map.removeLayer(window.layers[file]);
      }
      window.layers[file] = L.geoJSON(data).addTo(window.map);
    });
}

function loadInitialGeoJSON(files) {
  files.forEach(loadGeoJSON);
}
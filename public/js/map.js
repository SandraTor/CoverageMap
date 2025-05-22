// js/map.js
const map = L.map('map').setView([40.0, -3.7], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

window.map = map;
window.layers = {};

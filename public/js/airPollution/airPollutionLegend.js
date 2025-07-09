// airPollutionLegend.js



export function updateAirPollutionLegend() {
    const legendTitle = document.getElementById('legend-title');
    const selectedRadio = document.querySelector('input[name="layer-radio"]:checked');
    if (selectedRadio) {
        const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
        if (label) {
            legendTitle.textContent=label.textContent;
        }
    }
}
export function hideAirPollutionLegend() {
  const container = document.getElementById('airPollutionLegend');
  if (container) {
    container.style.display = 'none';
  }
}
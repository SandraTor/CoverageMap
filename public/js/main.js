//main.js
// Función para cargar partials en contenedores específicos
function loadPartial(id, file) {
  fetch(file)
    .then(res => {
      if (!res.ok) throw new Error(`No se pudo cargar ${file}`);
      return res.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      document.getElementById(id).innerHTML = `<p>Error cargando componente.</p>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPartial("header", "partials/header.html");
  loadPartial("nav", "partials/nav.html");
  loadPartial("footer", "partials/footer.html");
});
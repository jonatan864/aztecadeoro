function crearBotonFinalizar() {
  // Verificar si el botón ya existe
  if (!document.getElementById("botonFinalizar")) {
    const botonFinalizar = document.createElement("button");
    botonFinalizar.id = "botonFinalizar";
    botonFinalizar.textContent = "Finalizar";
    botonFinalizar.className = "btn btn-primary mt-3 d-block mx-auto";
    botonFinalizar.style.marginTop = "20px";
    botonFinalizar.style.marginBottom = "100px";
    botonFinalizar.addEventListener("click", mostrarResumen);

    const botonContainer = document.getElementById("boton-container");
    botonContainer.appendChild(botonFinalizar);
  } else {
    console.log("El botón de finalizar ya existe.");
  }
}

function displayData(data) {
  // Cargar estado de entregados desde localStorage
  const entregadosGuardados = JSON.parse(localStorage.getItem("entregados")) || {};

  // Crear la tabla HTML para mostrar los datos cargados
  var table = document.createElement("table");
  table.className = "tabla-estilizada";

  var header = table.createTHead();
  var headerRow = header.insertRow();

  var keys = Object.keys(data[0]);
  keys.forEach(function(key) {
      var th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
  });

  var thEntregado = document.createElement("th");
  thEntregado.textContent = "ENTREGADO";
  headerRow.appendChild(thEntregado);

  var tbody = table.createTBody();

  data.forEach(function(row, index) {
      var tr = document.createElement("tr");
      keys.forEach(function(key) {
          var td = document.createElement("td");
          td.textContent = row[key];
          tr.appendChild(td);
      });

      var tdEntregado = document.createElement("td");
      tdEntregado.className = "text-center align-middle";

      var divControles = document.createElement("div");
      divControles.className = "d-flex justify-content-center align-items-center gap-2";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input entregado-checkbox m-0";

      // Identificador único para la fila, usar id o índice
      const idFila = row.id ?? index;

      // Si está marcado en localStorage, marcar checkbox y ocultar fila
      if (entregadosGuardados[idFila]) {
          checkbox.checked = true;
          tr.classList.add("entregado");
          tr.style.display = "none";
      }

      var botonEditar = document.createElement("button");
      botonEditar.className = "btn btn-outline-primary btn-sm p-1 d-flex align-items-center";
      botonEditar.style.fontSize = "12px";
      botonEditar.innerHTML = `<i class="bi bi-pencil-square"></i>`;

      checkbox.addEventListener("change", function () {
        const tr = this.closest("tr");
        if (this.checked) {
          tr.classList.add("entregado");
          tr.style.display = "none";

          // Guardar estado en localStorage
          entregadosGuardados[idFila] = true;
          localStorage.setItem("entregados", JSON.stringify(entregadosGuardados));

          function enfocarInputVisible() {
            const seccion1 = document.getElementById("seccion-filtro");
            const seccion2 = document.getElementById("seccion-filtroTodo");

            if (getComputedStyle(seccion1).display === "block") {
              document.getElementById("searchInput").focus();
            } else if (getComputedStyle(seccion2).display === "block") {
              document.getElementById("searchInputTodo").focus();
            }
          }
          setTimeout(enfocarInputVisible, 50);

        } else {
          tr.classList.remove("entregado");
          tr.style.display = "";

          // Eliminar estado de localStorage
          delete entregadosGuardados[idFila];
          localStorage.setItem("entregados", JSON.stringify(entregadosGuardados));
        }
      });

      divControles.appendChild(checkbox);
      divControles.appendChild(botonEditar);

      tdEntregado.appendChild(divControles);
      tr.appendChild(tdEntregado);
      tbody.appendChild(tr);
  });

  const contenedor = document.getElementById("tabla-contenedor");
  contenedor.innerHTML = "";
  contenedor.appendChild(table);

  crearBotonFinalizar();
}

document.getElementById("btn-limpiar").addEventListener("click", function () {
  // Limpiar tabla
  document.getElementById("tabla-contenedor").innerHTML = "";

  // Limpiar resumen
  document.getElementById("resumen-final").innerHTML = "";

  // Limpiar input file
  document.getElementById("input-excel").value = "";

  // Limpiar nombre del archivo
  document.getElementById("file-name").textContent = "";

  // Limpiar filtro
  document.getElementById("searchInput").value = "";

  // Ocultar filtro y botón si se estaban mostrando
  document.getElementById("seccion-filtro").style.display = "none";
  document.getElementById("boton-container").innerHTML = "";

  // Volver a mostrar el input de carga
  document.getElementById("seccion-input").style.display = "block";

  // Limpiar localStorage de entregados
  localStorage.removeItem("entregados");
});

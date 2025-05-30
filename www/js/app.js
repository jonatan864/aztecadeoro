document.getElementById("input-excel").addEventListener("change", function (e) {
  const file = e.target.files[0];

  if (!file) return;

  if (!file.name.endsWith(".xlsx")) {
    alert("Solo se permiten archivos de excel");
    e.target.value = "";
    return;
  }

  const nombreArchivo = file.name;

  // Aquí haces tu lectura con FileReader y luego llamas a:
  // displayData(parsedData, nombreArchivo);
});

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

function displayData(data, nombreArchivo) {
  if (!data || data.length === 0) {
    alert("El archivo no contiene datos válidos.");
    return;
  }
  // Guardar el nombre del archivo actual en localStorage (opcional)
  localStorage.setItem("archivoActual", nombreArchivo);

  // Cargar entregados por archivo
  const entregadosPorArchivo = JSON.parse(localStorage.getItem("entregadosPorArchivo")) || {};
  const entregadosGuardados = entregadosPorArchivo[nombreArchivo] || {};

  // Crear la tabla HTML para mostrar los datos
  const table = document.createElement("table");
  table.className = "tabla-estilizada";

  const header = table.createTHead();
  const headerRow = header.insertRow();

  const keys = Object.keys(data[0]);
  keys.forEach(function(key) {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });

  const thEntregado = document.createElement("th");
  thEntregado.textContent = "ENTREGADO";
  headerRow.appendChild(thEntregado);

  const tbody = table.createTBody();

  data.forEach(function(row, index) {
    const tr = document.createElement("tr");

    keys.forEach(function(key) {
      const td = document.createElement("td");
      td.textContent = row[key];
      tr.appendChild(td);
    });

    const tdEntregado = document.createElement("td");
    tdEntregado.className = "text-center align-middle";

    const divControles = document.createElement("div");
    divControles.className = "d-flex justify-content-center align-items-center gap-2";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input entregado-checkbox m-0";

    // Usar ID, Clave o índice como identificador único
    const valoresFila = Object.values(row).join("|"); // une todos los campos
    const idFila = btoa(nombreArchivo + "|" + valoresFila); // codifica todo como ID único

    if (entregadosGuardados[idFila]) {
      checkbox.checked = true;
      tr.classList.add("entregado");
      tr.style.display = "none";
    }

    const botonEditar = document.createElement("button");
    botonEditar.className = "btn btn-outline-primary btn-sm p-1 d-flex align-items-center";
    botonEditar.style.fontSize = "12px";
    botonEditar.innerHTML = `<i class="bi bi-pencil-square"></i>`;

    const inputEditar = document.createElement("input");
    inputEditar.style.fontSize = "12px";

    checkbox.addEventListener("change", function () {
      const tr = this.closest("tr");

      const entregadosPorArchivoActual = JSON.parse(localStorage.getItem("entregadosPorArchivo")) || {};
      entregadosPorArchivoActual[nombreArchivo] = entregadosPorArchivoActual[nombreArchivo] || {};

      if (this.checked) {
        tr.classList.add("entregado");
        tr.style.display = "none";

        entregadosPorArchivoActual[nombreArchivo][idFila] = true;
        localStorage.setItem("entregadosPorArchivo", JSON.stringify(entregadosPorArchivoActual));

        setTimeout(() => {
          const seccion1 = document.getElementById("seccion-filtro");
          const seccion2 = document.getElementById("seccion-filtroTodo");

          if (getComputedStyle(seccion1).display === "block") {
            document.getElementById("searchInput").focus();
          } else if (getComputedStyle(seccion2).display === "block") {
            document.getElementById("searchInputTodo").focus();
          }
        }, 50);

      } else {
        tr.classList.remove("entregado");
        tr.style.display = "";

        delete entregadosPorArchivoActual[nombreArchivo][idFila];
        localStorage.setItem("entregadosPorArchivo", JSON.stringify(entregadosPorArchivoActual));
      }
    });

    divControles.appendChild(inputEditar);
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
  localStorage.removeItem("entregadosPorArchivo");
});

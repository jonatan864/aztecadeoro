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

  localStorage.setItem("archivoActual", nombreArchivo);

  const entregadosPorArchivo = JSON.parse(localStorage.getItem("entregadosPorArchivo")) || {};
  const entregadosGuardados = entregadosPorArchivo[nombreArchivo] || {};

  const table = document.createElement("table");
  table.className = "tabla-estilizada";

  const header = table.createTHead();
  const headerRow = header.insertRow();

  const keys = Object.keys(data[0]);
  keys.forEach(function (key) {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });

  const thEntregado = document.createElement("th");
  thEntregado.textContent = "ENTREGADO";
  headerRow.appendChild(thEntregado);

  const tbody = table.createTBody();
  const campoEditable = "CANT."; // Campo que se va a editar

  data.forEach(function (row) {
    const tr = document.createElement("tr");

    keys.forEach(function (key) {
      const td = document.createElement("td");

      if (key === campoEditable) {
        // Crear controles de edición en la celda de CANT
        const divEditable = document.createElement("div");
        divEditable.className = "d-flex align-items-center gap-2";

        const spanValor = document.createElement("span");
        spanValor.textContent = row[key];

        const inputEditar = document.createElement("input");
        inputEditar.id = "inputEditar";
        inputEditar.type = "text";
        inputEditar.className = "form-control form-control-sm";
        inputEditar.style.display = "none";
        inputEditar.style.fontSize = "12px";
        inputEditar.style.maxWidth = "100px";

        const botonEditar = document.createElement("button");
        botonEditar.className = "btn btn-outline-primary btn-sm p-1 d-flex align-items-center";
        botonEditar.style.fontSize = "12px";
        botonEditar.innerHTML = `<i class="bi bi-pencil-square"></i>`;

        botonEditar.addEventListener("click", function () {
          inputEditar.value = row[key];
          inputEditar.style.display = "inline-block";
          spanValor.style.display = "none";
          inputEditar.focus();
        });

        function guardarCambio() {
          const nuevoValor = inputEditar.value.trim();
          if (nuevoValor !== "") {
            row[key] = nuevoValor;
            spanValor.textContent = nuevoValor;
          }
          inputEditar.style.display = "none";
          spanValor.style.display = "inline-block";
        }

        inputEditar.addEventListener("blur", guardarCambio);
        inputEditar.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            guardarCambio();
          }
        });

        divEditable.appendChild(spanValor);
        divEditable.appendChild(inputEditar);
        divEditable.appendChild(botonEditar);
        td.appendChild(divEditable);
      } else {
        td.textContent = row[key];
      }

      tr.appendChild(td);
    });

    const tdEntregado = document.createElement("td");
    tdEntregado.className = "text-center align-middle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input entregado-checkbox m-0";

    const valoresFila = Object.values(row).join("|");
    const idFila = btoa(nombreArchivo + "|" + valoresFila);

    if (entregadosGuardados[idFila]) {
      checkbox.checked = true;
      tr.classList.add("entregado");
      tr.style.display = "none";
    }

    checkbox.addEventListener("change", function () {
      const tr = this.closest("tr");

      const entregadosPorArchivoActual = JSON.parse(localStorage.getItem("entregadosPorArchivo")) || {};
      entregadosPorArchivoActual[nombreArchivo] = entregadosPorArchivoActual[nombreArchivo] || {};

      if (this.checked) {
        tr.classList.add("entregado");
        tr.style.display = "none";
        entregadosPorArchivoActual[nombreArchivo][idFila] = true;
      } else {
        tr.classList.remove("entregado");
        tr.style.display = "";
        delete entregadosPorArchivoActual[nombreArchivo][idFila];
      }

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
    });

    tdEntregado.appendChild(checkbox);
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

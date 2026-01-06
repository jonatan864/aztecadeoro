//Permisos 
document.addEventListener('deviceready', function () {
    var permissions = cordova.plugins.permissions;
    var list = [
        permissions.READ_EXTERNAL_STORAGE,
        permissions.WRITE_EXTERNAL_STORAGE
    ];

    permissions.checkPermission(list, function (status) {
        if (!status.hasPermission) {
            permissions.requestPermissions(list, function (status) {
                if (!status.hasPermission) {
                    alert("Sin permisos no se puede guardar el archivo 😢");
                }
            }, function () {
                alert("Error al pedir permisos");
            });
        }
    }, null);
}, false);

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
 if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
  alert("El archivo no contiene datos válidos.");
  resetApp()
  return;
}


  localStorage.setItem("archivoActual", nombreArchivo);

  const entregadosPorArchivo = JSON.parse(localStorage.getItem("entregadosPorArchivo")) || {};
  const entregadosGuardados = entregadosPorArchivo[nombreArchivo] || {};
  const datosEditados = JSON.parse(localStorage.getItem("datosEditados")) || {};
  if (datosEditados[nombreArchivo]) {
    data = datosEditados[nombreArchivo];
  }


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
  const campoEditableNuevo = "CANT"; // Campo que se va a editar

  data.forEach(function (row) {
    const tr = document.createElement("tr");

    keys.forEach(function (key) {
      const td = document.createElement("td");

      if (key === campoEditable || key === campoEditableNuevo) {
        // Crear controles de edición en la celda de CANT
        const divEditable = document.createElement("div");
        divEditable.className = "d-flex align-items-center gap-2";

        const originalValor = row[key];
        const [parteEditable, parteFija] = originalValor.split(".", 2); // Ej: "15" y "0000/PZ"

        const spanValor = document.createElement("span");
        spanValor.textContent = originalValor;

        const inputEditar = document.createElement("input");
        inputEditar.type = "number";
        inputEditar.className = "form-control form-control-sm";
        inputEditar.style.display = "none";
        inputEditar.style.fontSize = "12px";
        inputEditar.style.maxWidth = "100px";
        inputEditar.min = "0";


        const botonEditar = document.createElement("button");
        botonEditar.className = "btn btn-outline-primary btn-sm p-1 d-flex align-items-center";
        botonEditar.style.fontSize = "12px";
        botonEditar.innerHTML = `<i class="bi bi-pencil-square"></i>`;

        botonEditar.addEventListener("click", function () {
          inputEditar.value = parteEditable; // solo la parte editable
          inputEditar.style.display = "inline-block";
          spanValor.style.display = "none";
          inputEditar.focus();
        });

        inputEditar.addEventListener("focus", function() {
          this.select()
        });

       function guardarCambio() {
          const nuevoEditable = inputEditar.value.trim();
          if (nuevoEditable !== "") {
            const nuevoValor = `${nuevoEditable}.${parteFija}`;
            row[key] = nuevoValor;
            spanValor.textContent = nuevoValor;

            // Guardar en localStorage si es necesario
            const datosEditados = JSON.parse(localStorage.getItem("datosEditados")) || {};
            datosEditados[nombreArchivo] = data;
            localStorage.setItem("datosEditados", JSON.stringify(datosEditados));
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
    const idFila = btoa(encodeURIComponent(nombreArchivo + "|" + valoresFila));

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

  document.getElementById("limpiar-container").style.display = "block";
  crearBotonFinalizar();
}


async function leerPDF(arrayBuffer, nombreArchivo) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    textoCompleto += strings.join(" ") + "\n";
  }

  // 🔧 Normalizar espacios
  textoCompleto = textoCompleto.replace(/\s+/g, " ").trim();

  // Validaciones de formato
  const esFormatoViejo = textoCompleto.includes("CLAVE") && textoCompleto.includes("DESCRIPCIÓN") && textoCompleto.includes("CANT.");
  const esFormatoNuevo = textoCompleto.includes("CANT UNI") && textoCompleto.includes("FACTOR") && textoCompleto.includes("DESCRIPCIÓN");

  if (!esFormatoViejo && !esFormatoNuevo) {
    alert("⚠️ El archivo no tiene el formato esperado. Asegúrate de cargar un archivo válido.");
    resetApp();
    return;
  }

  const productos = extraerProductosDesdeTexto(textoCompleto);
  displayData(productos, nombreArchivo);
  console.log("Texto extraído del PDF:", textoCompleto);
}


function resetApp() {
  document.getElementById("tabla-contenedor").innerHTML = "";
  document.getElementById("resumen-final").innerHTML = "";
  document.getElementById("input-excel").value = "";
  document.getElementById("input-pdf").value = "";
  document.getElementById("file-name").textContent = "";
  document.getElementById("searchInput").value = "";
  document.getElementById("seccion-filtro").style.display = "none";
  document.getElementById("boton-container").innerHTML = "";
  document.getElementById("seccion-input").style.display = "block";
  localStorage.clear();
}

function extraerProductosDesdeTexto(texto) {
  const productos = [];

  // Buscar dónde empieza la tabla (puede ser CANT UNI o CLAVE)
  let indiceTabla = texto.indexOf("CANT UNI");
  if (indiceTabla === -1) indiceTabla = texto.indexOf("CLAVE");
  if (indiceTabla === -1) {
    console.warn("No se encontró inicio de tabla en el PDF.");
    return productos;
  }

  let textoTabla = texto.slice(indiceTabla);

  // 🧹 LIMPIEZA PROFUNDA DE TEXTO (versión mejorada)
  textoTabla = textoTabla
    // Eliminar encabezados de tabla
    .replace(/CANT\s+UNI\s+FACTOR\s+DESCRIPCIÓN\s+P\.?\s*UNIT\.?\s+IMPORTE/gi, "")
    .replace(/CLAVE\s+DESCRIPCIÓN\s+CANT\.\s+P\.?\s*NETO\s+IMPORTE/gi, "")
    // Eliminar bloques entre tablas
    .replace(/Comentario:\s*Traspaso\s*Aplicado[^C]+(?=\sCLAVE|\sCANT)/gi, "")
    .replace(/Traspaso\s+de\s+Artículos[\s\S]*?(?=\s\d{6,})/gi, "")
    // Eliminar leyendas de pie de página
    .replace(/Aplicado\s*Nº\s*Unidades.*?(?=\s\d+\.\d+)/gi, "")
    .replace(/Generado\s*Por\s*SICAR.*?(?=\s\d+\.\d+)/gi, "")
    .replace(/Página\s*\d+/gi, "")
    .replace(/Folio\s*Solicitud:\s*\d+/gi, "")
    // Eliminar fechas repetidas o encabezados tipo “Traspaso Fecha Aplicación”
    .replace(/Traspaso\s+Fecha\s+Aplicación\s+Fecha\s+Generación/gi, "")
    .replace(/\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s*(AM|PM)/gi, "")
    // Normalizar espacios
    .replace(/\s+/g, " ")
    .trim();

  console.log("Texto tabla limpio:", textoTabla);

  // 🧩 REGEX para formato nuevo
  const regexNuevo =
    /(\d+\.\d+)\s+([A-Z]+)\s+(\d+\.\d+)\s+(.+?)\s+\$\s*([\d,]+\.\d{2,3})\s+\$\s*([\d,]+\.\d{2})/g;

  let match;
  while ((match = regexNuevo.exec(textoTabla)) !== null) {
    const [, cantidad, unidad, factor, descripcion, pUnit, importe] = match;
    productos.push({
      "CANT": cantidad,
      "UNI FACTOR": `${unidad} ${factor}`,
      "DESCRIPCIÓN": descripcion.trim(),
      "P. UNIT.": `$${pUnit}`,
      "IMPORTE": `$${importe}`,
    });
  }

  // 🧩 REGEX para formato viejo (si no encontró productos)
  if (productos.length === 0) {
    const regexViejo =
      /(\w+)\s+(.+?)\s+(\d+\.\d{4}\/\w+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})/g;
    while ((match = regexViejo.exec(textoTabla)) !== null) {
      const [, clave, descripcion, cantidad, precioNeto, importe] = match;
      productos.push({
        "CLAVE": clave,
        "DESCRIPCIÓN": descripcion.trim(),
        "CANT.": cantidad,
        "P. NETO": precioNeto,
        "IMPORTE": importe,
      });
    }
  }

  console.log("Productos extraídos:", productos);
  return productos;
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
  localStorage.clear();
});

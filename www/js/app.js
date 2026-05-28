function normalizeKey(k) {
  try {
    return String(k)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s/g, "")
      .toUpperCase();
  } catch (e) {
    return String(k).replace(/\s/g, "").toUpperCase();
  }
}

function esColumnaCantKey(key) {
  const n = normalizeKey(key);
  return n === "CANT" || n === "CANT.";
}

function esColumnaClave(key) {
  return normalizeKey(key) === "CLAVE";
}

function esColumnaDescripcion(key) {
  return normalizeKey(key) === "DESCRIPCION";
}

function esColumnaPrecioOImporte(key) {
  const n = normalizeKey(key);
  if (n.indexOf("IMPORTE") !== -1) {
    return true;
  }
  if (n.indexOf("NETO") !== -1 && n.indexOf("P") !== -1) {
    return true;
  }
  if (n.indexOf("UNIT") !== -1 && n.indexOf("P") !== -1) {
    return true;
  }
  return false;
}

function getAppMode() {
  return window.APP_MODE || localStorage.getItem("appModo") || "revision";
}

function limpiarNombresArchivo() {
  const a = document.getElementById("file-name-excel");
  const b = document.getElementById("file-name-pdf");
  if (a) a.textContent = "";
  if (b) b.textContent = "";
}

function clearSessionData() {
  localStorage.removeItem("entregadosPorArchivo");
  localStorage.removeItem("datosEditados");
  localStorage.removeItem("archivoActual");
}

document.addEventListener(
  "deviceready",
  function () {
    if (!cordova.plugins || !cordova.plugins.permissions) return;
    var permissions = cordova.plugins.permissions;
    var list = [permissions.READ_EXTERNAL_STORAGE, permissions.WRITE_EXTERNAL_STORAGE];
    permissions.checkPermission(
      list,
      function (status) {
        if (!status.hasPermission) {
          permissions.requestPermissions(
            list,
            function (status2) {
              if (!status2.hasPermission) {
                console.warn("Algunos permisos de almacenamiento no fueron concedidos; la exportación usa carpeta de la app.");
              }
            },
            function () {
              console.warn("Error al solicitar permisos de almacenamiento.");
            }
          );
        }
      },
      null
    );
  },
  false
);

document.getElementById("input-excel").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    alert("Solo se permiten archivos .xlsx");
    e.target.value = "";
    return;
  }
  const el = document.getElementById("file-name-excel");
  if (el) el.textContent = file.name;
});

document.getElementById("input-pdf").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const el = document.getElementById("file-name-pdf");
  if (el) el.textContent = file ? file.name : "";
});

function crearBotonFinalizar() {
  if (!document.getElementById("botonFinalizar")) {
    const botonFinalizar = document.createElement("button");
    botonFinalizar.id = "botonFinalizar";
    botonFinalizar.textContent = "Finalizar";
    botonFinalizar.className = "btn btn-primary mt-3 d-block mx-auto";
    botonFinalizar.style.marginTop = "20px";
    botonFinalizar.style.marginBottom = "100px";
    botonFinalizar.addEventListener("click", mostrarResumen);
    document.getElementById("boton-container").appendChild(botonFinalizar);
  }
}

function displayData(data, nombreArchivo) {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
    alert("El archivo no contiene datos válidos.");
    resetApp();
    return;
  }

  const modo = getAppMode();
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
  table._columnKeys = keys;
  const keysMostrar = keys.filter(function (key) {
    return !esColumnaPrecioOImporte(key);
  });

  keysMostrar.forEach(function (key) {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });

  const thEntregado = document.createElement("th");
  thEntregado.textContent = "ENTREGADO";
  headerRow.appendChild(thEntregado);

  const tbody = table.createTBody();

  data.forEach(function (row) {
    const tr = document.createElement("tr");
    tr._rowData = row;

    keysMostrar.forEach(function (key) {
      const td = document.createElement("td");

      if (esColumnaCantKey(key)) {
        const divEditable = document.createElement("div");
        divEditable.className = "d-flex align-items-center gap-2";

        const raw = row[key];
        const valorInicial = raw != null ? String(raw) : "";

        const spanValor = document.createElement("span");
        spanValor.textContent = valorInicial;

        const inputEditar = document.createElement("input");
        inputEditar.className = "form-control form-control-sm";
        inputEditar.style.display = "none";
        inputEditar.style.fontSize = "12px";
        inputEditar.style.maxWidth = "120px";

        if (modo === "pedido") {
          inputEditar.type = "text";
          inputEditar.setAttribute("inputmode", "decimal");
          inputEditar.placeholder = "Cantidad";
        } else {
          inputEditar.type = "number";
          inputEditar.min = "0";
        }

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "btn btn-outline-primary btn-sm p-1 d-flex align-items-center";
        botonEditar.style.fontSize = "12px";
        botonEditar.innerHTML = '<i class="bi bi-pencil-square"></i>';

        let parteEditable = "";
        let parteFija = "";

        botonEditar.addEventListener("click", function () {
          const actual = row[key] != null ? String(row[key]) : "";
          spanValor.textContent = actual;
          if (modo === "revision") {
            const parts = actual.split(".", 2);
            parteEditable = parts[0] || "";
            parteFija = parts.length > 1 ? parts[1] : "";
            inputEditar.value = parteEditable;
          } else {
            inputEditar.value = actual;
          }
          inputEditar.style.display = "inline-block";
          spanValor.style.display = "none";
          inputEditar.focus();
        });

        inputEditar.addEventListener("focus", function () {
          this.select();
        });

        function guardarCambio() {
          const nuevoEditable = inputEditar.value.trim();
          if (nuevoEditable === "") {
            inputEditar.style.display = "none";
            spanValor.style.display = "inline-block";
            return;
          }

          let nuevoValor;
          if (modo === "pedido") {
            nuevoValor = nuevoEditable;
          } else {
            nuevoValor = parteFija !== "" ? nuevoEditable + "." + parteFija : nuevoEditable;
          }

          row[key] = nuevoValor;
          spanValor.textContent = nuevoValor;

          const datosEditados2 = JSON.parse(localStorage.getItem("datosEditados")) || {};
          datosEditados2[nombreArchivo] = data;
          localStorage.setItem("datosEditados", JSON.stringify(datosEditados2));

          inputEditar.style.display = "none";
          spanValor.style.display = "inline-block";
        }

        inputEditar.addEventListener("blur", guardarCambio);
        inputEditar.addEventListener("keydown", function (e) {
          if (e.key === "Enter") guardarCambio();
        });

        divEditable.appendChild(spanValor);
        divEditable.appendChild(inputEditar);
        divEditable.appendChild(botonEditar);
        td.appendChild(divEditable);
      } else {
        td.textContent = row[key] != null ? String(row[key]) : "";
      }

      tr.appendChild(td);
    });

    const tdEntregado = document.createElement("td");
    tdEntregado.className = "text-center align-middle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input entregado-checkbox m-0";

    const valoresFila = keys.map(function (k) {
      return row[k] != null ? String(row[k]) : "";
    }).join("|");
    const idFila = btoa(encodeURIComponent(nombreArchivo + "|" + valoresFila));

    if (entregadosGuardados[idFila]) {
      checkbox.checked = true;
      tr.classList.add("entregado");
      tr.style.display = "none";
    }

    checkbox.addEventListener("change", function () {
      const trEl = this.closest("tr");
      const entregadosPorArchivoActual = JSON.parse(localStorage.getItem("entregadosPorArchivo")) || {};
      entregadosPorArchivoActual[nombreArchivo] = entregadosPorArchivoActual[nombreArchivo] || {};

      if (this.checked) {
        trEl.classList.add("entregado");
        trEl.style.display = "none";
        entregadosPorArchivoActual[nombreArchivo][idFila] = true;
      } else {
        trEl.classList.remove("entregado");
        trEl.style.display = "";
        delete entregadosPorArchivoActual[nombreArchivo][idFila];
      }

      localStorage.setItem("entregadosPorArchivo", JSON.stringify(entregadosPorArchivoActual));

      setTimeout(function () {
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
  if (getAppMode() !== "revision") {
    alert("Los PDF de traspaso solo aplican en modo «Revisar pedido / traspaso».");
    return;
  }
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(function (item) {
      return item.str;
    });
    textoCompleto += strings.join(" ") + "\n";
  }

  textoCompleto = textoCompleto.replace(/\s+/g, " ").trim();

  const esFormatoViejo =
    textoCompleto.includes("CLAVE") &&
    textoCompleto.includes("DESCRIPCIÓN") &&
    textoCompleto.includes("CANT.");
  const esFormatoNuevo =
    textoCompleto.includes("CANT UNI") &&
    textoCompleto.includes("FACTOR") &&
    textoCompleto.includes("DESCRIPCIÓN");

  if (!esFormatoViejo && !esFormatoNuevo) {
    alert("El archivo no tiene el formato esperado. Asegúrate de cargar un PDF válido de SICAR.");
    resetApp();
    return;
  }

  const productos = extraerProductosDesdeTexto(textoCompleto);
  displayData(productos, nombreArchivo);
}

function resetApp() {
  document.getElementById("tabla-contenedor").innerHTML = "";
  document.getElementById("resumen-final").innerHTML = "";
  document.getElementById("input-excel").value = "";
  document.getElementById("input-pdf").value = "";
  limpiarNombresArchivo();
  document.getElementById("searchInput").value = "";
  document.getElementById("searchInputTodo").value = "";
  document.getElementById("seccion-filtro").style.display = "none";
  document.getElementById("seccion-filtroTodo").style.display = "none";
  document.getElementById("boton-container").innerHTML = "";
  document.getElementById("limpiar-container").style.display = "none";
  document.getElementById("tipo-archivo").value = "";
  document.getElementById("excel").style.display = "none";
  document.getElementById("pdf").style.display = "none";
  document.getElementById("btn-cargar").style.display = "none";
  clearSessionData();
  document.getElementById("seccion-input").style.display = "block";
}

function extraerProductosDesdeTexto(texto) {
  const productos = [];

  let indiceTabla = texto.indexOf("CANT UNI");
  if (indiceTabla === -1) indiceTabla = texto.indexOf("CLAVE");
  if (indiceTabla === -1) {
    console.warn("No se encontró inicio de tabla en el PDF.");
    return productos;
  }

  let textoTabla = texto.slice(indiceTabla);

  textoTabla = textoTabla
    .replace(/CANT\s+UNI\s+FACTOR\s+DESCRIPCIÓN\s+P\.?\s*UNIT\.?\s+IMPORTE/gi, "")
    .replace(/CLAVE\s+DESCRIPCIÓN\s+CANT\.\s+P\.?\s*NETO\s+IMPORTE/gi, "")
    .replace(/CLAVEDESCRIPCIÓNCANT\.P\.\s*NETOIMPORTE/gi, "")
    .replace(/Comentario:\s*Traspaso\s*Aplicado[^C]+(?=\sCLAVE|\sCANT)/gi, "")
    .replace(
      /Comentario:\s*N[ºo]?\s*Unidades:\s*[\d.]+\s*Total\s*\$[\d.,]+(?:\s*[\d/:\sAPM-]+)?(?:\s*\/\s*\d+)?/gi,
      " "
    )
    .replace(/\s*\/\s*\d+\s*Generado\s*Por\s*SICAR\s*P[aá]gina\s*\d+/gi, " ")
    .replace(/Traspaso\s+de\s+Artículos[\s\S]*?(?=\s\d{6,})/gi, "")
    .replace(/Aplicado\s*Nº\s*Unidades.*?(?=\s\d+\.\d+)/gi, "")
    .replace(/Página\s*\d+/gi, "")
    .replace(/Folio\s*Solicitud:\s*\d+/gi, "")
    .replace(/Traspaso\s+Fecha\s+Aplicación\s+Fecha\s+Generación/gi, "")
    .replace(/\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s*(AM|PM)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const regexNuevo =
    /(\d+\.\d+)\s+([A-Z]+)\s+(\d+\.\d+)\s+(.+?)\s+\$\s*([\d,]+\.\d{2,3})\s+\$\s*([\d,]+\.\d{2})/g;

  let match;
  while ((match = regexNuevo.exec(textoTabla)) !== null) {
    const cantidad = match[1];
    const unidad = match[2];
    const factor = match[3];
    const descripcion = match[4];
    const pUnit = match[5];
    const importe = match[6];
    productos.push({
      CANT: cantidad,
      "UNI FACTOR": unidad + " " + factor,
      DESCRIPCIÓN: descripcion.trim(),
      "P. UNIT.": "$" + pUnit,
      IMPORTE: "$" + importe,
    });
  }

  if (productos.length === 0) {
    extraerLineasPdfFormatoViejo(textoTabla).forEach(function (linea) {
      productos.push({
        CLAVE: linea.clave,
        DESCRIPCIÓN: linea.descripcion,
        "CANT.": linea.cantidad,
        "P. NETO": linea.precioNeto,
        IMPORTE: linea.importe,
      });
    });
  }

  return productos;
}

function extraerLineasPdfFormatoViejo(textoTabla) {
  const candidatos = [];

  const regexLinea = /(.+?)\s+(\d+\.\d{4}\/\w+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})(?=\s+\S|$)/g;
  let match;

  while ((match = regexLinea.exec(textoTabla)) !== null) {
     const bloque = (match[1] || "")
      .replace(/^.*CLAVE\s+DESCRIPCI\S*N\s+CANT\.\s+P\.?\s*NETO\s+IMPORTE\s*/i, "")
      .trim();
    let partes = bloque.match(/^(\S+)\s+(.+)$/);

    if (partes && !esLineaProductoPdfViejoValida(partes[1], partes[2])) {
      const productoDentroDelBloque = bloque.match(/(\d{5,}\s+.+)$/);
      if (productoDentroDelBloque) {
        partes = productoDentroDelBloque[1].match(/^(\S+)\s+(.+)$/);
      }
    }

    if (partes) {
      candidatos.push({
        priority: 1,
        start: match.index,
        end: match.index + match[0].length,
        clave: partes[1],
        descripcion: partes[2].trim(),
        cantidad: match[2],
        precioNeto: match[3],
        importe: match[4],
      });
    }
  }

  candidatos.sort(function (a, b) {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return a.priority - b.priority;
  });

  const elegidos = [];
  for (let i = 0; i < candidatos.length; i++) {
    const c = candidatos[i];
    if (!esLineaProductoPdfViejoValida(c.clave, c.descripcion)) {
      continue;
    }
    while (elegidos.length > 0 && elegidos[elegidos.length - 1].end > c.start) {
      const last = elegidos[elegidos.length - 1];
      if (last.priority > c.priority) {
        elegidos.pop();
      } else {
        break;
      }
    }
    if (elegidos.length === 0 || elegidos[elegidos.length - 1].end <= c.start) {
      elegidos.push(c);
    }
  }

  return elegidos;
}

function esLineaProductoPdfViejoValida(clave, descripcion) {
  const desc = (descripcion || "").toUpperCase();
  const c = String(clave || "").trim();
  if (!c) {
    return false;
  }
  if (/^(TOTAL|COMENTARIO|GENERADO|SICAR|TRASPASO|CLAVE|IMPORTE|PAGINA|FUENTE|FOLIO)$/i.test(c)) {
    return false;
  }
  if (/TOTAL\s*\$/.test(desc)) {
    return false;
  }
  if (/N[ºO]?\s*UNIDADES/.test(desc)) {
    return false;
  }
  if (/GENERADO\s+POR/.test(desc) || /SICAR\s*P/.test(desc)) {
    return false;
  }
  if (/TRASPASO\s+DE\s+ART/.test(desc)) {
    return false;
  }
  if (/FOLIO\s+SOLICITUD/.test(desc)) {
    return false;
  }
  if (/CLAVEDESCRIPCI[OÓ]N/.test(desc)) {
    return false;
  }
  if (/^\d+$/.test(c) && c.length < 5) {
    return false;
  }
  return true;
}

document.getElementById("btn-limpiar").addEventListener("click", function () {
  document.getElementById("tabla-contenedor").innerHTML = "";
  document.getElementById("resumen-final").innerHTML = "";
  document.getElementById("input-excel").value = "";
  document.getElementById("input-pdf").value = "";
  limpiarNombresArchivo();
  document.getElementById("searchInput").value = "";
  document.getElementById("searchInputTodo").value = "";
  document.getElementById("seccion-filtro").style.display = "none";
  document.getElementById("seccion-filtroTodo").style.display = "none";
  document.getElementById("boton-container").innerHTML = "";
  document.getElementById("seccion-input").style.display = "block";
  clearSessionData();
});

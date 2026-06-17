let timeout;
function irAlInicioCuandoHayBusqueda(filtro) {
  if (filtro !== "") {
    document.getElementById("inicio").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.getElementById("searchInput").addEventListener("input", function () {
  clearTimeout(timeout);
  const filtro = this.value.toLowerCase();
  irAlInicioCuandoHayBusqueda(filtro);
  timeout = setTimeout(function () {
    const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");
    filas.forEach(function (fila) {
      const textoFila = fila.textContent.toLowerCase();
      const filaEntregada = fila.classList.contains("entregado");
      if (filtro === "" || textoFila.includes(filtro)) {
        fila.style.display = filaEntregada ? "none" : "";
      } else {
        fila.style.display = "none";
      }
    });
  }, 300);
});

let timeoutT;

document.getElementById("searchInputTodo").addEventListener("input", function () {
  clearTimeout(timeoutT);
  const filtro = this.value.toLowerCase();
  irAlInicioCuandoHayBusqueda(filtro);
  timeoutT = setTimeout(function () {
    const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");
    filas.forEach(function (fila) {
      const textoFila = fila.textContent.toLowerCase();
      if (filtro === "" || textoFila.includes(filtro)) {
        fila.style.display = "";
      } else {
        fila.style.display = "none";
      }
    });
  }, 300);
});

document.getElementById("searchInput").addEventListener("focus", function () {
  this.select();
});

document.getElementById("searchInputTodo").addEventListener("focus", function () {
  this.select();
});

function aplicarInterfazPorModo() {
  const m = typeof getAppMode === "function" ? getAppMode() : "revision";
  const opcionPdf = document.getElementById("opcion-pdf");
  const label = document.getElementById("modo-activo-label");
  const titulo = document.getElementById("titulo-flujo");
  if (m === "pedido") {
    if (opcionPdf) opcionPdf.hidden = false;
    if (label) {
      label.textContent = "Modo: hacer pedido — surtido desde bodega (CANT editable por completo)";
    }
    if (titulo) titulo.textContent = "Cargar Excel o PDF del pedido (sucursal)";
  } else {
    if (opcionPdf) opcionPdf.hidden = false;
    if (label) {
      label.textContent = "Modo: revisar pedido o traspaso — formato SICAR (CANT tipo 1.000PZA)";
    }
    if (titulo) titulo.textContent = "Cargar archivo de traspaso o pedido";
  }
}

document.getElementById("btn-modo-pedido").addEventListener("click", function () {
  window.APP_MODE = "pedido";
  localStorage.setItem("appModo", "pedido");
  document.getElementById("seccion-modo").style.display = "none";
  document.getElementById("seccion-flujo").style.display = "block";
  aplicarInterfazPorModo();
});

document.getElementById("btn-modo-revision").addEventListener("click", function () {
  window.APP_MODE = "revision";
  localStorage.setItem("appModo", "revision");
  document.getElementById("seccion-modo").style.display = "none";
  document.getElementById("seccion-flujo").style.display = "block";
  aplicarInterfazPorModo();
});

document.getElementById("btn-cambiar-modo").addEventListener("click", function () {
  if (typeof resetApp === "function") resetApp();
  document.getElementById("seccion-flujo").style.display = "none";
  document.getElementById("seccion-modo").style.display = "block";
  window.APP_MODE = null;
  localStorage.removeItem("appModo");
});

document.getElementById("tipo-archivo").addEventListener("change", function () {
  const tipo = this.value;
  document.getElementById("excel").style.display = tipo === "excel" ? "block" : "none";
  document.getElementById("pdf").style.display = tipo === "pdf" ? "block" : "none";
  document.getElementById("btn-cargar").style.display = tipo ? "block" : "none";
});

document.getElementById("btn-cargar").addEventListener("click", function () {
  const tipoArchivo = document.getElementById("tipo-archivo").value;

  if (!tipoArchivo) {
    alert("Por favor, selecciona el tipo de archivo.");
    return;
  }

  if (tipoArchivo === "excel") {
    const archivo = document.getElementById("input-excel").files[0];
    if (!archivo) {
      alert("Por favor, selecciona un archivo Excel.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
      displayData(json, archivo.name);
    };
    reader.readAsArrayBuffer(archivo);
  }

  if (tipoArchivo === "pdf") {
    const archivoPDF = document.getElementById("input-pdf").files[0];
    if (!archivoPDF) {
      alert("Por favor, selecciona un archivo PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const typedarray = new Uint8Array(reader.result);
      leerPDF(typedarray, archivoPDF.name);
    };
    reader.readAsArrayBuffer(archivoPDF);
  }
});

function extraerResumenDesdeFila(tr) {
  const row = tr._rowData;
  const table = tr.closest("table");
  if (!row || !table || !table._columnKeys) return null;
  const keys = table._columnKeys;
  let clave = "";
  let descripcion = "";
  let cant = "";
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (typeof esColumnaClave === "function" && esColumnaClave(k)) {
      clave = row[k] != null ? String(row[k]) : "";
    } else if (typeof esColumnaDescripcion === "function" && esColumnaDescripcion(k)) {
      descripcion = row[k] != null ? String(row[k]) : "";
    } else if (typeof esColumnaCantKey === "function" && esColumnaCantKey(k)) {
      cant = row[k] != null ? String(row[k]) : "";
    }
  }
  return { clave: clave, descripcion: descripcion, cant: cant };
}

function parseCantParaExportar(raw) {
  const s = String(raw).trim();
  if (!s) return "";
  const antesBarra = s.split("/")[0].trim().replace(",", ".");
  const n = parseFloat(antesBarra);
  if (!isNaN(n)) return n;
  return antesBarra;
}

function exportarExcelCordova(wboutBase64, fileName) {
  var safeName = fileName.replace(/[^\w.\-]+/g, "_");
  var mime = "application/vnd.ms-excel";
  var blob = b64toBlob(wboutBase64, mime);

  function rutaLegible(url) {
    if (!url) return "";
    try {
      return decodeURIComponent(url.replace(/^file:\/\//, ""));
    } catch (e) {
      return url;
    }
  }

  function alertaDondeEsta(pathUrl) {
    var ruta = rutaLegible(pathUrl);
    alert(
      "Archivo guardado en el almacenamiento privado de la app (Android 10–15 lo mantiene así por seguridad).\n\n" +
        "Ruta técnica:\n" +
        ruta +
        "\n\n" +
        "Cómo encontrarlo: abre «Archivos» o «Mis archivos» → busca la carpeta Android → data → [nombre del paquete de esta app] → files (o cache). " +
        "En algunos equipos debes pulsar «Usar esta carpeta» o activar «Mostrar archivos internos».\n\n" +
        "Si al abrir no aparece ninguna app, instala «Hojas de cálculo» de Google o Microsoft Excel."
    );
  }

  function guardarConCordovaPlugins() {
    if (!window.cordova || !cordova.file) {
      alert(
        "Falta el plugin cordova-plugin-file. En la carpeta del proyecto ejecuta:\ncordova plugin add cordova-plugin-file\ny vuelve a compilar el APK."
      );
      return;
    }

    var dir =
      cordova.file.externalDataDirectory ||
      cordova.file.externalCacheDirectory ||
      cordova.file.dataDirectory;

    if (!dir) {
      alert("No se pudo obtener una carpeta de la aplicación para guardar el archivo.");
      return;
    }

    window.resolveLocalFileSystemURL(
      dir,
      function (dirEntry) {
        dirEntry.getFile(
          safeName,
          { create: true, exclusive: false },
          function (fileEntry) {
            fileEntry.createWriter(function (writer) {
              writer.onwriteend = function () {
                var path = fileEntry.nativeURL || (fileEntry.toURL && fileEntry.toURL());
                alertaDondeEsta(path);
                if (cordova.plugins && cordova.plugins.fileOpener2) {
                  cordova.plugins.fileOpener2.open(path, mime, {
                    error: function () {
                      console.warn("fileOpener2: no se pudo abrir el archivo; ya se mostró la ruta.");
                    },
                  });
                }
              };
              writer.onerror = function (e) {
                console.error(e);
                alert("No se pudo escribir el archivo. Detalle en consola.");
              };
              try {
                writer.write(blob);
              } catch (writeErr) {
                console.error(writeErr);
                alert("Error al escribir el archivo en este dispositivo.");
              }
            }, fail);
          },
          fail
        );
      },
      fail
    );
  }

  function fail(e) {
    console.error(e);
    alert("Error al acceder al sistema de archivos del dispositivo.");
  }

  if (typeof navigator !== "undefined" && navigator.share && typeof File !== "undefined") {
    try {
      var archivoCompartir = new File([blob], safeName, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [archivoCompartir] })) {
        navigator
          .share({
            files: [archivoCompartir],
            title: safeName,
            text: "Exportación traspasos",
          })
          .catch(function (err) {
            if (err && err.name === "AbortError") {
              return;
            }
            console.warn("Web Share no disponible o falló; usando almacenamiento de la app.", err);
            guardarConCordovaPlugins();
          });
        return;
      }
    } catch (sharePrep) {
      console.warn("Preparación Web Share:", sharePrep);
    }
  }

  guardarConCordovaPlugins();
}

function mostrarResumen() {
  const entregados = [];
  const pendientes = [];

  const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");

  filas.forEach(function (tr) {
    const checkbox = tr.querySelector("input.entregado-checkbox");
    if (!checkbox) return;

    const r = extraerResumenDesdeFila(tr);
    if (!r) return;

    const filaData = [r.clave, r.descripcion, r.cant];

    if (checkbox.checked) {
      entregados.push(filaData);
    } else {
      pendientes.push(filaData);
    }
  });

  const titulosResumen = ["CLAVE", "DESCRIPCIÓN", "CANT"];

  const crearTabla = function (datos, titulo, claseTitulo, claseFila) {
    const contenedor = document.createElement("div");
    contenedor.className = "mb-4";

    const h5 = document.createElement("h5");
    h5.className = "mb-3 fw-bold " + claseTitulo;
    h5.textContent = titulo + " (" + datos.length + ")";
    contenedor.appendChild(h5);

    const table = document.createElement("table");
    table.className = "tabla-estilizada";
    const thead = document.createElement("thead");
    thead.style.fontSize = "1rem";
    thead.innerHTML =
      "<tr class=\"table-secondary\">" +
      titulosResumen
        .map(function (t) {
          return "<th>" + t + "</th>";
        })
        .join("") +
      "</tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    datos.forEach(function (fila) {
      const tr = document.createElement("tr");
      tr.className = claseFila;

      fila.forEach(function (celda) {
        const td = document.createElement("td");
        td.textContent = celda;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    contenedor.appendChild(table);

    const botonExportar = document.createElement("button");
    botonExportar.textContent = "Exportar " + titulo;
    botonExportar.className = "btn btn-secondary mt-2 d-block mx-auto";
    botonExportar.addEventListener("click", function () {
      if (datos.length === 0) {
        alert("No hay datos en " + titulo + " para exportar.");
        return;
      }

      const datosExportar = datos.map(function (fila) {
        return {
          CLAVE: fila[0],
          CANT: parseCantParaExportar(fila[2]),
        };
      });

      const ws = XLSX.utils.json_to_sheet(datosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, titulo.substring(0, 31));

      const hoy = new Date();
      const fecha = hoy.toISOString().split("T")[0];
      const fileName = titulo.replace(/\s+/g, "_") + "_" + fecha + ".xls";

      const wbout = XLSX.write(wb, { bookType: "biff8", type: "base64" });

      if (window.cordova) {
        exportarExcelCordova(wbout, fileName);
      } else {
        XLSX.writeFile(wb, fileName, { bookType: "biff8" });
      }
    });
    contenedor.appendChild(botonExportar);

    return contenedor;
  };

  const resumenFinal = document.getElementById("resumen-final");
  resumenFinal.innerHTML = "";

  const botonVerTodo = document.createElement("button");
  botonVerTodo.textContent = "Ver todo";
  botonVerTodo.className = "btn btn-secondary mt-3 d-block mx-auto";
  botonVerTodo.style.marginBottom = "20px";
  botonVerTodo.addEventListener("click", mostrarTablaOriginal);

  resumenFinal.appendChild(botonVerTodo);
  resumenFinal.appendChild(crearTabla(entregados, "Productos entregados", "text-success", "table-success"));
  resumenFinal.appendChild(crearTabla(pendientes, "Productos pendientes", "text-danger", "table-danger"));

  document.querySelector("#tabla-contenedor table").style.display = "none";
  document.querySelector("#seccion-filtro").style.display = "none";

  const botonFinalizar = document.getElementById("botonFinalizar");
  if (botonFinalizar) {
    botonFinalizar.style.display = "none";
    botonFinalizar.classList.remove("d-block");
  }

  document.getElementById("resumen-final").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("limpiar-container").style.display = "block";
}

function ocultarLimpiar() {
  document.getElementById("limpiar-container").style.display = "none";
  document.getElementById("seccion-filtroTodo").style.display = "none";
}

function mostrarTablaOriginal() {
  document.querySelector("#tabla-contenedor table").style.display = "";
  document.querySelector("#seccion-filtro").style.display = "block";

  document.getElementById("resumen-final").innerHTML = "";

  const botonFinalizar = document.getElementById("botonFinalizar");
  if (botonFinalizar) {
    botonFinalizar.style.display = "block";
    botonFinalizar.classList.add("d-block");
  }

  document.getElementById("limpiar-container").style.display = "none";

  const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");
  filas.forEach(function (fila) {
    fila.style.display = "";
  });

  const botonFiltrar = document.createElement("button");
  botonFiltrar.style.fontSize = "8px";
  botonFiltrar.innerHTML = '<i class="bi bi-hourglass-split"></i> Ver pendientes';
  botonFiltrar.className = "btn btn-secondary position-absolute top-0 end-0 m-3";
  botonFiltrar.addEventListener("click", ocultarMarcados);

  const filtroTodo = document.getElementById("seccion-filtroTodo");
  filtroTodo.appendChild(botonFiltrar);

  document.getElementById("seccion-filtroTodo").style.display = "block";
  document.getElementById("seccion-filtro").style.display = "none";
  limpiarBuscadores();
  document.getElementById("inicio").scrollIntoView({ behavior: "smooth", block: "start" });
}

function ocultarMarcados() {
  document.getElementById("seccion-filtroTodo").style.display = "none";
  document.getElementById("seccion-filtro").style.display = "block";

  const filtro = document.getElementById("searchInput").value.toLowerCase();
  const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");

  filas.forEach(function (fila) {
    const textoFila = fila.textContent.toLowerCase();
    const filaEntregada = fila.classList.contains("entregado");

    if (filtro === "" || textoFila.includes(filtro)) {
      fila.style.display = filaEntregada ? "none" : "";
    } else {
      fila.style.display = "none";
    }
  });

  limpiarBuscadores();
}

function limpiarBuscadores() {
  ["searchInput", "searchInputTodo"].forEach(function (id) {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

function ocultarInput() {
  document.getElementById("seccion-input").style.display = "none";
  document.getElementById("seccion-filtro").style.display = "block";
}

document.getElementById("searchInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    this.select();
  }
});

document.getElementById("searchInputTodo").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    this.select();
  }
});

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

if ("serviceWorker" in navigator && !window.cordova) {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}

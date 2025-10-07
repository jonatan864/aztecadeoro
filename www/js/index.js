// Evento de búsqueda
let timeout;
document.getElementById("searchInput").addEventListener("input", function () {
    clearTimeout(timeout);
    const filtro = this.value.toLowerCase();
    timeout = setTimeout(function () {
        const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");
        filas.forEach((fila) => {
            const textoFila = fila.textContent.toLowerCase();
            const filaEntregada = fila.classList.contains("entregado");

            // Mostrar solo las filas que no están entregadas o aquellas que coinciden con el filtro
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
    timeoutT = setTimeout(function () {
        const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");
        filas.forEach((fila) => {
            const textoFila = fila.textContent.toLowerCase();

            // Mostrar solo las filas que no están entregadas o aquellas que coinciden con el filtro
            if (filtro === "" || textoFila.includes(filtro)) {
                fila.style.display = "";
            } else {
                fila.style.display = "none";
            }
        });
    }, 300);
});

// Selecciona el campo de búsqueda
const inputBusqueda = document.getElementById("searchInput");

// Agregar un evento 'focus' al campo de búsqueda
inputBusqueda.addEventListener("focus", function() {
    // Selecciona todo el texto dentro del campo de búsqueda
    this.select(); // Esto selecciona todo el texto automáticamente
});

// Selecciona el campo de búsqueda
const inputBusquedaT = document.getElementById("searchInputTodo");

// Agregar un evento 'focus' al campo de búsqueda
inputBusquedaT.addEventListener("focus", function() {
    // Selecciona todo el texto dentro del campo de búsqueda
    this.select(); // Esto selecciona todo el texto automáticamente
});

document.getElementById("tipo-archivo").addEventListener("change", function () {
  const tipo = this.value;
  document.getElementById("excel").style.display = (tipo === "excel") ? "block" : "none";
  document.getElementById("pdf").style.display = (tipo === "pdf") ? "block" : "none";
  document.getElementById("btn-cargar").style.display = "block";
});

// Evento para el botón de cargar datos
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
      const json = XLSX.utils.sheet_to_json(sheet);
      displayData(json, archivo.name); // Pasa el nombre del archivo también
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


// Función para mostrar el resumen
function mostrarResumen() {
    const entregados = [];
    const pendientes = [];
  
    const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");

    filas.forEach(tr => {
        const checkbox = tr.querySelector("input.entregado-checkbox");

        if (!checkbox) return;

        const celdas = tr.querySelectorAll("td");
        const filaData = [
            celdas[0].textContent.trim(), // CANT
            celdas[1].textContent.trim(), // UNI FACTOR
            celdas[2].textContent.trim()  // DESCRIPCION
        ];

        if (checkbox.checked) {
            entregados.push(filaData);
        } else {
            pendientes.push(filaData);
        }
    });

    const crearTabla = (datos, titulo, claseTitulo, claseFila) => {
        const contenedor = document.createElement("div");
        contenedor.className = "mb-4";

        const h5 = document.createElement("h5");
        h5.className = `mb-3 fw-bold ${claseTitulo}`;
        h5.textContent = `${titulo} (${datos.length})`;
        contenedor.appendChild(h5);

        const table = document.createElement("table");
        table.className = "tabla-estilizada";
        const thead = document.createElement("thead");
        thead.style.fontSize = '1rem'
        thead.innerHTML = `
            <tr class="table-secondary">
                <th>CANT</th>
                <th>UNI FACTOR</th>
                <th>DESCRIPCION</th>  
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        datos.forEach(fila => {
            const tr = document.createElement("tr");
            tr.className = claseFila;

            fila.forEach(celda => {
                const td = document.createElement("td");
                td.textContent = celda;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        contenedor.appendChild(table);

// 👇 Botón de exportar
const botonExportar = document.createElement("button");
botonExportar.textContent = `Exportar ${titulo}`;
botonExportar.className = "btn btn-secondary mt-2 d-block mx-auto";
botonExportar.addEventListener("click", () => {
    if (datos.length === 0) {
        alert(`No hay datos en ${titulo} para exportar.`);
        return;
    }

    // Solo CLAVE y CANT
    const datosExportar = datos.map(fila => ({
        CLAVE: fila[0],
        CANT: parseInt(fila[2].split("/")[0], 10)
    }));

    // Crear hoja de Excel
    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, titulo);

    // Nombre del archivo con fecha
    const hoy = new Date();
    const fecha = hoy.toISOString().split("T")[0];
    const fileName = `${titulo}_${fecha}.xls`;

    // Generar Excel en base64 (Excel 97-2003)
    const wbout = XLSX.write(wb, { bookType: "biff8", type: "base64" });

    if (window.cordova && window.SAF) {
        // 🔹 Pedimos al usuario la carpeta
        window.SAF.getDirectory(function(uri){
            saveExcelSAF(uri, wbout, fileName);
        }, function(err){
            alert("No se pudo seleccionar la carpeta: " + err);
        });
    } else {
        // PC
        XLSX.writeFile(wb, fileName, { bookType: "biff8" });
    }
});
contenedor.appendChild(botonExportar);

return contenedor;

/* ================================
   FUNCIONES PARA CORDOVA + SAF
   ================================ */

// Guardar archivo en la carpeta elegida por el usuario
function saveExcelSAF(uri, base64Data, fileName){
    window.SAF.writeFile(uri, fileName, base64Data, "base64",
        function(){
            alert("Archivo guardado correctamente: " + fileName);
        },
        function(err){
            alert("Error guardando el archivo: " + err);
        }
    );
}

// Convertir base64 a Blob (para otras funciones si las necesitas)
function b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 512;
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

    };

    const resumenFinal = document.getElementById("resumen-final");
    resumenFinal.innerHTML = "";

    const botonVerTodo = document.createElement("button");
    botonVerTodo.textContent = "Ver Todo";
    botonVerTodo.className = "btn btn-secondary mt-3 d-block mx-auto";
    botonVerTodo.style.marginBottom = "20px";
    botonVerTodo.addEventListener("click", mostrarTablaOriginal);
  
    resumenFinal.appendChild(botonVerTodo);
    resumenFinal.appendChild(crearTabla(entregados, "Productos Entregados", "text-success", "table-success"));
    resumenFinal.appendChild(crearTabla(pendientes, "Productos Pendientes", "text-danger", "table-danger"));

    document.querySelector("#tabla-contenedor table").style.display = "none";
    document.querySelector('#seccion-filtro').style.display = "none";

    const botonFinalizar = document.getElementById("botonFinalizar");
    if (botonFinalizar) {
        botonFinalizar.id = "botonFinalizar"
        botonFinalizar.style.display = "none";
        botonFinalizar.classList.remove("d-block");
    }

    document.getElementById("resumen-final").scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("limpiar-container").style.display = "block";
}

// Función para ocultar el contenedor de limpiar
function ocultarLimpiar() {
    document.getElementById("limpiar-container").style.display = "none";
    document.getElementById("seccion-filtroTodo").style.display = "none";
}

// Función para mostrar la tabla original
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
    filas.forEach(fila => {
        fila.style.display = "";
    });

    // Crear y mostrar botón en esquina superior derecha
    const botonFiltrar = document.createElement("button");
    botonFiltrar.style.fontSize = "8px";
    botonFiltrar.innerHTML = `<i class="bi bi-hourglass-split"></i> Ver Pendientes`;
    botonFiltrar.className = "btn btn-secondary position-absolute top-0 end-0 m-3";
    botonFiltrar.addEventListener("click", ocultarMarcados);

    // Asegúrate de que el contenedor tenga position: relative
    const filtroTodo = document.getElementById("seccion-filtroTodo");
    filtroTodo.appendChild(botonFiltrar);

    document.getElementById("seccion-filtroTodo").style.display = "block";
    document.getElementById("seccion-filtro").style.display = "none";
    limpiarBuscadores();
    document.getElementById("inicio").scrollIntoView({ behavior: "smooth", block: "start" });
}

function ocultarMarcados() {
    document.getElementById('seccion-filtroTodo').style.display = "none";
    document.getElementById('seccion-filtro').style.display = "block";

    const filtro = document.getElementById("searchInput").value.toLowerCase();
    const filas = document.querySelectorAll("#tabla-contenedor table tbody tr");

    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        const filaEntregada = fila.classList.contains("entregado");

        if (filtro === "" || textoFila.includes(filtro)) {
            // Oculta solo si está marcada como entregado
            fila.style.display = filaEntregada ? "none" : "";
        } else {
            fila.style.display = "none";
        }
    });

    limpiarBuscadores()
}

function limpiarBuscadores() {
    const filtros = ["searchInput", "searchInputTodo"];
    filtros.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
}

// Función para ocultar el input
function ocultarInput() {
    document.getElementById('seccion-input').style.display = "none";
    document.getElementById('seccion-filtro').style.display = "block";
}

// Para el filtro normal
var inputF = document.getElementById("searchInput");
inputF.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        this.select();
    }
});

// Para el filtro "todo"
var inputBusquedaTodo = document.getElementById("searchInputTodo");
inputBusquedaTodo.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        this.select();
    }
});

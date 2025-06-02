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


// Evento para el botón de cargar datos
document.getElementById("btn-cargar").addEventListener("click", function () {
    var archivo = document.getElementById("input-excel").files[0];

    // Verificar si no se ha seleccionado archivo
    if (!archivo) {
        alert("Por favor, carga un archivo primero.");
        
        // Mostrar la vista del input y ocultar otras secciones
        document.getElementById("seccion-input").style.display = "block"; // Muestra el input
        document.getElementById("seccion-filtro").style.display = "none"; // Oculta el filtro
        document.getElementById("boton-container").innerHTML = ""; // Oculta el botón de 'Ver Todo' si es necesario
        document.getElementById("tabla-contenedor").innerHTML = ""; // Limpiar cualquier tabla mostrada
        
        return; // Detiene la ejecución si no hay archivo
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        displayData(json); // Llama a la función para mostrar la tabla
    };
    reader.readAsArrayBuffer(archivo);
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
            celdas[0].textContent.trim(), // Código
            celdas[1].textContent.trim(), // Nombre
            celdas[2].textContent.trim()  // Cantidad
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
                <th>CLAVE</th>
                <th>DESCRIPCIÓN</th>
                <th>CANT.</th>  
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
        return contenedor;
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

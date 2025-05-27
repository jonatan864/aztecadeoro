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
    // Crear la tabla HTML para mostrar los datos cargados
    var table = document.createElement("table");
    table.className = "tabla-estilizada";

    var header = table.createTHead();
    var headerRow = header.insertRow();
  
    // Suponiendo que cada fila del JSON tiene las mismas claves, tomamos la primera
    var keys = Object.keys(data[0]);
    keys.forEach(function(key) {
        var th = document.createElement("th");
        th.textContent = key;
        headerRow.appendChild(th);
    });
  
    // Agregar columna "Entregado"
    var thEntregado = document.createElement("th");
    thEntregado.textContent = "ENTREGADO";
    headerRow.appendChild(thEntregado);
  
    var tbody = table.createTBody();
    
    data.forEach(function(row) {
        var tr = document.createElement("tr");
        keys.forEach(function(key) {
            var td = document.createElement("td");
            td.textContent = row[key];
            tr.appendChild(td);
        });
  
        // Crear columna de checkbox para marcar como entregado
        var tdEntregado = document.createElement("td");
        tdEntregado.className = "text-center align-middle";
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "entregado-checkbox";
  
        // Evento para marcar como entregado
        checkbox.addEventListener("change", function () {
          const tr = this.closest("tr");
          if (this.checked) {
              tr.classList.add("entregado");
              tr.style.display = "none";
          } else {
              tr.classList.remove("entregado");
              tr.style.display = "";
          }
        });
  
        tdEntregado.appendChild(checkbox);
        tr.appendChild(tdEntregado);
        tbody.appendChild(tr);
    });
  
    const contenedor = document.getElementById("tabla-contenedor");
    contenedor.innerHTML = ""; // Limpiar la tabla anterior
    contenedor.appendChild(table);  // Añadir la tabla al contenedor
  
    // Llamar a la función para crear el botón solo si aún no ha sido creado
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
  });
  
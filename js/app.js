
let inventario = null;

const CLAVE_GUARDADO = "rackscope_inventario_v1";

async function cargarInventario() {
    try {
        const guardado = localStorage.getItem(CLAVE_GUARDADO);

        if (guardado) {
            inventario = JSON.parse(guardado);
        } else {
            const respuesta = await fetch("inventario.json");

            if (!respuesta.ok) {
                throw new Error("No se pudo cargar inventario.json");
            }

            inventario = await respuesta.json();
        }

        if (!validarInventario(inventario)) {
            throw new Error("El inventario tiene una estructura incorrecta.");
        }

        conectarFormulario();
        conectarRespaldos();
        actualizarDashboard();

    } catch (error) {
        console.error(error);

        document.getElementById("details").textContent =
            "No fue posible cargar el inventario. Abre el proyecto con Live Server y revisa inventario.json.";

        mostrarMensaje(error.message, true);
    }
}

function validarInventario(datos) {
    if (
        !datos ||
        !datos.rack_config ||
        !Number.isInteger(datos.rack_config.capacidad_u) ||
        datos.rack_config.capacidad_u < 1 ||
        !Array.isArray(datos.equipos)
    ) {
        return false;
    }

    const capacidad = datos.rack_config.capacidad_u;

    for (const equipo of datos.equipos) {
        if (
            !equipo ||
            typeof equipo.nombre !== "string" ||
            !equipo.nombre.trim() ||
            typeof equipo.modelo !== "string" ||
            !equipo.modelo.trim() ||
            !Number.isInteger(equipo.u_inicio) ||
            !Number.isInteger(equipo.u_fin) ||
            equipo.u_inicio < 1 ||
            equipo.u_fin > capacidad ||
            equipo.u_inicio > equipo.u_fin
        ) {
            return false;
        }
    }

    // Impedir que dos equipos ocupen las mismas unidades.
    for (let i = 0; i < datos.equipos.length; i++) {
        for (let j = i + 1; j < datos.equipos.length; j++) {
            const equipoA = datos.equipos[i];
            const equipoB = datos.equipos[j];

            if (
                equipoA.u_inicio <= equipoB.u_fin &&
                equipoA.u_fin >= equipoB.u_inicio
            ) {
                return false;
            }
        }
    }

    return true;
}

function guardarInventario() {
    try {
        localStorage.setItem(
            CLAVE_GUARDADO,
            JSON.stringify(inventario)
        );

        return true;
    } catch (error) {
        console.error(error);

        mostrarMensaje(
            "No se pudo guardar en el navegador. Exporta una copia del inventario.",
            true
        );

        return false;
    }
}

function actualizarDashboard() {
    mostrarResumen();
    crearRack();
    mostrarInventario();
}

function mostrarResumen() {
    document.getElementById("capacidad").textContent =
        inventario.rack_config.capacidad_u + "U";

    document.getElementById("cantidad-equipos").textContent =
        inventario.equipos.length;
}

function crearRack() {
    const rack = document.getElementById("rack");
    rack.replaceChildren();

    for (
        let u = inventario.rack_config.capacidad_u;
        u >= 1;
        u--
    ) {
        const unidad = document.createElement("div");
        unidad.className = "rack-unit";

        const numero = document.createElement("div");
        numero.className = "unit-number";
        numero.textContent = "U" + u;

        const contenido = document.createElement("div");
        contenido.className = "unit-content";

        const indice = inventario.equipos.findIndex(equipo =>
            u >= equipo.u_inicio && u <= equipo.u_fin
        );

        if (indice !== -1) {
            const equipo = inventario.equipos[indice];

            contenido.classList.add("occupied");

            const nombre = document.createElement("strong");
            nombre.textContent = equipo.nombre;

            const modelo = document.createElement("small");
            modelo.textContent = equipo.modelo;

            contenido.append(nombre, modelo);
            unidad.classList.add("has-equipment");
            unidad.title = "Consultar " + equipo.nombre;

            unidad.addEventListener("click", () => {
                mostrarDetalles(indice);
            });
        } else {
            contenido.classList.add("empty");
            contenido.textContent = "Unidad disponible";
            unidad.classList.add("available");
            unidad.title = "Unidad U" + u + " disponible";
        }

        unidad.append(numero, contenido);
        rack.appendChild(unidad);
    }
}

function mostrarDetalles(indice) {
    const equipo = inventario.equipos[indice];
    if (!equipo) return;

    const details = document.getElementById("details");
    details.replaceChildren();

    const ubicacion = equipo.u_inicio === equipo.u_fin
        ? `U${equipo.u_inicio}`
        : `U${equipo.u_inicio} - U${equipo.u_fin}`;

    const campos = [
        ["Equipo", equipo.nombre],
        ["Modelo", equipo.modelo],
        ["Ubicación física", ubicacion],
        ["VLAN", equipo.vlan || "N/A"],
        ["IP / Información lógica", equipo.ip || "N/A"],
        ["Eléctrica", equipo.electrica || "N/A"],
        ["Estado", equipo.estado || "Pendiente"]
    ];

    campos.forEach(([titulo, valor]) => {
        const elemento = document.createElement("div");
        elemento.className = "detail-item";

        const etiqueta = document.createElement("strong");
        etiqueta.textContent = titulo;

        const texto = document.createElement("span");
        texto.textContent = valor;

        elemento.append(etiqueta, texto);
        details.appendChild(elemento);
    });

    const editar = crearBoton("Editar equipo", "secondary-button");
    editar.addEventListener("click", () => prepararEdicion(indice));

    const eliminar = crearBoton("Eliminar equipo", "danger-button");
    eliminar.addEventListener("click", () => eliminarEquipo(indice));

    const acciones = document.createElement("div");
    acciones.className = "form-actions";
    acciones.append(editar, eliminar);

    details.appendChild(acciones);
}

function mostrarInventario() {
    const cuerpo = document.getElementById("inventory-body");
    cuerpo.replaceChildren();

    inventario.equipos.forEach((equipo, indice) => {
        const fila = document.createElement("tr");

        const ubicacion = equipo.u_inicio === equipo.u_fin
            ? `U${equipo.u_inicio}`
            : `U${equipo.u_inicio} - U${equipo.u_fin}`;

        [
            ubicacion,
            equipo.nombre,
            equipo.modelo,
            equipo.estado || "Pendiente"
        ].forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const acciones = document.createElement("td");

        const editar = crearBoton("Editar", "secondary-button");
        editar.addEventListener("click", () => prepararEdicion(indice));

        const eliminar = crearBoton("Eliminar", "danger-button");
        eliminar.addEventListener("click", () => eliminarEquipo(indice));

        acciones.append(editar, eliminar);
        fila.appendChild(acciones);

        fila.addEventListener("click", evento => {
            if (evento.target.closest("button")) return;
            mostrarDetalles(indice);
        });

        cuerpo.appendChild(fila);
    });
}

function crearBoton(texto, clase) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = clase;

    return boton;
}

function conectarFormulario() {
    const formulario = document.getElementById("equipment-form");

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        const inicio = Number(
            document.getElementById("equipo-u-inicio").value
        );

        const fin = Number(
            document.getElementById("equipo-u-fin").value
        );

        const indiceTexto = document.getElementById("edit-index").value;
        const editando = indiceTexto !== "";
        const indice = editando ? Number(indiceTexto) : -1;

        const equipo = {
            u_inicio: inicio,
            u_fin: fin,
            nombre: document.getElementById("equipo-nombre").value.trim(),
            modelo: document.getElementById("equipo-modelo").value.trim(),
            estado: document.getElementById("equipo-estado").value,
            vlan: document.getElementById("equipo-vlan").value.trim() || "N/A",
            ip: document.getElementById("equipo-ip").value.trim() || "N/A",
            electrica: document.getElementById("equipo-electrica").value.trim() || "N/A"
        };

        if (!equipo.nombre || !equipo.modelo) {
            mostrarMensaje("Completa el nombre y el modelo.", true);
            return;
        }

        if (
            !Number.isInteger(inicio) ||
            !Number.isInteger(fin) ||
            inicio < 1 ||
            fin > inventario.rack_config.capacidad_u ||
            inicio > fin
        ) {
            mostrarMensaje("Revisa las unidades U del equipo.", true);
            return;
        }

        if (
            editando &&
            (!Number.isInteger(indice) || !inventario.equipos[indice])
        ) {
            mostrarMensaje(
                "No se encontró el equipo que intentas editar.",
                true
            );
            return;
        }

        const ocupado = inventario.equipos.some((otro, i) => {
            if (editando && i === indice) return false;

            return inicio <= otro.u_fin && fin >= otro.u_inicio;
        });

        if (ocupado) {
            mostrarMensaje(
                "Esas unidades ya están ocupadas por otro equipo.",
                true
            );
            return;
        }

     const equipoAnterior = editando
    ? inventario.equipos[indice]
    : null;

```javascript
const equipoAnterior = editando
    ? { ...inventario.equipos[indice] }
    : null;

if (editando) {
    inventario.equipos[indice] = equipo;
} else {
    inventario.equipos.push(equipo);
}

if (!guardarInventario()) {
    if (editando) {
        inventario.equipos[indice] = equipoAnterior;
    } else {
        inventario.equipos.pop();
    }
    return;
}
```
    actualizarDashboard();
        formulario.reset();

        document.getElementById("edit-index").value = "";
        document.getElementById("guardar-equipo").textContent = "Agregar equipo";
        document.getElementById("cancelar-edicion").hidden = true;

        mostrarMensaje(
            editando
                ? "Equipo actualizado y guardado."
                : "Equipo agregado y guardado."
        );

        mostrarDetalles(inventario.equipos.indexOf(equipo));
    });

    document.getElementById("cancelar-edicion").addEventListener("click", () => {
        formulario.reset();
        document.getElementById("edit-index").value = "";
        document.getElementById("guardar-equipo").textContent = "Agregar equipo";
        document.getElementById("cancelar-edicion").hidden = true;

        mostrarMensaje("Edición cancelada.");
    });
}

function prepararEdicion(indice) {
    const equipo = inventario.equipos[indice];
    if (!equipo) return;

    document.getElementById("edit-index").value = String(indice);
    document.getElementById("equipo-nombre").value = equipo.nombre;
    document.getElementById("equipo-modelo").value = equipo.modelo;
    document.getElementById("equipo-u-inicio").value = equipo.u_inicio;
    document.getElementById("equipo-u-fin").value = equipo.u_fin;
    document.getElementById("equipo-estado").value =
        equipo.estado || "Pendiente";
    document.getElementById("equipo-vlan").value = equipo.vlan || "";
    document.getElementById("equipo-ip").value = equipo.ip || "";
    document.getElementById("equipo-electrica").value =
        equipo.electrica || "";

    document.getElementById("guardar-equipo").textContent = "Guardar cambios";
    document.getElementById("cancelar-edicion").hidden = false;

    mostrarMensaje("Editando: " + equipo.nombre);

    document.getElementById("equipment-form").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function eliminarEquipo(indice) {
    const equipo = inventario.equipos[indice];
    if (!equipo) return;

    if (!confirm(`¿Seguro que deseas eliminar "${equipo.nombre}" del inventario?`)) {
        return;
    }

    const eliminado = inventario.equipos.splice(indice, 1)[0];

    if (!guardarInventario()) {
        inventario.equipos.splice(indice, 0, eliminado);
        return;
    }

    actualizarDashboard();
    document.getElementById("details").textContent =
        "Equipo eliminado del inventario.";

    mostrarMensaje("Equipo eliminado y cambios guardados.");
}

function conectarRespaldos() {
    document.getElementById("exportar-inventario").addEventListener("click", () => {
        const archivo = new Blob(
            [JSON.stringify(inventario, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = "inventario-respaldo.json";
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        mostrarMensaje("Respaldo JSON exportado.");
    });

    document.getElementById("importar-inventario").addEventListener(
        "change",
        async evento => {
            const archivo = evento.target.files[0];
            if (!archivo) return;

            try {
                const datos = JSON.parse(await archivo.text());

                if (!validarInventario(datos)) {
                    throw new Error(
                        "El archivo no tiene un inventario válido."
                    );
                }

                if (!confirm(
                    "Importar reemplazará el inventario actual de este navegador. ¿Continuar?"
                )) {
                    return;
                }

                const anterior = inventario;
                inventario = datos;

                if (!guardarInventario()) {
                    inventario = anterior;
                    return;
                }

                actualizarDashboard();

                document.getElementById("equipment-form").reset();
                document.getElementById("edit-index").value = "";
                document.getElementById("guardar-equipo").textContent =
                    "Agregar equipo";
                document.getElementById("cancelar-edicion").hidden = true;

                mostrarMensaje("Inventario importado correctamente.");
            } catch (error) {
                mostrarMensaje(
                    "No se pudo importar: " + error.message,
                    true
                );
            } finally {
                evento.target.value = "";
            }
        }
    );
}

function mostrarMensaje(mensaje, error = false) {
    const elemento = document.getElementById("form-message");
    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.classList.toggle("error-message", error);
}

// Iniciar el dashboard.
cargarInventario();

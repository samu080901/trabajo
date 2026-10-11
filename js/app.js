
"use strict";

/* =========================================
   RackScope IA - Dashboard técnico
   Inventario físico, lógico y eléctrico
   ========================================= */

let inventario = null;
let unidadSeleccionada = null;

const CLAVE_GUARDADO = "rackscope_inventario_v1";

/* INICIO DEL DASHBOARD */

document.addEventListener("DOMContentLoaded", iniciarDashboard);

async function iniciarDashboard() {
    conectarNavegacion();
    conectarPrompt();
    actualizarFecha();

    try {
        // Primero intenta recuperar el inventario guardado.
        const guardado = localStorage.getItem(CLAVE_GUARDADO);

        if (guardado) {
            try {
                const datosGuardados = JSON.parse(guardado);

                if (validarInventario(datosGuardados)) {
                    inventario = datosGuardados;
                } else {
                    console.warn(
                        "El inventario guardado no es válido. Se cargará el JSON inicial."
                    );
                    localStorage.removeItem(CLAVE_GUARDADO);
                }
            } catch (error) {
                console.warn("No se pudo leer el inventario guardado.", error);
                localStorage.removeItem(CLAVE_GUARDADO);
            }
        }

        // Si no hay datos guardados válidos, carga inventario.json.
        if (!inventario) {
            const respuesta = await fetch("inventario.json");

            if (!respuesta.ok) {
                throw new Error(
                    "No se pudo cargar inventario.json. Comprueba que esté junto a index.html."
                );
            }

            const datos = await respuesta.json();

            if (!validarInventario(datos)) {
                throw new Error(
                    "El JSON contiene datos incorrectos o unidades superpuestas."
                );
            }

            inventario = datos;
        }

        conectarFormulario();
        conectarRespaldos();
        actualizarDashboard();

        mostrarMensaje("Inventario cargado correctamente.");

    } catch (error) {
        console.error("Error al iniciar RackScope IA:", error);

        const detalles = document.getElementById("details");

        if (detalles) {
            detalles.textContent =
                "No fue posible cargar el inventario. Comprueba inventario.json y abre el proyecto con Live Server.";
        }

        const rack = document.getElementById("rack");

        if (rack) {
            rack.replaceChildren();

            const mensaje = document.createElement("p");
            mensaje.className = "rack-error";
            mensaje.textContent =
                "Inventario no disponible. Revisa el archivo JSON.";
            rack.appendChild(mensaje);
        }

        mostrarMensaje(error.message, true);
    }
}

/* FECHA DE ACTUALIZACIÓN */

function actualizarFecha() {
    const elemento = document.getElementById("fecha-actualizacion");

    if (!elemento) return;

    elemento.textContent = new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date());
}

/* NAVEGACIÓN ENTRE SECCIONES */

function conectarNavegacion() {
    document.querySelectorAll(".main-nav a").forEach(enlace => {
        enlace.addEventListener("click", evento => {
            const destino = enlace.getAttribute("href");

            if (!destino || !destino.startsWith("#")) return;

            const seccion = document.querySelector(destino);

            if (!seccion) {
                console.warn("No existe la sección:", destino);
                return;
            }

            evento.preventDefault();

            seccion.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth",
                block: "start"
            });

            history.replaceState(null, "", destino);
        });
    });
}

/* VALIDAR EL JSON */

function validarInventario(datos) {
    if (
        !datos ||
        typeof datos !== "object" ||
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

    // No permitir que dos equipos ocupen la misma unidad U.
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

/* GUARDAR INVENTARIO EN EL NAVEGADOR */

function guardarInventario() {
    try {
        localStorage.setItem(
            CLAVE_GUARDADO,
            JSON.stringify(inventario)
        );

        return true;
    } catch (error) {
        console.error("No se pudo guardar el inventario:", error);

        mostrarMensaje(
            "No se pudo guardar en este navegador. Exporta una copia JSON.",
            true
        );

        return false;
    }
}

/* ACTUALIZAR TODA LA INTERFAZ */

function actualizarDashboard() {
    if (!inventario) return;

    mostrarResumen();
    crearRack();
    mostrarInventario();

    if (unidadSeleccionada !== null) {
        const equipo = inventario.equipos.find(item =>
            unidadSeleccionada >= item.u_inicio &&
            unidadSeleccionada <= item.u_fin
        );

        if (equipo) {
            pintarDetalles(equipo, inventario.equipos.indexOf(equipo));
        } else {
            unidadSeleccionada = null;

            const detalles = document.getElementById("details");

            if (detalles) {
                detalles.textContent =
                    "Selecciona una unidad ocupada para consultar sus datos.";
            }
        }
    }
}

/* TARJETAS DE RESUMEN */

function mostrarResumen() {
    const capacidad = document.getElementById("capacidad");
    const cantidad = document.getElementById("cantidad-equipos");

    if (capacidad) {
        capacidad.textContent =
            inventario.rack_config.capacidad_u + "U";
    }

    if (cantidad) {
        cantidad.textContent = inventario.equipos.length;
    }

    // Indicadores de la guía, si existen en el HTML.
    const fuente = document.getElementById("fuente-verdad");
    const capas = document.getElementById("capas-relacionadas");
    const datosFalsos = document.getElementById("datos-falsos");

    if (fuente) fuente.textContent = "1";
    if (capas) capas.textContent = "3";
    if (datosFalsos) datosFalsos.textContent = "0";
}

/* DIBUJAR EL RACK DE 28U */

function crearRack() {
    const rack = document.getElementById("rack");

    if (!rack || !inventario) return;

    rack.replaceChildren();

    const capacidad = inventario.rack_config.capacidad_u;

    // Mostrar el rack desde la U superior hasta la U inferior.
    for (let u = capacidad; u >= 1; u--) {
        const unidad = document.createElement("div");
        unidad.className = "rack-unit";
        unidad.dataset.u = String(u);

        const numero = document.createElement("div");
        numero.className = "unit-number";
        numero.textContent = "U" + String(u).padStart(2, "0");

        const contenido = document.createElement("div");
        contenido.className = "unit-content";

        const equipo = inventario.equipos.find(item =>
            u >= item.u_inicio && u <= item.u_fin
        );

        if (equipo) {
            contenido.classList.add("occupied");
            unidad.classList.add("has-equipment");

            unidad.tabIndex = 0;
            unidad.setAttribute("role", "button");

            const ubicacion = equipo.u_inicio === equipo.u_fin
                ? `U${equipo.u_inicio}`
                : `U${equipo.u_inicio}-U${equipo.u_fin}`;

            // En equipos de varias U, mostrar el nombre una sola vez.
            if (u === equipo.u_fin) {
                const nombre = document.createElement("strong");
                nombre.textContent = equipo.nombre;

                const modelo = document.createElement("small");
                modelo.textContent = `${equipo.modelo} · ${ubicacion}`;

                contenido.append(nombre, modelo);
            } else {
                const nombre = document.createElement("strong");
                nombre.textContent = equipo.nombre;

                const modelo = document.createElement("small");
                modelo.textContent = `Continúa · ${ubicacion}`;

                contenido.append(nombre, modelo);
            }

            unidad.title = `Consultar ${equipo.nombre} (${ubicacion})`;
            unidad.setAttribute(
                "aria-label",
                `${equipo.nombre}, ${ubicacion}. Pulsa para consultar detalles.`
            );

            const indice = inventario.equipos.indexOf(equipo);

            unidad.addEventListener("click", () => {
                mostrarDetalles(indice);
            });

            unidad.addEventListener("keydown", evento => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    mostrarDetalles(indice);
                }
            });

            if (
                unidadSeleccionada !== null &&
                unidadSeleccionada >= equipo.u_inicio &&
                unidadSeleccionada <= equipo.u_fin
            ) {
                unidad.classList.add("selected");
            }

        } else {
            contenido.classList.add("empty");
            contenido.textContent = "Unidad disponible";

            unidad.classList.add("available");
            unidad.title = `Unidad U${u} disponible`;
        }

        unidad.append(numero, contenido);
        rack.appendChild(unidad);
    }
}

/* MOSTRAR DETALLES DE UN EQUIPO */

function mostrarDetalles(indice) {
    if (!inventario) return;

    const equipo = inventario.equipos[indice];

    if (!equipo) return;

    unidadSeleccionada = equipo.u_inicio;

    crearRack();
    pintarDetalles(equipo, indice);
}

function pintarDetalles(equipo, indice) {
    const details = document.getElementById("details");

    if (!details) return;

    details.replaceChildren();

    const ubicacion = equipo.u_inicio === equipo.u_fin
        ? `U${equipo.u_inicio}`
        : `U${equipo.u_inicio} - U${equipo.u_fin}`;

    const campos = [
        ["Equipo", equipo.nombre],
        ["Modelo", equipo.modelo],
        ["Ubicación física", ubicacion],
        ["Estado", equipo.estado || "Pendiente"],
        ["VLAN", equipo.vlan || "N/A"],
        ["IP / Información lógica", equipo.ip || "N/A"],
        ["Información eléctrica", equipo.electrica || "N/A"]
    ];

    campos.forEach(([titulo, valor]) => {
        const bloque = document.createElement("div");
        bloque.className = "detail-item";

        const etiqueta = document.createElement("strong");
        etiqueta.textContent = titulo;

        const texto = document.createElement("span");
        texto.textContent = valor;

        bloque.append(etiqueta, texto);
        details.appendChild(bloque);
    });

    const acciones = document.createElement("div");
    acciones.className = "detail-actions form-actions";

    const botonEditar = crearBoton(
        "Editar equipo",
        "secondary-button"
    );

    botonEditar.addEventListener("click", () => {
        prepararEdicion(indice);
    });

    const botonEliminar = crearBoton(
        "Eliminar equipo",
        "danger-button"
    );

    botonEliminar.addEventListener("click", () => {
        eliminarEquipo(indice);
    });

    acciones.append(botonEditar, botonEliminar);
    details.appendChild(acciones);
}

/* TABLA DE INVENTARIO */

function mostrarInventario() {
    const cuerpo = document.getElementById("inventory-body");

    if (!cuerpo || !inventario) return;

    cuerpo.replaceChildren();

    if (inventario.equipos.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 5;
        celda.textContent = "No hay equipos registrados.";

        fila.appendChild(celda);
        cuerpo.appendChild(fila);
        return;
    }

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

        const botonEditar = crearBoton("Editar", "secondary-button");

        botonEditar.addEventListener("click", evento => {
            evento.stopPropagation();
            prepararEdicion(indice);
        });

        const botonEliminar = crearBoton("Eliminar", "danger-button");

        botonEliminar.addEventListener("click", evento => {
            evento.stopPropagation();
            eliminarEquipo(indice);
        });

        acciones.append(botonEditar, botonEliminar);
        fila.appendChild(acciones);

        fila.addEventListener("click", () => {
            mostrarDetalles(indice);
        });

        cuerpo.appendChild(fila);
    });
}

/* CREAR BOTONES */

function crearBoton(texto, clase) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.textContent = texto;
    boton.className = clase;

    return boton;
}

/* FORMULARIO DE AGREGAR Y EDITAR */

function conectarFormulario() {
    const formulario = document.getElementById("equipment-form");

    if (!formulario) {
        console.warn("No se encontró el formulario del inventario.");
        return;
    }

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        const inicio = Number(
            document.getElementById("equipo-u-inicio")?.value
        );

        const fin = Number(
            document.getElementById("equipo-u-fin")?.value
        );

        const campoNombre = document.getElementById("equipo-nombre");
        const campoModelo = document.getElementById("equipo-modelo");

        if (!campoNombre || !campoModelo) {
            mostrarMensaje("Faltan campos del formulario en index.html.", true);
            return;
        }

        const indiceTexto =
            document.getElementById("edit-index")?.value ?? "";

        const editando = indiceTexto !== "";
        const indice = editando ? Number(indiceTexto) : -1;

        const equipo = {
            u_inicio: inicio,
            u_fin: fin,
            nombre: campoNombre.value.trim(),
            modelo: campoModelo.value.trim(),
            estado:
                document.getElementById("equipo-estado")?.value ||
                "Pendiente",
            vlan:
                document.getElementById("equipo-vlan")?.value.trim() ||
                "N/A",
            ip:
                document.getElementById("equipo-ip")?.value.trim() ||
                "N/A",
            electrica:
                document.getElementById("equipo-electrica")?.value.trim() ||
                "N/A"
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

        // Conservar una copia por si falla el guardado.
        const copiaAnterior = inventario.equipos.map(
            item => ({ ...item })
        );

        if (editando) {
            inventario.equipos[indice] = equipo;
        } else {
            inventario.equipos.push(equipo);
        }

        if (!guardarInventario()) {
            inventario.equipos = copiaAnterior;
            return;
        }

        unidadSeleccionada = equipo.u_inicio;

        actualizarDashboard();
        formulario.reset();
        restablecerFormulario();

        mostrarMensaje(
            editando
                ? "Equipo actualizado y guardado."
                : "Equipo agregado y guardado."
        );

        const nuevoIndice = inventario.equipos.findIndex(item =>
            item.u_inicio === equipo.u_inicio &&
            item.u_fin === equipo.u_fin &&
            item.nombre === equipo.nombre &&
            item.modelo === equipo.modelo
        );

        if (nuevoIndice !== -1) {
            mostrarDetalles(nuevoIndice);
        }
    });

    const cancelar = document.getElementById("cancelar-edicion");

    if (cancelar) {
        cancelar.addEventListener("click", () => {
            formulario.reset();
            restablecerFormulario();
            mostrarMensaje("Edición cancelada.");
        });
    }
}

/* RESTABLECER FORMULARIO */

function restablecerFormulario() {
    const indice = document.getElementById("edit-index");
    const boton = document.getElementById("guardar-equipo");
    const cancelar = document.getElementById("cancelar-edicion");

    if (indice) indice.value = "";
    if (boton) boton.textContent = "Agregar equipo";
    if (cancelar) cancelar.hidden = true;
}

/* PREPARAR EDICIÓN */

function prepararEdicion(indice) {
    const equipo = inventario?.equipos[indice];

    if (!equipo) return;

    const valores = {
        "edit-index": String(indice),
        "equipo-nombre": equipo.nombre,
        "equipo-modelo": equipo.modelo,
        "equipo-u-inicio": String(equipo.u_inicio),
        "equipo-u-fin": String(equipo.u_fin),
        "equipo-estado": equipo.estado || "Pendiente",
        "equipo-vlan": equipo.vlan || "",
        "equipo-ip": equipo.ip || "",
        "equipo-electrica": equipo.electrica || ""
    };

    for (const [id, valor] of Object.entries(valores)) {
        const elemento = document.getElementById(id);

        if (elemento) elemento.value = valor;
    }

    const botonGuardar = document.getElementById("guardar-equipo");
    const botonCancelar = document.getElementById("cancelar-edicion");

    if (botonGuardar) botonGuardar.textContent = "Guardar cambios";
    if (botonCancelar) botonCancelar.hidden = false;

    mostrarMensaje("Editando: " + equipo.nombre);

    const formulario = document.getElementById("equipment-form");
    const gestion = document.getElementById("gestion");

    const destino = gestion || formulario;

    if (destino) {
        destino.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

/* ELIMINAR EQUIPO */

function eliminarEquipo(indice) {
    const equipo = inventario?.equipos[indice];

    if (!equipo) return;

    const confirmar = window.confirm(
        `¿Seguro que deseas eliminar "${equipo.nombre}" del inventario?`
    );

    if (!confirmar) return;

    const copiaAnterior = inventario.equipos.map(
        item => ({ ...item })
    );

    inventario.equipos.splice(indice, 1);

    if (!guardarInventario()) {
        inventario.equipos = copiaAnterior;
        return;
    }

    unidadSeleccionada = null;

    actualizarDashboard();

    const details = document.getElementById("details");

    if (details) {
        details.textContent =
            "Equipo eliminado. Selecciona otra unidad ocupada para consultar sus datos.";
    }

    mostrarMensaje("Equipo eliminado y cambios guardados.");
}

/* EXPORTAR E IMPORTAR JSON */

function conectarRespaldos() {
    const exportar = document.getElementById("exportar-inventario");
    const importar = document.getElementById("importar-inventario");

    if (exportar) {
        exportar.addEventListener("click", () => {
            try {
                const archivo = new Blob(
                    [JSON.stringify(inventario, null, 2)],
                    { type: "application/json;charset=utf-8" }
                );

                const url = URL.createObjectURL(archivo);
                const enlace = document.createElement("a");

                enlace.href = url;
                enlace.download = "inventario-respaldo.json";

                document.body.appendChild(enlace);
                enlace.click();
                enlace.remove();

                setTimeout(() => URL.revokeObjectURL(url), 1000);

                mostrarMensaje("Respaldo JSON exportado correctamente.");
            } catch (error) {
                console.error("Error al exportar:", error);
                mostrarMensaje("No se pudo exportar el inventario.", true);
            }
        });
    }

    if (importar) {
        importar.addEventListener("change", async evento => {
            const archivo = evento.target.files?.[0];

            if (!archivo) return;

            try {
                const datos = JSON.parse(await archivo.text());

                if (!validarInventario(datos)) {
                    throw new Error(
                        "El archivo no es válido o contiene unidades superpuestas."
                    );
                }

                const confirmar = window.confirm(
                    "La importación reemplazará el inventario de este navegador. ¿Deseas continuar?"
                );

                if (!confirmar) return;

                const anterior = inventario;
                inventario = datos;

                if (!guardarInventario()) {
                    inventario = anterior;
                    return;
                }

                unidadSeleccionada = null;
                actualizarDashboard();

                const formulario =
                    document.getElementById("equipment-form");

                if (formulario) formulario.reset();

                restablecerFormulario();

                const details = document.getElementById("details");

                if (details) {
                    details.textContent =
                        "Inventario importado. Selecciona un equipo para consultar sus datos.";
                }

                mostrarMensaje("Inventario importado correctamente.");

            } catch (error) {
                console.error("Error al importar:", error);

                mostrarMensaje(
                    "No se pudo importar el archivo: " + error.message,
                    true
                );
            } finally {
                evento.target.value = "";
            }
        });
    }
}

/* MENSAJES DEL FORMULARIO */

function mostrarMensaje(mensaje, error = false) {
    const elemento = document.getElementById("form-message");

    // Evitar Cannot set properties of null.
    if (!elemento) {
        console[error ? "error" : "log"](mensaje);
        return;
    }

    elemento.textContent = mensaje;
    elemento.classList.toggle("error-message", error);
}

/* COPIAR EL PROMPT DE IA */

function conectarPrompt() {
    const boton = document.getElementById("copiar-prompt");
    const texto = document.getElementById("prompt-text");
    const mensaje = document.getElementById("prompt-message");

    // La función es opcional: no detener el dashboard si falta algún elemento.
    if (!boton || !texto || !mensaje) {
        console.info(
            "Botón de copiar prompt no conectado: revisa los identificadores en index.html."
        );
        return;
    }

    boton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(texto.textContent.trim());
            mensaje.textContent = "Prompt copiado al portapapeles.";
        } catch (error) {
            console.error("No se pudo copiar el prompt:", error);

            mensaje.textContent =
                "No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.";
        }
    });
}

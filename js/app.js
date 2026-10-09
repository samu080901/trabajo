let inventario = null;

async function cargarInventario() {
    try {
        const respuesta = await fetch("inventario.json");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar inventario.json");
        }

        inventario = await respuesta.json();

        mostrarResumen();
        crearRack();
        mostrarInventario();

    } catch (error) {
        console.error(error);

        document.getElementById("details").innerHTML = `
            <p>
                No fue posible cargar el inventario.
                Abre el proyecto utilizando Live Server.
            </p>
        `;
    }
}


function mostrarResumen() {

    document.getElementById("capacidad").textContent =
        inventario.rack_config.capacidad_u + "U";

    document.getElementById("cantidad-equipos").textContent =
        inventario.equipos.length;
}


function crearRack() {
    const rack = document.getElementById("rack");
    rack.innerHTML = "";

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

        const equipo = inventario.equipos.find(item =>
            u >= item.u_inicio && u <= item.u_fin
        );

        if (equipo) {
            contenido.classList.add("occupied");

            contenido.innerHTML = `
                <strong>${equipo.nombre}</strong>
                <small>${equipo.modelo}</small>
            `;

            unidad.classList.add("has-equipment");
            unidad.title = "Consultar " + equipo.nombre;

            unidad.addEventListener("click", () => {
                mostrarDetalles(equipo);
            });
        } else {
            contenido.classList.add("empty");
            contenido.textContent = "Unidad disponible";
            unidad.classList.add("available");
            unidad.title = "Unidad U" + u + " disponible";
        }

        unidad.appendChild(numero);
        unidad.appendChild(contenido);
        rack.appendChild(unidad);
    }
}


function mostrarDetalles(equipo) {

    const details = document.getElementById("details");

    const ubicacion =
        equipo.u_inicio === equipo.u_fin
            ? `U${equipo.u_inicio}`
            : `U${equipo.u_inicio} - U${equipo.u_fin}`;

    details.innerHTML = `
        <div class="detail-item">
            <strong>Equipo</strong>
            ${equipo.nombre}
        </div>

        <div class="detail-item">
            <strong>Modelo</strong>
            ${equipo.modelo}
        </div>

        <div class="detail-item">
            <strong>Ubicación física</strong>
            ${ubicacion}
        </div>

        <div class="detail-item">
            <strong>VLAN</strong>
            ${equipo.vlan || "N/A"}
        </div>

        <div class="detail-item">
            <strong>IP / Información lógica</strong>
            ${equipo.ip || "N/A"}
        </div>

        <div class="detail-item">
            <strong>Eléctrica</strong>
            ${equipo.electrica || "N/A"}
        </div>

        <div class="detail-item">
            <strong>Estado</strong>
            ${equipo.estado}
        </div>
    `;
}


function mostrarInventario() {

    const cuerpo = document.getElementById("inventory-body");

    cuerpo.innerHTML = "";

    inventario.equipos.forEach(equipo => {

        const fila = document.createElement("tr");

        const ubicacion =
            equipo.u_inicio === equipo.u_fin
                ? `U${equipo.u_inicio}`
                : `U${equipo.u_inicio} - U${equipo.u_fin}`;

        fila.innerHTML = `
            <td>${ubicacion}</td>
            <td>${equipo.nombre}</td>
            <td>${equipo.modelo}</td>
            <td>${equipo.estado}</td>
        `;

        fila.addEventListener("click", () => {
            mostrarDetalles(equipo);
        });

        cuerpo.appendChild(fila);
    });
}


// Iniciar el dashboard
cargarInventario();
# Modelo de datos — RackScope IA

El sistema organiza la información del rack de comunicaciones mediante los siguientes elementos:

- **Rack:** identifica el rack y su capacidad de 28 unidades.
- **Equipo:** almacena nombre, modelo, ubicación, estado, VLAN e IP.
- **Interfaz:** representa los puertos de conexión de los equipos.
- **Conexión:** registra las relaciones entre equipos y puertos.
- **Fuente eléctrica:** identifica la alimentación de los equipos.
- **Cambio:** permite registrar modificaciones del inventario.

La información principal de los equipos se almacena en `inventario.json`, que utiliza JavaScript para mostrarla en el dashboard.

**Objetivo:** mantener organizada la información del rack y facilitar la consulta de sus equipos.

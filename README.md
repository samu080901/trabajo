RackScope IA
Cableado Estructurado Dashboard

RackScope IA es un dashboard web desarrollado para visualizar y organizar la información de un rack de comunicaciones de 28U perteneciente al Laboratorio de Redes.

El proyecto permite consultar de forma visual la ubicación de los equipos dentro del rack y revisar información básica de cada elemento registrado.

Características
Visualización del rack de 28U.
Ubicación de los equipos por unidad U.
Consulta de información de cada equipo.
Inventario organizado en una tabla.
Información de VLAN, IP y alimentación eléctrica.
Evidencia fotográfica de la PDU.
Diseño adaptable para diferentes tamaños de pantalla.
Equipos registrados

Actualmente el inventario contiene 8 elementos:

Router Cisco 4300
Switch Catalyst C9300L-24
Switch 48P Access
Bandeja Lanza Cables
Router Cisco ISR 4200
Switch Capa 3 Cisco
Switch Huawei eKitEngine
PDU Quest 8 Salidas
Estructura del proyecto
RackScope-IA/
│
├── index.html
├── inventario.json
│
├── css/
│   └── styles.css
│
├── js/
│   └── app.js
│
├── img/
│   ├── pdu1.jpg
│   ├── pdu2.jpg
│   └── pdu3.jpg
│
└── README.md
Tecnologías utilizadas
HTML5
CSS3
JavaScript
JSON
Git
GitHub
Live Server
Funcionamiento

La información del inventario se encuentra almacenada en el archivo inventario.json.

JavaScript obtiene estos datos y los utiliza para generar automáticamente:

El resumen del rack.
La representación de las unidades del rack.
La información detallada de los equipos.
La tabla de inventario.

El diseño visual de la página se encuentra en css/styles.css.

Ejecución del proyecto

Para ejecutar el proyecto de forma local se recomienda utilizar Live Server desde Visual Studio Code.

Abrir la carpeta del proyecto en Visual Studio Code.
Abrir index.html.
Seleccionar Open with Live Server.
El dashboard se abrirá en el navegador.
Información del rack

Nombre: RACK-LABORATORIO-REDES
Capacidad: 28U
Sede: Universidad Compensar
Cuarto: Laboratorio de Redes y Telecomunicaciones

Versión

v1.0.0

Proyecto académico — RackScope IA
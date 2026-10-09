RackScope IA
Cableado Estructurado Dashboard

Este proyecto es una página web para mostrar la información de un rack de comunicaciones de 28U del Laboratorio de Redes.

La página permite ver los equipos que están ubicados en el rack y consultar algunos datos de cada uno, como el modelo, estado, VLAN, IP y alimentación.

Lo que tiene la página
Vista del rack de 28U.
Equipos organizados por unidad U.
Información de los equipos al seleccionarlos.
Tabla con el inventario.
Datos de VLAN, IP y alimentación.
Fotos de la PDU.
Diseño adaptable a diferentes pantallas.
Equipos

En el inventario se registraron 8 elementos:

Router Cisco 4300
Switch Catalyst C9300L-24
Switch 48P Access
Bandeja Lanza Cables
Router Cisco ISR 4200
Switch Capa 3 Cisco
Switch Huawei eKitEngine
PDU Quest 8 Salidas
Archivos del proyecto
RackScope-IA/
│
├── index.html
├── inventario.json
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── img/
│   ├── pdu1.jpg
│   ├── pdu2.jpg
│   └── pdu3.jpg
└── README.md
Tecnologías
HTML
CSS
JavaScript
JSON
Git y GitHub
Cómo funciona

Los datos de los equipos están guardados en inventario.json.

El archivo app.js toma esa información y la muestra en la página. De esta forma se puede ver el rack, los equipos y la tabla del inventario sin tener que escribir cada elemento directamente en el HTML.

Para probar el proyecto de forma local se puede abrir index.html usando Live Server en Visual Studio Code.

Información del rack

Rack: RACK-LABORATORIO-REDES
Capacidad: 28U
Sede: Universidad Compensar
Lugar: Laboratorio de Redes y Telecomunicaciones

Versión

v1.0.0

Proyecto académico — RackScope IA
# RackScope IA
## Dashboard de Cableado Estructurado

Proyecto académico para visualizar y consultar el inventario de un rack de comunicaciones de 28U del Laboratorio de Redes y Telecomunicaciones.

### Funcionalidades
- Visualización del rack y sus unidades U.
- Consulta de los equipos registrados.
- Inventario con información de los dispositivos.
- Datos de VLAN, IP y alimentación eléctrica.
- Fotografías del rack y la PDU.
- Diseño adaptable a diferentes pantallas.
- Respaldo del inventario en formato JSON.

### Equipos registrados
1. Router Cisco 4300.
2. Switch Catalyst C9300L-24.
3. Switch 48P Access.
4. Bandeja Lanza Cables.
5. Router Cisco ISR 4200.
6. Switch Capa 3 Cisco.
7. Switch Huawei eKitEngine.
8. PDU Quest 8 Salidas.

### Estructura del proyecto
```text
rackscope-dashboard/
├── index.html
├── README.md
├── .gitignore
├── inventario.json
├── data/
│   └── inventario-respaldo.json
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── img/
└── evidencias/
```

### Tecnologías
- HTML
- CSS
- JavaScript
- JSON
- Git y GitHub

### Ejecución
Abrir la carpeta del proyecto en Visual Studio Code y ejecutar `index.html` mediante Live Server para que se cargue correctamente el archivo JSON.

### Información del rack
- **Nombre:** RACK-LABORATORIO-REDES
- **Capacidad:** 28U
- **Sede:** Universidad Compensar
- **Ubicación:** Laboratorio de Redes y Telecomunicaciones

### Versión
**v1.0.0**

Proyecto académico — RackScope IA.
# Inventario de Repuestos para Moto

Sistema de gestión de inventario de repuestos para motocicletas con interfaz web desarrollada en AngularJS y backend en Node.js/Express con MongoDB.

## Características

- **CRUD Completo**: Crear, Leer, Actualizar y Eliminar repuestos
- **Filtros Dinámicos**: Filtrar por Marca, Modelo, Tipo y Versión
- **Interfaz Intuitiva**: Diseño responsivo con Bootstrap 5
- **Alertas de Stock**: Indicadores visuales para productos con baja cantidad
- **API RESTful**: Backend con Express y MongoDB

## Tecnologías

### Backend
- Node.js
- Express.js v5.1.0
- MongoDB + Mongoose v8.19.1
- Body-parser

### Frontend
- AngularJS 1.8.2
- Bootstrap 5.3.0
- Font Awesome 6.4.0

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno en archivo `.env`:
```env
DBMONGO=taskBD
DBMONGOPASS=tu_password
DBMONGOSERV=tu_cluster.mongodb.net
DBMONGOUSER=tu_usuario
```

4. Iniciar el servidor:
```bash
node server.js
```

5. Acceder a la aplicación en: `http://localhost:3000`

## Estructura del Proyecto

```
todo-tasks/
├── server.js              # Servidor Express
├── api.js                 # Rutas API y conexión MongoDB
├── task_schema.js         # Schema Mongoose
├── public/                # Archivos estáticos
│   ├── index.html        # Interfaz principal
│   ├── css/
│   │   └── style.css     # Estilos personalizados
│   └── js/
│       └── app.js        # Controlador AngularJS
├── package.json
└── .env                  # Variables de entorno
```

## API Endpoints

### Crear Repuesto
```
POST /api/create-task
Body: {
  "TaskId": 1,
  "Marca": "Honda",
  "Modelo": 2020,
  "Tipo": "Filtro de Aire",
  "Cantidad": 5,
  "Version": "v1"
}
```

### Obtener Todos los Repuestos
```
GET /api/all-tasks
```

### Actualizar Repuesto
```
POST /api/update-task
Body: {
  "TaskId": 1,
  "Marca": "Honda",
  "Modelo": 2020,
  "Tipo": "Filtro de Aire",
  "Cantidad": 10,
  "Version": "v1.1"
}
```

### Eliminar Repuesto
```
DELETE /api/delete-task
Body: {
  "TaskId": 1
}
```

## Funcionalidades de la Interfaz

### Gestión de Repuestos
- **Agregar**: Completar el formulario y hacer clic en "Agregar"
- **Editar**: Hacer clic en el botón de editar (lápiz) en la tabla
- **Eliminar**: Hacer clic en el botón de eliminar (papelera) con confirmación
- **Cancelar**: Botón para cancelar edición y limpiar formulario

### Filtros
- Filtrar simultáneamente por Marca, Modelo, Tipo y Versión
- Búsqueda dinámica en tiempo real
- Botón "Limpiar" para resetear todos los filtros
- Contador de resultados filtrados

### Indicadores Visuales
- **Verde**: Stock normal (cantidad >= 5)
- **Amarillo**: Stock bajo (cantidad < 5)
- **Rojo**: Sin stock (cantidad = 0)

## Esquema de Datos

```javascript
{
  TaskId: Number,      // ID único del repuesto
  Marca: String,       // Marca (Honda, Yamaha, etc.)
  Modelo: Number,      // Año del modelo
  Tipo: String,        // Tipo de repuesto (Filtro, Llanta, etc.)
  Cantidad: Number,    // Cantidad en inventario
  Version: String      // Versión del repuesto
}
```

## Autor

German Umana

## Licencia

ISC

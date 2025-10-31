# Inventario de Repuestos para Moto

Sistema de gestión de inventario de repuestos para motocicletas con interfaz web desarrollada en AngularJS y backend en Node.js/Express con MongoDB.

## Características

- **Sistema de Autenticación**: Login y registro de usuarios con roles diferenciados
- **Perfiles de Usuario**:
  - **Administrador**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
  - **User**: Solo listar repuestos y editar cantidad
- **CRUD Completo**: Crear, Leer, Actualizar y Eliminar repuestos (Admin)
- **Filtros Dinámicos**: Filtrar por Marca, Modelo, Tipo y Versión
- **Interfaz Intuitiva**: Diseño responsivo con Bootstrap 5
- **Alertas de Stock**: Indicadores visuales para productos con baja cantidad
- **API RESTful**: Backend con Express y MongoDB protegido con autenticación
- **Gestión de Sesiones**: Sistema de tokens para mantener sesiones activas

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

## Uso del Sistema

### Primer Acceso

1. Al acceder a `http://localhost:3000` serás redirigido a la página de login
2. Primero debes registrarte:
   - Click en la pestaña "Registrarse"
   - Ingresa un nombre de usuario
   - Crea una contraseña
   - Selecciona un rol:
     - **Administrador**: Acceso completo al sistema
     - **Usuario**: Solo puede ver y actualizar cantidades
   - Click en "Registrarse"
3. Una vez registrado, inicia sesión con tus credenciales

### Roles y Permisos

#### Administrador
- ✅ Crear nuevos repuestos
- ✅ Listar todos los repuestos
- ✅ Editar todos los campos de un repuesto
- ✅ Eliminar repuestos
- ✅ Usar todos los filtros

#### Usuario (User)
- ✅ Listar todos los repuestos
- ✅ Editar únicamente la cantidad de repuestos
- ✅ Usar todos los filtros
- ❌ No puede crear repuestos
- ❌ No puede eliminar repuestos
- ❌ No puede editar otros campos (Marca, Modelo, Tipo, Versión)

## Estructura del Proyecto

```
todo-tasks/
├── server.js              # Servidor Express
├── api.js                 # Rutas API y conexión MongoDB
├── task_schema.js         # Schema Mongoose para repuestos
├── user_schema.js         # Schema Mongoose para usuarios
├── public/                # Archivos estáticos
│   ├── index.html        # Interfaz principal de inventario
│   ├── login.html        # Interfaz de login/registro
│   ├── css/
│   │   └── style.css     # Estilos personalizados
│   └── js/
│       ├── app.js        # Controlador AngularJS (inventario)
│       └── login.js      # Controlador AngularJS (login)
├── package.json
└── .env                  # Variables de entorno
```

## API Endpoints

### Autenticación

#### Registrar Usuario
```
POST /api/register
Body: {
  "username": "admin",
  "password": "1234",
  "role": "Administrador"  // o "User"
}
```

#### Login
```
POST /api/login
Body: {
  "username": "admin",
  "password": "1234"
}
Response: {
  "token": "token_xyz...",
  "user": {
    "username": "admin",
    "role": "Administrador"
  }
}
```

#### Logout
```
POST /api/logout
Headers: {
  "Authorization": "token_xyz..."
}
```

#### Obtener Usuario Actual
```
GET /api/current-user
Headers: {
  "Authorization": "token_xyz..."
}
```

### Gestión de Repuestos (Requieren Autenticación)

**Nota**: Todos los endpoints de repuestos requieren el header `Authorization` con el token obtenido en el login.

#### Crear Repuesto (Solo Administrador)
```
POST /api/create-task
Headers: {
  "Authorization": "token_xyz..."
}
Body: {
  "TaskId": 1,
  "Marca": "Honda",
  "Modelo": 2020,
  "Tipo": "Filtro de Aire",
  "Cantidad": 5,
  "Version": "CB190R"
}
```

#### Obtener Todos los Repuestos (Autenticado)
```
GET /api/all-tasks
Headers: {
  "Authorization": "token_xyz..."
}
```

#### Actualizar Repuesto (Autenticado)
```
POST /api/update-task
Headers: {
  "Authorization": "token_xyz..."
}
Body: {
  "TaskId": 1,
  "Marca": "Honda",        // Solo Admin puede editar
  "Modelo": 2020,          // Solo Admin puede editar
  "Tipo": "Filtro de Aire", // Solo Admin puede editar
  "Cantidad": 10,          // Todos pueden editar
  "Version": "CB190R"      // Solo Admin puede editar
}
```

#### Eliminar Repuesto (Solo Administrador)
```
DELETE /api/delete-task
Headers: {
  "Authorization": "token_xyz..."
}
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

### Schema de Usuario
```javascript
{
  username: String,    // Nombre de usuario único
  password: String,    // Contraseña (sin encriptar - TODO: usar bcrypt)
  role: String,        // "Administrador" o "User"
  createdAt: Date      // Fecha de creación
}
```

### Schema de Repuesto
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

## Seguridad

### Notas Importantes
- ⚠️ **Contraseñas**: Actualmente las contraseñas se guardan sin encriptar. Para producción, implementar bcrypt
- ⚠️ **Tokens**: Se usan tokens simples en memoria. Para producción, usar JWT y express-session
- ⚠️ **HTTPS**: En producción, usar siempre HTTPS para proteger las credenciales

### Recomendaciones para Producción
1. Implementar bcrypt para hash de contraseñas
2. Usar JSON Web Tokens (JWT) en lugar de tokens simples
3. Implementar express-session con Redis para persistencia de sesiones
4. Agregar rate limiting para prevenir ataques de fuerza bruta
5. Configurar CORS apropiadamente
6. Usar HTTPS en el servidor

## Autor

German Umana

## Licencia

ISC

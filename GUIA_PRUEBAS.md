# Guía de Pruebas - Sistema de Perfiles de Usuario

## Resumen de Cambios

Se ha implementado un sistema completo de autenticación y autorización con dos roles de usuario:

### Roles Implementados

1. **Administrador**
   - Puede crear, leer, actualizar y eliminar repuestos
   - Acceso completo a todos los campos del formulario
   - Puede ver el botón de eliminar en cada repuesto

2. **User (Usuario Regular)**
   - Puede listar todos los repuestos
   - Puede editar ÚNICAMENTE la cantidad de los repuestos
   - NO puede crear nuevos repuestos
   - NO puede eliminar repuestos
   - NO puede editar campos como Marca, Modelo, Tipo o Versión

## Archivos Creados/Modificados

### Nuevos Archivos
- `user_schema.js` - Schema de Mongoose para usuarios
- `public/login.html` - Interfaz de login y registro
- `public/js/login.js` - Controlador AngularJS para login
- `GUIA_PRUEBAS.md` - Este archivo

### Archivos Modificados
- `api.js` - Agregados endpoints de autenticación y middleware de autorización
- `server.js` - Agregada ruta para login.html
- `public/index.html` - Actualizada interfaz con control de permisos según rol
- `public/js/app.js` - Agregada gestión de sesiones y verificación de autenticación
- `README.md` - Actualizada documentación

## Cómo Probar el Sistema

### Paso 1: Iniciar el Servidor

```bash
node server.js
```

El servidor debe iniciar en `http://localhost:3000` y mostrar:
```
Server is listening at port: 3000
Access the application at: http://localhost:3000
Conexión a la base de datos exitosa
```

### Paso 2: Registrar Usuario Administrador

1. Abre el navegador en `http://localhost:3000`
2. Serás redirigido automáticamente a `/login.html`
3. Click en la pestaña **"Registrarse"**
4. Completa el formulario:
   - **Usuario**: admin
   - **Contraseña**: 1234
   - **Rol**: Administrador
5. Click en **"Registrarse"**
6. Espera el mensaje de confirmación y serás redirigido al login

### Paso 3: Login como Administrador

1. En la pestaña **"Iniciar Sesión"**:
   - **Usuario**: admin
   - **Contraseña**: 1234
2. Click en **"Iniciar Sesión"**
3. Serás redirigido a la interfaz principal

### Paso 4: Probar Permisos de Administrador

Una vez dentro con el usuario admin:

1. **Verificar interfaz**:
   - Debes ver tu nombre de usuario en la esquina superior derecha
   - Un badge amarillo que dice "Administrador"
   - El formulario de "Agregar Repuesto" debe estar visible

2. **Crear un repuesto**:
   - El ID se asigna automáticamente
   - Selecciona: Marca: Honda, Versión: CB190R, Modelo: 2020
   - Tipo: Filtro de Aire, Cantidad: 10
   - Click en "Agregar"
   - Verifica que aparece en la tabla

3. **Editar un repuesto**:
   - Click en el botón de editar (lápiz amarillo)
   - Todos los campos deben estar habilitados
   - Cambia la marca a Yamaha y la cantidad a 15
   - Click en "Actualizar"
   - Verifica que los cambios se guardaron

4. **Eliminar un repuesto**:
   - Debes ver el botón de eliminar (papelera roja)
   - Click en eliminar
   - Confirma la eliminación
   - Verifica que el repuesto se eliminó

### Paso 5: Registrar Usuario Regular

1. Click en **"Cerrar Sesión"** en la esquina superior derecha
2. En la página de login, click en **"Registrarse"**
3. Completa el formulario:
   - **Usuario**: user1
   - **Contraseña**: 1234
   - **Rol**: Usuario
4. Click en **"Registrarse"**

### Paso 6: Login como Usuario Regular

1. Inicia sesión con:
   - **Usuario**: user1
   - **Contraseña**: 1234
2. Click en **"Iniciar Sesión"**

### Paso 7: Probar Permisos de Usuario Regular

Una vez dentro con el usuario user1:

1. **Verificar interfaz**:
   - Debes ver tu nombre de usuario: user1
   - Un badge azul que dice "User"
   - El formulario de "Agregar Repuesto" NO debe estar visible

2. **Intentar editar un repuesto**:
   - Click en el botón de editar (lápiz amarillo)
   - Aparece el formulario con un mensaje: "Solo puede editar la cantidad"
   - TODOS los campos excepto "Cantidad" deben estar deshabilitados (grisados)
   - Solo puedes cambiar el campo "Cantidad"
   - Cambia la cantidad y click en "Actualizar"
   - Verifica que SOLO la cantidad cambió

3. **Verificar que NO puede eliminar**:
   - Los botones de eliminar (papelera roja) NO deben aparecer en la tabla

4. **Probar filtros**:
   - Los filtros deben funcionar normalmente para ambos roles

## Flujo de Seguridad Implementado

### Autenticación
1. Usuario se registra con username, password y rol
2. Usuario hace login y recibe un token
3. El token se guarda en localStorage del navegador
4. Todas las peticiones API incluyen el token en el header "Authorization"

### Autorización Backend
- Middleware `isAuthenticated`: Verifica que el usuario tenga un token válido
- Middleware `isAdmin`: Verifica que el usuario sea Administrador
- Endpoints protegidos:
  - `POST /api/create-task` → Requiere autenticación + Admin
  - `GET /api/all-tasks` → Requiere autenticación
  - `POST /api/update-task` → Requiere autenticación (lógica diferenciada por rol)
  - `DELETE /api/delete-task` → Requiere autenticación + Admin

### Autorización Frontend
- Al cargar la app, verifica si hay token válido
- Si no hay token, redirige a login
- Según el rol del usuario, muestra/oculta elementos:
  - Formulario de crear (solo Admin)
  - Botón de eliminar (solo Admin)
  - Campos del formulario de edición (Admin: todos, User: solo cantidad)

## Casos de Prueba Adicionales

### Caso 1: Token Inválido
1. Con la consola del navegador (F12), borra el localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Recarga la página
3. Debes ser redirigido al login

### Caso 2: Usuario intenta acceder a endpoint protegido sin token
Usando Postman o curl:
```bash
curl -X GET http://localhost:3000/api/all-tasks
```
Respuesta esperada: `401 Unauthorized`

### Caso 3: Usuario regular intenta crear repuesto
Usando Postman con el token de un usuario regular:
```bash
curl -X POST http://localhost:3000/api/create-task \
  -H "Authorization: token_del_usuario_regular" \
  -H "Content-Type: application/json" \
  -d '{"TaskId":999,"Marca":"Honda","Modelo":2020,"Tipo":"Filtro","Cantidad":5,"Version":"v1"}'
```
Respuesta esperada: `403 Forbidden - Acceso denegado. Se requiere rol de Administrador.`

### Caso 4: Usuario regular intenta editar campos protegidos
1. Login como user1
2. Edita un repuesto
3. Abre la consola del navegador y verifica la petición
4. El backend debe IGNORAR los campos Marca, Modelo, Tipo, Versión
5. Solo debe actualizar Cantidad

## Notas de Seguridad

⚠️ **IMPORTANTE**: Esta implementación es para desarrollo/educación:

1. Las contraseñas NO están encriptadas (se guardan en texto plano)
2. Los tokens son simples y se guardan en memoria (se pierden al reiniciar el servidor)
3. No hay protección contra ataques de fuerza bruta
4. No hay validación de fortaleza de contraseñas
5. No hay límite de tiempo para las sesiones

Para producción, se debe:
- Usar bcrypt para hash de contraseñas
- Implementar JWT (JSON Web Tokens)
- Usar express-session con Redis
- Agregar rate limiting
- Validar entrada de usuarios
- Implementar HTTPS
- Agregar expiración de tokens

## Troubleshooting

### Problema: "No autorizado. Token requerido"
**Solución**: Cierra sesión y vuelve a iniciar sesión para obtener un nuevo token

### Problema: "Sesión inválida o expirada"
**Solución**: El servidor fue reiniciado. Cierra sesión y vuelve a iniciar sesión

### Problema: Al crear usuario dice "El usuario ya existe"
**Solución**: Usa un nombre de usuario diferente o elimina el usuario de la base de datos

### Problema: No se ve el formulario de crear repuesto
**Solución**: Verifica que iniciaste sesión como Administrador (badge amarillo)

### Problema: No puedo editar campos del repuesto
**Solución**: Si eres usuario regular, esto es correcto. Solo puedes editar la cantidad.

## Resumen de Endpoints

| Endpoint | Método | Autenticación | Rol Requerido | Descripción |
|----------|--------|---------------|---------------|-------------|
| `/api/register` | POST | No | - | Registrar nuevo usuario |
| `/api/login` | POST | No | - | Iniciar sesión |
| `/api/logout` | POST | Sí | - | Cerrar sesión |
| `/api/current-user` | GET | Sí | - | Obtener usuario actual |
| `/api/create-task` | POST | Sí | Admin | Crear repuesto |
| `/api/all-tasks` | GET | Sí | - | Listar repuestos |
| `/api/update-task` | POST | Sí | - | Actualizar repuesto |
| `/api/delete-task` | DELETE | Sí | Admin | Eliminar repuesto |

## Conclusión

El sistema ahora cuenta con:
- ✅ Autenticación completa con login/registro
- ✅ Dos roles diferenciados (Administrador y User)
- ✅ Control de permisos en backend (API)
- ✅ Control de permisos en frontend (UI)
- ✅ Gestión de sesiones con tokens
- ✅ Protección de rutas y endpoints
- ✅ Interfaz adaptativa según el rol del usuario

El sistema está listo para pruebas en desarrollo.

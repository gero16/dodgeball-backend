# API Documentation - Dodgeball Club Backend

## Base URL
```
http://localhost:3000/api
```

## Autenticación
La mayoría de endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer <token>
```

## Endpoints

### Usuarios
- `POST /usuario/registrar` - Registrar nuevo usuario
- `POST /usuario/iniciar-sesion` - Iniciar sesión
- `GET /usuario/perfil` - Obtener perfil (requiere token)
- `PUT /usuario/perfil` - Actualizar perfil (requiere token)
- `PUT /usuario/cambiar-password` - Cambiar contraseña (requiere token)
- `GET /usuario/usuarios` - Obtener usuarios (admin)
- `DELETE /usuario/usuarios/:id` - Eliminar usuario (admin)

### Publicaciones
- `GET /publicaciones/traer-publicaciones` - Obtener publicaciones
- `GET /publicaciones/:id` - Obtener publicación por ID
- `POST /publicaciones/crear` - Crear publicación (requiere token)
- `PUT /publicaciones/:id` - Actualizar publicación (requiere token)
- `DELETE /publicaciones/:id` - Eliminar publicación (requiere token)
- `GET /publicaciones/categorias/lista` - Obtener categorías
- `GET /publicaciones/destacadas/lista` - Obtener destacadas
- `POST /publicaciones/:id/comentarios` - Agregar comentario (requiere token)

### Eventos
- `GET /eventos` - Obtener eventos
- `GET /eventos/:id` - Obtener evento por ID
- `POST /eventos/crear` - Crear evento (requiere token)
- `PUT /eventos/:id` - Actualizar evento (requiere token)
- `DELETE /eventos/:id` - Eliminar evento (requiere token)
- `POST /eventos/:id/inscribirse` - Inscribirse en evento (requiere token)
- `GET /eventos/proximos/lista` - Obtener eventos próximos
- `GET /eventos/pasados/lista` - Obtener eventos pasados

### Productos
- `GET /productos` - Obtener productos
- `GET /productos/:id` - Obtener producto por ID
- `POST /productos/crear` - Crear producto (admin)
- `PUT /productos/:id` - Actualizar producto (admin)
- `DELETE /productos/:id` - Eliminar producto (admin)
- `GET /productos/categorias/lista` - Obtener categorías
- `GET /productos/destacados/lista` - Obtener destacados
- `PUT /productos/:id/stock` - Actualizar stock (admin)

### Donaciones
- `POST /donaciones/crear` - Crear donación
- `GET /donaciones` - Obtener donaciones (admin)
- `GET /donaciones/:id` - Obtener donación por ID (admin)
- `PUT /donaciones/:id/estado` - Actualizar estado (admin)
- `GET /donaciones/estadisticas/obtener` - Obtener estadísticas (admin)
- `POST /donaciones/procesar-paypal` - Procesar pago PayPal

### Horarios
- `GET /horarios/fechas/:fecha` - Obtener horarios por fecha
- `POST /horarios/agendar` - Agendar horario (requiere token)
- `POST /horarios/crear` - Crear horario (admin)
- `GET /horarios/agenda` - Obtener agenda (admin)
- `PUT /horarios/:id` - Actualizar horario (admin)
- `DELETE /horarios/:id` - Eliminar horario (admin)

### Contacto
- `POST /contacto/enviar` - Enviar mensaje
- `GET /contacto/mensajes` - Obtener mensajes (admin)
- `GET /contacto/mensajes/:id` - Obtener mensaje por ID (admin)
- `PUT /contacto/mensajes/:id/estado` - Actualizar estado (admin)
- `POST /contacto/mensajes/:id/responder` - Responder mensaje (admin)
- `GET /contacto/estadisticas/obtener` - Obtener estadísticas (admin)

## Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error interno del servidor

## Formato de Respuesta

### Éxito
```json
{
  "success": true,
  "message": "Mensaje de éxito",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": [ ... ]
}
```

## Ejemplos de Uso

### Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/usuario/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "123456",
    "telefono": "+1234567890"
  }'
```

### Iniciar Sesión
```bash
curl -X POST http://localhost:3000/api/usuario/iniciar-sesion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "123456"
  }'
```

### Obtener Publicaciones
```bash
curl -X GET "http://localhost:3000/api/publicaciones/traer-publicaciones?pagina=1&limite=10&categoria=noticias"
```

### Crear Evento (requiere token)
```bash
curl -X POST http://localhost:3000/api/eventos/crear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "titulo": "Torneo de Dodgeball",
    "descripcion": "Torneo mensual de dodgeball",
    "fecha": "2024-02-15",
    "horaInicio": "10:00",
    "horaFin": "18:00",
    "ubicacion": {
      "nombre": "Cancha Principal",
      "direccion": "123 Calle Principal"
    },
    "tipo": "torneo",
    "cupoMaximo": 50,
    "precio": 25
  }'
```

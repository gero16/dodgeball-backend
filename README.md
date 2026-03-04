# Dodgeball Club - Backend API

Backend API completo para el Dodgeball Club desarrollado con Node.js, Express y MongoDB.

## 🚀 Características

- **Autenticación JWT** - Sistema de login seguro
- **Gestión de Usuarios** - Registro, perfil y administración
- **Sistema de Publicaciones** - Blog con categorías y búsqueda
- **Gestión de Eventos** - Creación y administración de eventos
- **Sistema de Productos** - Tienda online con gestión de inventario
- **Sistema de Donaciones** - Integración con PayPal
- **Reserva de Horarios** - Sistema de agendamiento
- **Sistema de Contacto** - Mensajes con notificaciones por email
- **Subida de Archivos** - Manejo de imágenes con Multer
- **Tiempo Real** - Notificaciones con Socket.io
- **API RESTful** - Endpoints bien estructurados

## 📋 Requisitos

- Node.js (v14 o superior)
- MongoDB (local o Atlas)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd dodgeball-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Configurar el archivo .env**
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/dodgeball-club

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# PayPal (para donaciones)
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=sandbox

# Mercado Pago (para donaciones)
# Producción suele empezar con: APP_USR-...
# Prueba / sandbox suele empezar con: TEST-...
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_access_token

# Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173
```

5. **Inicializar base de datos (opcional)**
```bash
npm run init-db
```

6. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### 🔐 Autenticación
- `POST /api/usuario/registrar` - Registrar nuevo usuario
- `POST /api/usuario/iniciar-sesion` - Iniciar sesión
- `GET /api/usuario/perfil` - Obtener perfil (requiere token)
- `PUT /api/usuario/perfil` - Actualizar perfil (requiere token)

### 📰 Publicaciones
- `GET /api/publicaciones/traer-publicaciones` - Obtener todas las publicaciones
- `GET /api/publicaciones/:id` - Obtener publicación por ID
- `POST /api/publicaciones/crear` - Crear publicación (requiere token)
- `PUT /api/publicaciones/:id` - Actualizar publicación (requiere token)
- `DELETE /api/publicaciones/:id` - Eliminar publicación (requiere token)
- `GET /api/publicaciones/categorias/lista` - Obtener categorías
- `GET /api/publicaciones/destacadas/lista` - Obtener publicaciones destacadas

### 🎉 Eventos
- `GET /api/eventos` - Obtener todos los eventos
- `GET /api/eventos/:id` - Obtener evento por ID
- `POST /api/eventos/crear` - Crear evento (requiere token)
- `PUT /api/eventos/:id` - Actualizar evento (requiere token)
- `DELETE /api/eventos/:id` - Eliminar evento (requiere token)
- `POST /api/eventos/:id/inscribirse` - Inscribirse en evento (requiere token)
- `GET /api/eventos/proximos/lista` - Obtener eventos próximos
- `GET /api/eventos/pasados/lista` - Obtener eventos pasados

### 🛒 Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos/crear` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)
- `GET /api/productos/categorias/lista` - Obtener categorías
- `GET /api/productos/destacados/lista` - Obtener productos destacados

### 💰 Donaciones
- `POST /api/donaciones/crear` - Crear donación
- `GET /api/donaciones` - Obtener donaciones (admin)
- `GET /api/donaciones/:id` - Obtener donación por ID (admin)
- `PUT /api/donaciones/:id/estado` - Actualizar estado (admin)
- `POST /api/donaciones/procesar-paypal` - Procesar pago PayPal

### ⏰ Horarios
- `GET /api/horarios/fechas/:fecha` - Obtener horarios por fecha
- `POST /api/horarios/agendar` - Agendar horario (requiere token)
- `POST /api/horarios/crear` - Crear horario (admin)
- `GET /api/horarios/agenda` - Obtener agenda (admin)
- `PUT /api/horarios/:id` - Actualizar horario (admin)
- `DELETE /api/horarios/:id` - Eliminar horario (admin)

### 📧 Contacto
- `POST /api/contacto/enviar` - Enviar mensaje de contacto
- `GET /api/contacto/mensajes` - Obtener mensajes (admin)
- `GET /api/contacto/mensajes/:id` - Obtener mensaje por ID (admin)
- `PUT /api/contacto/mensajes/:id/estado` - Actualizar estado (admin)
- `POST /api/contacto/mensajes/:id/responder` - Responder mensaje (admin)

## 🗄️ Modelos de Base de Datos

### Usuario
- Información personal y credenciales
- Roles: usuario, admin
- Autenticación con JWT

### Publicación
- Sistema de blog con categorías
- Contenido estructurado (párrafos, listas, imágenes)
- Sistema de etiquetas y búsqueda

### Evento
- Creación y gestión de eventos
- Sistema de inscripciones
- Tipos: Torneo, Entrenamiento, Liga, Social, Benéfico

### Producto
- Gestión de inventario
- Categorías y variantes
- Sistema de stock

### Donación
- Integración con PayPal
- Seguimiento de pagos
- Estadísticas de donaciones

### Horario
- Gestión de disponibilidad
- Sistema de reservas
- Ubicaciones y tipos

### Contacto
- Mensajes de contacto
- Sistema de respuestas
- Estados y seguimiento

## 🔒 Seguridad

- **JWT Tokens** para autenticación
- **Bcrypt** para encriptación de contraseñas
- **CORS** configurado para el frontend
- **Validación** de datos de entrada
- **Middleware** de autenticación y autorización
- **Límites** de tamaño de archivos
- **Rate Limiting** para prevenir abuso

## �� Estructura del Proyecto

```
dodgeball-backend/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Rutas de la API
│   ├── middleware/     # Middlewares personalizados
│   ├── config/         # Configuraciones
│   ├── utils/          # Utilidades
│   ├── app.js          # Configuración de Express
│   └── index.js        # Punto de entrada
├── scripts/           # Scripts de utilidad
├── uploads/           # Archivos subidos
├── .env.example       # Variables de entorno de ejemplo
├── package.json       # Dependencias y scripts
└── README.md          # Documentación
```

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dodgeball-club
JWT_SECRET=secret_muy_seguro_para_produccion
FRONTEND_URL=https://tu-frontend.com
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx
```

### Comandos de Producción
```bash
npm start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Para soporte, contacta a [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)

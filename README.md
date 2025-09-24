# Dodgeball Club - Backend API

Backend API completo para el Dodgeball Club desarrollado con Node.js, Express y MongoDB.

## 🚀 Características

- **Autenticación JWT** - Sistema de login seguro
- **Gestión de Usuarios** - Registro, perfil y administración
- **Sistema de Publicaciones** - Blog con categorías y búsqueda
- **Reserva de Horarios** - Sistema de agendamiento
- **Gestión de Eventos** - Creación y administración de eventos
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
cd dodgeball-back
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

# Uploads
MAX_FILE_SIZE=5242880
```

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### 🔐 Autenticación
- `POST /usuario/registrar` - Registrar nuevo usuario
- `POST /usuario/iniciar-sesion` - Iniciar sesión
- `GET /usuario/perfil` - Obtener perfil (requiere token)
- `PUT /usuario/perfil` - Actualizar perfil (requiere token)

### 📰 Publicaciones
- `GET /publicaciones/traer-publicaciones` - Obtener todas las publicaciones
- `GET /publicaciones/:id` - Obtener publicación por ID
- `POST /publicaciones/crear` - Crear publicación (requiere token)
- `PUT /publicaciones/:id` - Actualizar publicación (requiere token)
- `DELETE /publicaciones/:id` - Eliminar publicación (requiere token)
- `GET /publicaciones/categorias/lista` - Obtener categorías
- `GET /publicaciones/destacadas/lista` - Obtener publicaciones destacadas

### ⏰ Horarios
- `POST /horarios/fechas/:fecha` - Obtener horarios por fecha
- `POST /horarios/agendar` - Agendar horario
- `POST /horarios/crear` - Crear horario (admin)
- `PUT /horarios/:id` - Actualizar horario (admin)
- `DELETE /horarios/:id` - Eliminar horario (admin)
- `GET /horarios/agenda` - Obtener agenda (admin)

### 📧 Contacto
- `POST /contacto/enviar` - Enviar mensaje de contacto
- `GET /contacto/mensajes` - Obtener mensajes (admin)
- `GET /contacto/mensajes/:id` - Obtener mensaje por ID (admin)
- `PUT /contacto/mensajes/:id/estado` - Actualizar estado (admin)
- `POST /contacto/mensajes/:id/responder` - Responder mensaje (admin)

### 🎉 Eventos
- `GET /eventos` - Obtener todos los eventos
- `GET /eventos/:id` - Obtener evento por ID
- `POST /eventos/crear` - Crear evento (requiere token)
- `PUT /eventos/:id` - Actualizar evento (requiere token)
- `DELETE /eventos/:id` - Eliminar evento (requiere token)
- `POST /eventos/:id/inscribirse` - Inscribirse en evento (requiere token)
- `GET /eventos/proximos/lista` - Obtener eventos próximos
- `GET /eventos/pasados/lista` - Obtener eventos pasados

## 🗄️ Modelos de Base de Datos

### Usuario
- Información personal y credenciales
- Roles: usuario, admin
- Autenticación con JWT

### Publicación
- Sistema de blog con categorías
- Contenido estructurado (párrafos, listas, imágenes)
- Sistema de etiquetas y búsqueda

### Horario
- Gestión de disponibilidad
- Sistema de reservas
- Ubicaciones y tipos

### Agenda
- Reservas de usuarios
- Estados: pendiente, confirmada, cancelada
- Datos de contacto

### Contacto
- Mensajes de contacto
- Sistema de respuestas
- Estados y seguimiento

### Evento
- Creación y gestión de eventos
- Sistema de inscripciones
- Tipos: Torneo, Entrenamiento, Liga, Social, Benéfico

## 🔒 Seguridad

- **JWT Tokens** para autenticación
- **Bcrypt** para encriptación de contraseñas
- **CORS** configurado para el frontend
- **Validación** de datos de entrada
- **Middleware** de autenticación y autorización
- **Límites** de tamaño de archivos

## 📁 Estructura del Proyecto

```
dodgeball-back/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Rutas de la API
│   ├── middleware/     # Middlewares personalizados
│   ├── config/         # Configuraciones
│   ├── utils/          # Utilidades
│   ├── app.js          # Configuración de Express
│   └── index.js        # Punto de entrada
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
# dodgeball-backend

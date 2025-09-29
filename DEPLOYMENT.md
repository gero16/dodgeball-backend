# Guía de Despliegue - Railpack

## 🚀 Despliegue en Railpack

### 1. Configuración Previa

Antes de desplegar, asegúrate de tener configurado:

- **MongoDB Atlas**: Base de datos en la nube
- **Variables de entorno**: Configuradas en Railpack
- **Dominio**: Para el frontend (opcional)

### 2. Variables de Entorno Requeridas

Configura estas variables en el panel de Railpack:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dodgeball-club
JWT_SECRET=tu_jwt_secret_muy_seguro_para_produccion
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=live
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
SOCKET_CORS_ORIGIN=https://tu-frontend.com
```

### 3. Comandos de Despliegue

Railpack ejecutará automáticamente:

```bash
npm ci
npm start
```

### 4. Verificación Post-Despliegue

Una vez desplegado, verifica:

1. **Health Check**: `GET /api/health`
2. **API Root**: `GET /`
3. **Endpoints**: Todos los endpoints funcionando

### 5. Configuración de MongoDB Atlas

1. Crea un cluster en MongoDB Atlas
2. Configura un usuario de base de datos
3. Obtén la cadena de conexión
4. Actualiza la variable `MONGODB_URI`

### 6. Configuración de PayPal (Opcional)

1. Crea una cuenta de desarrollador en PayPal
2. Obtén las credenciales de la aplicación
3. Configura las variables `PAYPAL_*`

### 7. Configuración de Email (Opcional)

1. Configura un servicio SMTP (Gmail, SendGrid, etc.)
2. Configura las variables `EMAIL_*`

### 8. Monitoreo

- Revisa los logs en el panel de Railpack
- Monitorea el rendimiento
- Configura alertas si es necesario

## 🔧 Solución de Problemas

### Error de Dependencias
Si hay problemas con `npm ci`, ejecuta:
```bash
rm package-lock.json
npm install
```

### Error de MongoDB
Verifica que la cadena de conexión sea correcta y que el cluster esté accesible.

### Error de Puerto
Asegúrate de que la variable `PORT` esté configurada correctamente.

## 📞 Soporte

Para problemas específicos de Railpack, consulta su documentación oficial.

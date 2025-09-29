# Guía de Despliegue - Railway

## 🚂 Despliegue en Railway

### 1. Configuración Previa

Antes de desplegar, asegúrate de tener:

- **Servicio MongoDB** en Railway
- **Variables de entorno** configuradas
- **Dominio** para el frontend (opcional)

### 2. Configuración de MongoDB en Railway

Railway proporciona MongoDB como un servicio interno. Las variables de entorno se configuran automáticamente.

#### Variables de Railway MongoDB:

```env
# Variables principales (Railway las proporciona automáticamente)
MONGOHOST=containers-us-west-xxx.railway.app
MONGOPORT=27017
MONGOUSER=root
MONGOPASSWORD=tu_password_generado
MONGODATABASE=dodgeball-club

# O alternativamente
MONGO_URL=mongodb://root:password@containers-us-west-xxx.railway.app:27017/dodgeball-club
```

### 3. Configuración en Railway

1. **Crear servicio MongoDB**:
   - En Railway, crea un nuevo servicio
   - Selecciona "Database" > "MongoDB"
   - Railway configurará automáticamente las variables

2. **Configurar variables en tu backend**:
   - Ve a tu servicio de backend
   - Pestaña "Variables"
   - Railway debería mostrar las variables de MongoDB disponibles
   - Agrega las variables necesarias

### 4. Variables de Entorno Requeridas

```env
# MongoDB (Railway proporciona estas automáticamente)
MONGOHOST=containers-us-west-xxx.railway.app
MONGOPORT=27017
MONGOUSER=root
MONGOPASSWORD=tu_password_generado
MONGODATABASE=dodgeball-club

# O usar MONGO_URL directamente
MONGO_URL=mongodb://root:password@containers-us-west-xxx.railway.app:27017/dodgeball-club

# Backend
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro_para_produccion
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.com

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# PayPal (opcional)
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=live

# Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# Socket.io
SOCKET_CORS_ORIGIN=https://tu-frontend.com
```

### 5. Comandos de Despliegue

Railway ejecutará automáticamente:

```bash
npm ci
npm start
```

### 6. Verificación Post-Despliegue

Una vez desplegado, verifica:

1. **Health Check**: `GET /api/health`
2. **API Root**: `GET /`
3. **Logs**: Revisa que no haya errores de MongoDB

### 7. Solución de Problemas

#### Error: ENOTFOUND containers-us-west-xxx.railway.app

**Causa**: El servicio MongoDB no está ejecutándose o la URL es incorrecta

**Solución**:
1. Verifica que el servicio MongoDB esté activo en Railway
2. Copia la URL correcta desde el panel de Railway
3. Asegúrate de que las variables estén configuradas correctamente

#### Error: Authentication failed

**Causa**: Credenciales incorrectas

**Solución**:
1. Verifica `MONGOUSER` y `MONGOPASSWORD`
2. Asegúrate de que las credenciales sean las correctas del panel de Railway

#### Error: Connection timeout

**Causa**: El servicio MongoDB no está accesible

**Solución**:
1. Verifica que el servicio MongoDB esté ejecutándose
2. Revisa que no haya problemas de red
3. Asegúrate de que el puerto sea correcto

### 8. Scripts de Verificación

Puedes probar la conexión localmente:

```bash
# Probar conexión a MongoDB (con variables de Railway)
npm run test-mongodb

# Inicializar base de datos
npm run init-db
```

### 9. Monitoreo

- Revisa los logs en Railway: `railway logs`
- Monitorea el uso de recursos del servicio MongoDB
- Configura alertas si es necesario

### 10. Estructura de URL de Railway

Railway genera URLs en este formato:

```
mongodb://root:password@containers-us-west-xxx.railway.app:27017/database_name
```

Donde:
- `root`: Usuario por defecto
- `password`: Contraseña generada por Railway
- `containers-us-west-xxx.railway.app`: Host del servicio
- `27017`: Puerto por defecto
- `database_name`: Nombre de tu base de datos

## 📞 Soporte

Para problemas específicos de Railway, consulta la [documentación de Railway](https://docs.railway.app/).

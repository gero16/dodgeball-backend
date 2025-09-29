# Guía de Despliegue - Railway

## 🚂 Configuración para Railway

### Variables de Entorno de MongoDB

Railway proporciona MongoDB con estas variables automáticamente:

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

### Configuración Completa

```env
# MongoDB (Railway)
MONGOHOST=containers-us-west-xxx.railway.app
MONGOPORT=27017
MONGOUSER=root
MONGOPASSWORD=tu_password_generado
MONGODATABASE=dodgeball-club

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

### Pasos para Configurar

1. **En Railway**:
   - Crea un servicio MongoDB
   - Railway configurará automáticamente las variables

2. **En tu servicio de backend**:
   - Ve a "Variables"
   - Railway debería mostrar las variables de MongoDB disponibles
   - Agrega las variables necesarias

### Verificación

```bash
# Probar conexión
npm run test-mongodb

# Ver logs en Railway
railway logs
```

### Solución de Problemas

- **ENOTFOUND**: Verifica que MONGOHOST esté correcto
- **Authentication failed**: Verifica MONGOUSER y MONGOPASSWORD
- **Connection timeout**: Verifica que el servicio MongoDB esté activo

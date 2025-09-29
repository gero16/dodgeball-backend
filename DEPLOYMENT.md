# Guía de Despliegue

## 🚀 Despliegue en Railway

### Variables de Entorno Requeridas

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario_node:usuario_node@cluster0.onw6d.mongodb.net/dodgeball?retryWrites=true&w=majority

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

### Pasos para Desplegar

1. **Sube tu código** a Railway
2. **Configura las variables** de entorno
3. **Railway ejecutará** automáticamente:
   ```bash
   npm ci
   npm start
   ```

### Verificación

Una vez desplegado, verifica:
- `GET /api/health` - Debería responder correctamente
- Logs sin errores de MongoDB
- Base de datos conectada

### Comandos Útiles

```bash
# Probar conexión localmente
npm run test-mongodb

# Inicializar base de datos
npm run init-db

# Ejecutar en desarrollo
npm run dev
```

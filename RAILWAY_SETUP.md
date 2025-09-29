# Configuración de MongoDB en Railway

## 🚂 Configuración para Railway

### 1. Variables de Entorno de Railway

Railway proporciona MongoDB con estas variables de entorno:

```env
# Variables principales de Railway MongoDB
MONGOHOST=containers-us-west-xxx.railway.app
MONGOPORT=27017
MONGOUSER=root
MONGOPASSWORD=tu_password_generado
MONGODATABASE=dodgeball-club

# O alternativamente
MONGO_URL=mongodb://root:password@containers-us-west-xxx.railway.app:27017/dodgeball-club
```

### 2. Configuración en Railway

1. **En el panel de Railway**:
   - Ve a tu proyecto
   - Selecciona el servicio de MongoDB
   - Ve a la pestaña "Variables"
   - Copia las variables de entorno

2. **En tu servicio de backend**:
   - Ve a la pestaña "Variables"
   - Agrega las variables de MongoDB

### 3. Variables Requeridas

El backend buscará estas variables en este orden:

1. `MONGODB_URI` (si está configurada)
2. `MONGO_URL` (variable estándar de Railway)
3. Variables individuales: `MONGOHOST`, `MONGOUSER`, `MONGOPASSWORD`, etc.

### 4. Configuración Recomendada

```env
# Variables de MongoDB (Railway)
MONGOHOST=containers-us-west-xxx.railway.app
MONGOPORT=27017
MONGOUSER=root
MONGOPASSWORD=tu_password_generado
MONGODATABASE=dodgeball-club

# O usar MONGO_URL directamente
MONGO_URL=mongodb://root:password@containers-us-west-xxx.railway.app:27017/dodgeball-club

# Otras variables del backend
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.com
```

### 5. Verificación

Para verificar que la conexión funcione:

```bash
# Localmente (con las variables de Railway)
npm run test-mongodb

# En Railway, revisa los logs
railway logs
```

### 6. Solución de Problemas

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

### 7. Estructura de URL

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

### 8. Monitoreo

- Revisa los logs de Railway para ver errores de conexión
- Monitorea el uso de recursos del servicio MongoDB
- Configura alertas si es necesario

## 📞 Soporte

Para problemas específicos de Railway, consulta la [documentación de Railway](https://docs.railway.app/).

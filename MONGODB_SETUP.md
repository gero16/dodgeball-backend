# Configuración de MongoDB para Railpack

## 🗄️ Configuración de MongoDB Atlas

### 1. Crear Cluster en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster
4. Selecciona la región más cercana a tu ubicación

### 2. Configurar Usuario de Base de Datos

1. En el panel de MongoDB Atlas, ve a "Database Access"
2. Crea un nuevo usuario:
   - Username: `dodgeball-user`
   - Password: Genera una contraseña segura
   - Database User Privileges: "Read and write to any database"

### 3. Configurar Acceso de Red

1. Ve a "Network Access"
2. Agrega una nueva entrada IP:
   - Para desarrollo: `0.0.0.0/0` (acceso desde cualquier IP)
   - Para producción: Agrega la IP de Railpack

### 4. Obtener Cadena de Conexión

1. Ve a "Database" > "Connect"
2. Selecciona "Connect your application"
3. Copia la cadena de conexión
4. Reemplaza `<password>` con la contraseña del usuario
5. Reemplaza `<dbname>` con `dodgeball-club`

### 5. Configurar en Railpack

En el panel de variables de entorno de Railpack, configura:

```env
MONGODB_URI=mongodb+srv://dodgeball-user:tu_password@cluster0.xxxxx.mongodb.net/dodgeball-club?retryWrites=true&w=majority
```

### 6. Verificar Conexión

Una vez configurado, el servidor debería mostrar:
```
MongoDB conectado: cluster0-shard-00-00.xxxxx.mongodb.net
Base de datos: dodgeball-club
```

## 🔧 Solución de Problemas

### Error: ENOTFOUND _mongodb._tcp.cluster.mongodb.net

Este error indica que:
1. La URL de MongoDB no es válida
2. El cluster no existe
3. Hay problemas de DNS

**Solución:**
1. Verifica que la URL esté correcta
2. Asegúrate de que el cluster esté activo
3. Verifica que la contraseña sea correcta

### Error: Authentication failed

**Solución:**
1. Verifica el nombre de usuario y contraseña
2. Asegúrate de que el usuario tenga permisos correctos

### Error: Network timeout

**Solución:**
1. Verifica que la IP esté en la lista de acceso de red
2. Asegúrate de que el firewall no bloquee la conexión

## 📝 Ejemplo de URL Correcta

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dodgeball-club?retryWrites=true&w=majority
```

Donde:
- `username`: Tu nombre de usuario de MongoDB
- `password`: Tu contraseña de MongoDB
- `cluster0.xxxxx.mongodb.net`: La URL de tu cluster
- `dodgeball-club`: Nombre de tu base de datos

## ✅ **Configuración Actualizada para Railway**

He actualizado completamente la configuración para trabajar con MongoDB de Railway:

### 🔧 **Cambios Realizados**

1. **✅ Configuración de MongoDB para Railway**:
   - El backend ahora detecta automáticamente las variables de Railway
   - Soporta tanto `MONGO_URL` como variables individuales (`MONGOHOST`, `MONGOUSER`, etc.)
   - Manejo de errores mejorado específico para Railway

2. **✅ Script de verificación actualizado**:
   - Muestra todas las variables de entorno disponibles
   - Detecta automáticamente qué configuración usar
   - Mensajes de error específicos para Railway

3. **✅ Documentación específica para Railway**:
   - `RAILWAY_SETUP.md` - Guía completa para Railway
   - `DEPLOYMENT.md` - Actualizado para Railway
   - `.env.railway` - Archivo de ejemplo para Railway

### 🚂 **Para Configurar en Railway**

1. **En Railway, asegúrate de tener**:
   - Un servicio MongoDB activo
   - Las variables de entorno configuradas en tu servicio de backend

2. **Variables que Railway proporciona automáticamente**:
   ```env
   MONGOHOST=containers-us-west-xxx.railway.app
   MONGOPORT=27017
   MONGOUSER=root
   MONGOPASSWORD=tu_password_generado
   MONGODATABASE=dodgeball-club
   ```

3. **O alternativamente**:
   ```env
   MONGO_URL=mongodb://root:password@containers-us-west-xxx.railway.app:27017/dodgeball-club
   ```

### 🧪 **Para Probar en Railway**

Una vez desplegado en Railway, puedes verificar:

1. **Revisar los logs**:
   ```bash
   railway logs
   ```

2. **Verificar la conexión**:
   - El backend debería mostrar: `✅ MongoDB conectado: containers-us-west-xxx.railway.app`
   - No debería haber errores de `ENOTFOUND`

### 📋 **Archivos Actualizados**

- ✅ `src/config/mongodb.js` - Configuración específica para Railway
- ✅ `scripts/test-mongodb.js` - Script de verificación para Railway
- ✅ `RAILWAY_SETUP.md` - Guía completa de Railway
- ✅ `DEPLOYMENT.md` - Instrucciones actualizadas para Railway
- ✅ `.env.railway` - Variables de ejemplo para Railway

El backend ahora está completamente optimizado para Railway y debería conectarse correctamente a tu servicio MongoDB de Railway sin problemas.

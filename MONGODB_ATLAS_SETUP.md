# Configuración de MongoDB Atlas

## 🗄️ Pasos para configurar MongoDB Atlas

### 1. Crear cuenta en MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea una cuenta gratuita
3. Selecciona el plan gratuito (M0)

### 2. Crear cluster
1. **Build a Database** → **FREE** → **Create**
2. Selecciona la región más cercana
3. Nombra tu cluster (ej: "dodgeball-cluster")
4. **Create Cluster**

### 3. Configurar acceso de red
1. **Network Access** → **Add IP Address**
2. **Add Current IP Address** (para desarrollo)
3. Para producción: **Allow Access from Anywhere** (0.0.0.0/0)

### 4. Crear usuario de base de datos
1. **Database Access** → **Add New Database User**
2. **Username**: `dodgeball-user`
3. **Password**: Genera una contraseña segura
4. **Database User Privileges**: **Read and write to any database**
5. **Add User**

### 5. Obtener cadena de conexión
1. **Database** → **Connect**
2. **Connect your application**
3. **Driver**: Node.js
4. **Version**: 4.1 or later
5. **Copy** la cadena de conexión

### 6. Configurar en tu proyecto
Reemplaza en tu `.env`:
```env
MONGODB_URI=mongodb+srv://dodgeball-user:tu_password@cluster0.xxxxx.mongodb.net/dodgeball-club?retryWrites=true&w=majority
```

### 7. Probar conexión
```bash
npm run test-mongodb
```

## ✅ Ventajas de MongoDB Atlas
- ✅ Fácil de configurar
- ✅ Plan gratuito generoso
- ✅ No hay problemas de variables de entorno
- ✅ Funciona igual en desarrollo y producción
- ✅ Interfaz web para gestionar datos

## 🔧 Para Railway (Producción)
Solo necesitas configurar `MONGODB_URI` en Railway con la misma URL de Atlas.

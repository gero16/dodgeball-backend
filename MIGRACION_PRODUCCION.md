# 🚀 Migración de Estadísticas en Producción

## 📋 Endpoints Disponibles

### **Servidor Principal (Producción)**
- **URL Base**: `https://dodgeball-backend-production.up.railway.app`
- **Puerto**: 3000 (Railway)

### **Endpoints de Migración:**

#### **1. Ejecutar Migración**
- **Método**: `POST`
- **URL**: `https://dodgeball-backend-production.up.railway.app/api/migrar-estadisticas`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**: `{}`
- **Requisitos**: Ninguno (acceso público)

#### **2. Verificar Estado de Migración**
- **Método**: `GET`
- **URL**: `https://dodgeball-backend-production.up.railway.app/api/migrar-estadisticas/status`
- **Headers**: Ninguno requerido
- **Requisitos**: Ninguno (acceso público)

## 🔓 Acceso Público

**IMPORTANTE**: Los endpoints de migración son de **acceso público** y no requieren autenticación.

## 📊 Ejemplo de Uso con Postman

### **Paso 1: Verificar Estado Actual**
```http
GET https://dodgeball-backend-production.up.railway.app/api/migrar-estadisticas/status
```

### **Paso 2: Ejecutar Migración**
```http
POST https://dodgeball-backend-production.up.railway.app/api/migrar-estadisticas
Content-Type: application/json

{}
```

### **Paso 3: Verificar Resultado**
```http
GET https://dodgeball-backend-production.up.railway.app/api/migrar-estadisticas/status
```

## 📈 Respuestas Esperadas

### **Estado de Migración (GET)**
```json
{
  "success": true,
  "totalJugadores": 25,
  "jugadoresConNuevosCampos": 0,
  "porcentajeMigrado": "0.00"
}
```

### **Ejecutar Migración (POST)**
```json
{
  "success": true,
  "mensaje": "Migración completada",
  "totalJugadores": 25,
  "jugadoresActualizados": 25,
  "errores": 0,
  "resultados": [
    {
      "jugador": "Felipe Demarco",
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "estado": "actualizado",
      "estadisticas": {
        "indicePoder": 45.67,
        "indiceAtaque": 28.34,
        "indiceDefensa": 17.33,
        "porcentajeHits": 32.5,
        "porcentajeCatches": 15.2,
        "porcentajeBloqueos": 75.0
      }
    }
  ]
}
```

## ⚠️ Consideraciones Importantes

### **Seguridad:**
- Los endpoints son de acceso público (sin autenticación)
- La migración se puede ejecutar múltiples veces sin problemas
- Considera agregar autenticación en el futuro para mayor seguridad

### **Performance:**
- La migración puede tomar varios segundos dependiendo del número de jugadores
- Se procesa un jugador a la vez para evitar sobrecarga
- Los logs se muestran en la consola del servidor

### **Datos:**
- Los datos existentes se mantienen intactos
- Se agregan nuevos campos con valores por defecto (0)
- Los porcentajes e índices se calculan automáticamente

## 🎯 Flujo Recomendado

1. **Verificar estado actual** - GET `/api/migrar-estadisticas/status`
2. **Ejecutar migración** - POST `/api/migrar-estadisticas`
3. **Verificar resultado** - GET `/api/migrar-estadisticas/status`
4. **Confirmar que `porcentajeMigrado` es 100%**

## 🆘 Solución de Problemas

### **Error 401 - No autorizado**
- Verificar que el token JWT sea válido
- Verificar que el usuario tenga rol `admin`

### **Error 500 - Error interno**
- Revisar logs del servidor en Railway
- Verificar conexión a la base de datos

### **Migración parcial**
- La migración se puede ejecutar múltiples veces
- Solo se actualizan jugadores que no tienen los nuevos campos

## 📞 Soporte

Si encuentras problemas:
1. Verificar logs en Railway Dashboard
2. Confirmar que el usuario tiene rol admin
3. Verificar que el token JWT no haya expirado
4. Revisar la documentación de la API principal

# 🚀 Migración de Estadísticas vía Postman

## 📋 Instrucciones para Ejecutar la Migración

### **Paso 1: Ejecutar el Servidor de Migración**

```bash
cd /home/gero/Desktop/dodgeball-general/dodgeball-backend
node scripts/migrar-via-api.js
```

El servidor se ejecutará en el puerto **3001** y mostrará:
```
🚀 Servidor de migración ejecutándose en puerto 3001
📡 Endpoints disponibles:
   POST http://localhost:3001/api/migrar-estadisticas - Ejecutar migración
   GET  http://localhost:3001/api/migrar-estadisticas/status - Estado de migración
   GET  http://localhost:3001/api/migrar-estadisticas/jugador/:id - Ver jugador específico
   GET  http://localhost:3001/api/migrar-estadisticas/health - Salud del servidor
```

### **Paso 2: Configurar Postman**

#### **2.1 Verificar Salud del Servidor**
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/migrar-estadisticas/health`
- **Headers**: Ninguno requerido
- **Body**: No requerido

**Respuesta esperada**:
```json
{
  "success": true,
  "mensaje": "Servidor de migración funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### **2.2 Verificar Estado Actual**
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/migrar-estadisticas/status`
- **Headers**: Ninguno requerido
- **Body**: No requerido

**Respuesta esperada**:
```json
{
  "success": true,
  "totalJugadores": 25,
  "jugadoresConNuevosCampos": 0,
  "porcentajeMigrado": "0.00"
}
```

#### **2.3 Ejecutar la Migración**
- **Método**: `POST`
- **URL**: `http://localhost:3001/api/migrar-estadisticas`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**: 
  ```json
  {}
  ```
  (No se requiere body, pero Postman necesita algo)

**Respuesta esperada**:
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
    // ... más jugadores
  ]
}
```

#### **2.4 Verificar Estado Después de la Migración**
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/migrar-estadisticas/status`
- **Headers**: Ninguno requerido
- **Body**: No requerido

**Respuesta esperada**:
```json
{
  "success": true,
  "totalJugadores": 25,
  "jugadoresConNuevosCampos": 25,
  "porcentajeMigrado": "100.00"
}
```

#### **2.5 Verificar Jugador Específico**
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/migrar-estadisticas/jugador/{JUGADOR_ID}`
- **Headers**: Ninguno requerido
- **Body**: No requerido

**Ejemplo de URL**: `http://localhost:3001/api/migrar-estadisticas/jugador/64f8a1b2c3d4e5f6a7b8c9d0`

**Respuesta esperada**:
```json
{
  "success": true,
  "jugador": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nombre": "Felipe Demarco",
    "estadisticas": {
      "partidosJugados": 5,
      "setsJugados": 0,
      "tirosTotales": 0,
      "hits": 20,
      "quemados": 0,
      "asistencias": 0,
      "tirosRecibidos": 0,
      "hitsRecibidos": 0,
      "esquives": 0,
      "esquivesExitosos": 0,
      "ponchado": 0,
      "porcentajeOuts": 0,
      "catches": 5,
      "catchesIntentos": 0,
      "catchesRecibidos": 0,
      "porcentajeCatches": 0,
      "bloqueos": 15,
      "bloqueosIntentos": 0,
      "porcentajeBloqueos": 0,
      "pisoLinea": 0,
      "indiceAtaque": 0,
      "indiceDefensa": 0,
      "indicePoder": 0
    }
  }
}
```

## 🔧 Configuración de Postman

### **Crear una Colección**
1. Abre Postman
2. Crea una nueva colección llamada "Migración Estadísticas"
3. Agrega las siguientes requests:

### **Request 1: Health Check**
- **Nombre**: "Health Check"
- **Método**: GET
- **URL**: `http://localhost:3001/api/migrar-estadisticas/health`

### **Request 2: Status Check**
- **Nombre**: "Status Check"
- **Método**: GET
- **URL**: `http://localhost:3001/api/migrar-estadisticas/status`

### **Request 3: Ejecutar Migración**
- **Nombre**: "Ejecutar Migración"
- **Método**: POST
- **URL**: `http://localhost:3001/api/migrar-estadisticas`
- **Headers**: `Content-Type: application/json`
- **Body**: `{}`

### **Request 4: Verificar Status Post-Migración**
- **Nombre**: "Status Post-Migración"
- **Método**: GET
- **URL**: `http://localhost:3001/api/migrar-estadisticas/status`

## 📊 Qué Hace la Migración

### **Campos Agregados a Jugadores**:
- `setsJugados`: Número de sets jugados
- `tirosTotales`: Total de lanzamientos realizados
- `asistencias`: Asistencias en eliminaciones
- `tirosRecibidos`: Lanzamientos recibidos
- `hitsRecibidos`: Veces que fue golpeado
- `esquives`: Intentos de esquive
- `esquivesExitosos`: Esquives exitosos
- `ponchado`: Veces eliminado
- `porcentajeOuts`: Porcentaje de eliminaciones
- `catchesIntentos`: Intentos de catch
- `catchesRecibidos`: Veces que lo atraparon
- `bloqueosIntentos`: Intentos de bloqueo
- `pisoLinea`: Infracciones de línea
- `indiceAtaque`: Índice ofensivo calculado
- `indiceDefensa`: Índice defensivo calculado
- `indicePoder`: Índice total de rendimiento

### **Cálculos Automáticos**:
- **Porcentajes**: Se calculan automáticamente basados en intentos vs éxitos
- **Índices**: Se calculan usando las fórmulas del Excel
- **Compatibilidad**: Los datos existentes se mantienen intactos

## ⚠️ Notas Importantes

1. **Backup**: Siempre haz backup de tu base de datos antes de ejecutar la migración
2. **Una sola vez**: La migración se puede ejecutar múltiples veces sin problemas
3. **Reversible**: Los campos se inicializan con 0, no se pierden datos existentes
4. **Performance**: La migración puede tomar unos segundos dependiendo del número de jugadores

## 🎯 Flujo Recomendado

1. **Ejecutar servidor**: `node scripts/migrar-via-api.js`
2. **Health Check**: Verificar que el servidor funciona
3. **Status Check**: Ver estado actual de la migración
4. **Ejecutar Migración**: POST a `/api/migrar-estadisticas`
5. **Verificar Resultado**: Status Check post-migración
6. **Verificar Jugador**: GET a `/api/migrar-estadisticas/jugador/:id`

## 🆘 Solución de Problemas

### **Error de Conexión**
- Verificar que MongoDB esté ejecutándose
- Verificar la URL en el archivo `.env`

### **Error 404**
- Verificar que el servidor esté ejecutándose en el puerto 3001
- Verificar la URL completa

### **Error 500**
- Revisar los logs del servidor
- Verificar que los modelos estén correctamente importados

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor de migración
2. Verifica la conexión a MongoDB
3. Asegúrate de que todos los archivos estén en su lugar

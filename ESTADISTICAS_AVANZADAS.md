# 📊 Estadísticas Avanzadas de Dodgeball

## Resumen de Mejoras

Se han implementado mejoras significativas en el sistema de estadísticas para manejar datos más detallados y precisos, basados en las estadísticas del Excel proporcionado.

## 🆕 Nuevas Funcionalidades

### 1. **Modelo de Partido Individual**
- **Archivo**: `src/models/Partido.js`
- **Propósito**: Capturar estadísticas detalladas por partido
- **Características**:
  - Estadísticas por jugador en cada partido
  - Cálculo automático de porcentajes
  - Índices de rendimiento (ATAQUE, DEFENSA, PODER)
  - Estadísticas por equipo

### 2. **Estadísticas Avanzadas de Jugador**
- **Archivo**: `src/models/Jugador.js` (actualizado)
- **Nuevos campos**:
  - `tirosTotales`, `asistencias`
  - `tirosRecibidos`, `hitsRecibidos`
  - `esquives`, `esquivesExitosos`
  - `ponchado`, `porcentajeOuts`
  - `catchesIntentos`, `catchesRecibidos`
  - `bloqueosIntentos`, `pisoLinea`
  - `indiceAtaque`, `indiceDefensa`, `indicePoder`

### 3. **Utilidades de Cálculo**
- **Archivo**: `src/utils/estadisticas.js`
- **Funciones**:
  - `calcularIndiceAtaque()`: Calcula índice ofensivo
  - `calcularIndiceDefensa()`: Calcula índice defensivo
  - `calcularIndicePoder()`: Calcula índice total
  - `calcularPorcentajes()`: Calcula todos los porcentajes
  - `generarReporteJugador()`: Genera reporte completo

### 4. **API de Partidos**
- **Archivo**: `src/controllers/partidoController.js`
- **Endpoints**:
  - `POST /api/partidos` - Crear partido
  - `GET /api/partidos` - Listar partidos
  - `GET /api/partidos/:id` - Obtener partido específico
  - `GET /api/partidos/:partidoId/jugador/:jugadorId` - Estadísticas de jugador en partido
  - `GET /api/partidos/ranking/jugadores` - Ranking de jugadores
  - `GET /api/partidos/jugador/:id/reporte` - Reporte completo de jugador

## 📈 Índices de Rendimiento

### **Índice de Ataque**
```
Fórmula: (hits × 2) + (quemados × 3) + (asistencias × 1) + bonus_precisión
Bonus: Si %hits > 30, entonces (%hits - 30) × 0.1
```

### **Índice de Defensa**
```
Fórmula: (catches × 2) + (bloqueos × 1.5) + (esquives_exitosos × 1) + bonus_eficiencia
Bonus: (%catches × 0.1) + (%bloqueos × 0.05)
```

### **Índice de Poder**
```
Fórmula: Índice_Ataque + Índice_Defensa
```

## 🔄 Migración de Datos

### **Script de Migración**
- **Archivo**: `scripts/migrar-estadisticas-avanzadas.js`
- **Propósito**: Actualizar jugadores existentes con nuevos campos
- **Uso**: `node scripts/migrar-estadisticas-avanzadas.js`

### **Campos Migrados**
- Se inicializan con valores por defecto (0)
- Se recalculan porcentajes e índices
- Se mantiene compatibilidad con datos existentes

## 📊 Estructura de Datos

### **Estadísticas por Partido**
```javascript
{
  jugador: ObjectId,
  equipo: ObjectId,
  setsJugados: Number,
  
  // Ofensivas
  tirosTotales: Number,
  hits: Number,
  quemados: Number,
  asistencias: Number,
  porcentajeHits: Number,
  
  // Defensivas
  tirosRecibidos: Number,
  hitsRecibidos: Number,
  esquives: Number,
  esquivesExitosos: Number,
  ponchado: Number,
  porcentajeOuts: Number,
  
  // Especialidades
  catchesIntentos: Number,
  catches: Number,
  catchesRecibidos: Number,
  porcentajeCatches: Number,
  bloqueosIntentos: Number,
  bloqueos: Number,
  porcentajeBloqueos: Number,
  
  // Infracciones
  pisoLinea: Number,
  
  // Índices
  indiceAtaque: Number,
  indiceDefensa: Number,
  indicePoder: Number
}
```

## 🚀 Uso de la API

### **Crear Partido**
```javascript
POST /api/partidos
{
  "evento": "evento_id",
  "fecha": "2024-01-15",
  "equipoLocal": "equipo_local_id",
  "equipoVisitante": "equipo_visitante_id",
  "estadisticasJugadores": [
    {
      "jugador": "jugador_id",
      "equipo": "equipo_id",
      "setsJugados": 3,
      "tirosTotales": 15,
      "hits": 8,
      "quemados": 6,
      // ... más estadísticas
    }
  ]
}
```

### **Obtener Ranking**
```javascript
GET /api/partidos/ranking/jugadores?limit=20&equipo=equipo_id&posicion=thrower
```

### **Reporte de Jugador**
```javascript
GET /api/partidos/jugador/jugador_id/reporte
```

## 🔧 Configuración

### **Variables de Entorno**
```env
MONGODB_URI=mongodb://localhost:27017/dodgeball
```

### **Dependencias**
- `mongoose`: Para modelos de datos
- `express`: Para API REST
- `cors`: Para CORS
- `helmet`: Para seguridad

## 📝 Notas Importantes

1. **Compatibilidad**: Los datos existentes se mantienen compatibles
2. **Cálculos Automáticos**: Los porcentajes e índices se calculan automáticamente
3. **Validación**: Se incluyen validaciones para evitar datos inconsistentes
4. **Performance**: Se agregaron índices para consultas eficientes

## 🎯 Próximos Pasos

1. **Ejecutar migración**: `node scripts/migrar-estadisticas-avanzadas.js`
2. **Probar API**: Usar endpoints para crear partidos y consultar estadísticas
3. **Integrar Frontend**: Actualizar interfaz para mostrar nuevas estadísticas
4. **Análisis**: Implementar dashboards y reportes avanzados

## 📞 Soporte

Para dudas o problemas con las nuevas funcionalidades, revisar:
- Logs del servidor
- Documentación de la API
- Estructura de la base de datos
- Scripts de migración

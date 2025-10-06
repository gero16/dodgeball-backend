# API de Jugadores y Equipos - Dodgeball

## Descripción
Sistema completo para manejar jugadores que pueden pertenecer a múltiples equipos (selección nacional, cuadros, clubes, etc.) con estadísticas individuales y por equipo.

## Características Principales
- ✅ Un jugador puede pertenecer a múltiples equipos simultáneamente
- ✅ Estadísticas generales (suma de todos los equipos)
- ✅ Estadísticas específicas por equipo
- ✅ Historial completo de partidos
- ✅ Rankings y consultas avanzadas

## Endpoints de la API

### Jugadores

#### Crear Jugador
```http
POST /api/jugadores
Content-Type: application/json

{
  "usuario": "usuario_id",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "1995-05-15",
  "posicion": "thrower",
  "numeroCamiseta": 10
}
```

#### Obtener Jugador
```http
GET /api/jugadores/{id}
```

#### Obtener Todos los Jugadores
```http
GET /api/jugadores?activo=true&posicion=thrower&equipo=equipo_id&limite=20&pagina=1
```

#### Obtener Estadísticas de Jugador
```http
GET /api/jugadores/{id}/estadisticas?equipoId=equipo_id
```

#### Obtener Ranking
```http
GET /api/jugadores/ranking/lista?equipoId=equipo_id&limite=10&posicion=thrower
```

#### Actualizar Estadísticas en Partido
```http
PUT /api/jugadores/{jugadorId}/partido/{partidoId}/equipo/{equipoId}/estadisticas
Content-Type: application/json

{
  "hits": 5,
  "hitsExitosos": 3,
  "catches": 2,
  "catchesExitosos": 1,
  "dodges": 4,
  "dodgesExitosos": 3,
  "bloqueos": 1,
  "bloqueosExitosos": 1,
  "tarjetasAmarillas": 0,
  "tarjetasRojas": 0,
  "eliminaciones": 2,
  "vecesEliminado": 1,
  "minutosJugados": 40,
  "puntos": 8
}
```

#### Agregar Jugador a Equipo
```http
POST /api/jugadores/{jugadorId}/equipos/{equipoId}
Content-Type: application/json

{
  "numeroCamiseta": 10,
  "posicion": "thrower"
}
```

#### Remover Jugador de Equipo
```http
DELETE /api/jugadores/{jugadorId}/equipos/{equipoId}
```

### Equipos

#### Crear Equipo
```http
POST /api/equipos
Content-Type: application/json

{
  "nombre": "Selección Nacional",
  "tipo": "seleccion",
  "pais": "Chile",
  "ciudad": "Santiago",
  "logo": "url_del_logo",
  "colorPrincipal": "#FF0000",
  "colorSecundario": "#FFFFFF"
}
```

#### Obtener Equipo
```http
GET /api/equipos/{id}
```

#### Obtener Todos los Equipos
```http
GET /api/equipos?tipo=seleccion&activo=true&limite=20&pagina=1
```

#### Obtener Jugadores de Equipo
```http
GET /api/equipos/{id}/jugadores?activo=true
```

#### Actualizar Equipo
```http
PUT /api/equipos/{id}
Content-Type: application/json

{
  "nombre": "Nuevo Nombre",
  "colorPrincipal": "#0000FF"
}
```

#### Eliminar Equipo (Desactivar)
```http
DELETE /api/equipos/{id}
```

## Tipos de Equipos
- `seleccion`: Selección nacional
- `cuadro`: Cuadro local/universitario
- `club`: Club deportivo
- `otro`: Otros tipos

## Posiciones de Jugadores
- `thrower`: Lanzador
- `catcher`: Atrapador
- `dodger`: Esquivador
- `versatil`: Versátil

## Ejemplo de Uso Completo

### 1. Crear un jugador
```javascript
const jugador = await fetch('/api/jugadores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario: 'usuario_id',
    nombre: 'Juan',
    apellido: 'Pérez',
    posicion: 'thrower'
  })
});
```

### 2. Crear equipos
```javascript
// Selección nacional
const seleccion = await fetch('/api/equipos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Selección Nacional',
    tipo: 'seleccion',
    pais: 'Chile'
  })
});

// Club local
const club = await fetch('/api/equipos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Club Los Leones',
    tipo: 'club',
    ciudad: 'Santiago'
  })
});
```

### 3. Agregar jugador a equipos
```javascript
// A la selección
await fetch(`/api/jugadores/${jugadorId}/equipos/${seleccionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    numeroCamiseta: 10,
    posicion: 'thrower'
  })
});

// Al club
await fetch(`/api/jugadores/${jugadorId}/equipos/${clubId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    numeroCamiseta: 7,
    posicion: 'versatil'
  })
});
```

### 4. Actualizar estadísticas después de un partido
```javascript
await fetch(`/api/jugadores/${jugadorId}/partido/${partidoId}/equipo/${equipoId}/estadisticas`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hits: 5,
    hitsExitosos: 3,
    catches: 2,
    dodges: 4,
    puntos: 8
  })
});
```

### 5. Consultar estadísticas
```javascript
// Estadísticas generales
const statsGenerales = await fetch(`/api/jugadores/${jugadorId}/estadisticas`);

// Estadísticas en un equipo específico
const statsEquipo = await fetch(`/api/jugadores/${jugadorId}/estadisticas?equipoId=${equipoId}`);

// Ranking de jugadores
const ranking = await fetch('/api/jugadores/ranking/lista?equipoId=equipo_id&limite=10');
```

## Estructura de Datos

### Jugador
```javascript
{
  "_id": "jugador_id",
  "usuario": "usuario_id",
  "nombre": "Juan",
  "apellido": "Pérez",
  "posicion": "thrower",
  "numeroCamiseta": 10,
  "activo": true,
  "estadisticasGenerales": {
    "partidosJugados": 45,
    "hits": 120,
    "hitsExitosos": 80,
    "porcentajeHits": 66.67,
    "catches": 60,
    "catchesExitosos": 40,
    "porcentajeCatches": 66.67,
    "dodges": 100,
    "dodgesExitosos": 70,
    "porcentajeDodges": 70,
    "puntos": 350
  },
  "estadisticasPorEquipo": [
    {
      "equipo": "equipo_id",
      "nombreEquipo": "Selección Nacional",
      "tipoEquipo": "seleccion",
      "temporada": "2024",
      "estadisticas": {
        "partidosJugados": 15,
        "hits": 40,
        "catches": 25,
        "puntos": 120
      }
    }
  ],
  "historialPartidos": [...]
}
```

### Equipo
```javascript
{
  "_id": "equipo_id",
  "nombre": "Selección Nacional",
  "tipo": "seleccion",
  "pais": "Chile",
  "ciudad": "Santiago",
  "logo": "url_del_logo",
  "colorPrincipal": "#FF0000",
  "colorSecundario": "#FFFFFF",
  "jugadores": [
    {
      "jugador": "jugador_id",
      "numeroCamiseta": 10,
      "posicion": "thrower",
      "fechaIngreso": "2024-01-15T00:00:00.000Z",
      "activo": true
    }
  ],
  "estadisticas": {
    "partidosJugados": 20,
    "partidosGanados": 15,
    "puntos": 450
  },
  "activo": true
}
```

## Notas Importantes
- Los porcentajes se calculan automáticamente
- Un jugador puede tener diferentes números de camiseta en diferentes equipos
- Las estadísticas se actualizan tanto generales como por equipo
- El historial de partidos se mantiene para análisis detallado
- Los equipos se pueden desactivar en lugar de eliminar (soft delete)

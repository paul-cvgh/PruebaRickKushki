# GET /character/{id}

Devuelve la información de un personaje de Rick and Morty a partir de su ID.
Úsalo cuando ya conoces el ID del personaje y necesitas sus datos completos.
Para buscar personajes por nombre o estado, usa `GET /character` con filtros.

**URL base:** `https://rickandmortyapi.com/api`
**Autenticación:** no requiere.

## Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
|--------|-----------|------|-------------|-------------|
| `id` | Ruta (path) | Entero | Sí | ID del personaje. Valores válidos: del 1 al 826. |

## Ejemplo de solicitud

```bash
curl https://rickandmortyapi.com/api/character/1
```

## Respuesta exitosa (200)

```json
{
  "id": 1,
  "name": "Rick Sanchez",
  "status": "Alive",
  "species": "Human",
  "type": "",
  "gender": "Male",
  "origin": {
    "name": "Earth (C-137)",
    "url": "https://rickandmortyapi.com/api/location/1"
  },
  "location": {
    "name": "Citadel of Ricks",
    "url": "https://rickandmortyapi.com/api/location/3"
  },
  "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  "episode": [
    "https://rickandmortyapi.com/api/episode/1",
    "https://rickandmortyapi.com/api/episode/2"
  ],
  "url": "https://rickandmortyapi.com/api/character/1",
  "created": "2017-11-04T18:48:46.250Z"
}
```

> El arreglo `episode` está abreviado en este ejemplo; la API devuelve todos los episodios del personaje.

### Campos de la respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Entero | ID del personaje. |
| `name` | Cadena | Nombre del personaje. |
| `status` | Cadena | Estado: `Alive`, `Dead` o `unknown`. |
| `species` | Cadena | Especie del personaje. |
| `type` | Cadena | Tipo o subespecie. Puede ser una cadena vacía (`""`). |
| `gender` | Cadena | Género: `Female`, `Male`, `Genderless` o `unknown`. |
| `origin` | Objeto | Ubicación de origen, con `name` y `url`. |
| `location` | Objeto | Última ubicación conocida, con `name` y `url`. |
| `image` | Cadena (URL) | Imagen del personaje, de 300 × 300 px. |
| `episode` | Arreglo de URL | Episodios en los que aparece el personaje. |
| `url` | Cadena (URL) | URL de este mismo personaje. |
| `created` | Cadena (fecha ISO 8601) | Fecha en que se creó el registro en la base de datos. |

## Errores

### 404 – Personaje no encontrado

Ocurre cuando no existe un personaje con el ID indicado (por ejemplo, `99999`).

```bash
curl https://rickandmortyapi.com/api/character/99999
```

```json
{
  "error": "Character not found"
}
```

**Cómo resolverlo:** usa un ID entre 1 y 826. Si no conoces el ID, consulta la lista con
`GET /character` y elige uno de los resultados.

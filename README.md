# Rick and Morty · Documentación interactiva de `GET /character/{id}`

Página interactiva que documenta y permite probar el endpoint `GET https://rickandmortyapi.com/api/character/{id}`.
Incluye cuadrícula de personajes, vista de detalle, búsqueda por ID, JSON crudo y un resumen generado con IA.

- Documentación escrita del endpoint: [`docs/character-endpoint.md`](docs/character-endpoint.md)

## Cómo ejecutar el proyecto

Requisitos: [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
cp .env.example .env     # opcional: solo si quieres usar la IA real
npm run dev
```

Abre la dirección que muestra la terminal (normalmente `http://localhost:5173`).
Otros comandos: `npm run build` (genera `dist/`) y `npm run preview`.

## Configurar la clave de la IA

Utilice **Groq** como proveedor de IA: ofrece un nivel gratuito y una API compatible con el formato de OpenAI. La URL, el modelo y la clave se configuran por separado, así que puedo cambiar a otro proveedor compatible editando solo `.env`, sin modificar el código.

Crea `.env` en la raíz del proyecto con estas variables:

```dotenv
VITE_AI_API_KEY=ApiKey_aqui
VITE_AI_API_URL=https://api.groq.com/openai/v1/chat/completions
VITE_AI_MODEL=openai/gpt-oss-20b
```

Reinicia `npm run dev` después de cambiar la configuración. Si falta alguna variable, el botón «Generar resumen con IA» muestra una **respuesta simulada** construida con los datos del personaje y la página lo indica. El archivo `.env` está en `.gitignore`; no compartas ni publiques la clave. En CodeSandbox, configura estas mismas variables en **Secrets**.

> **Limitación conocida:** las variables `VITE_*` quedan visibles en el navegador. Es aceptable para una prueba con una clave gratuita, pero en producción la llamada debe pasar por una función serverless (por ejemplo, Netlify Functions) que guarde la clave en el servidor.

## Estructura

```
index.html        Barra de navegación y contenedor principal
src/main.js       Vistas (cuadrícula, detalle) y enrutamiento por hash
src/api.js        Peticiones a la API de Rick and Morty
src/ai.js         Prompt y llamada a la API de IA (o respuesta simulada)
src/style.css     Estilos
docs/             Documentación del endpoint
```

## Decisiones técnicas

### Herramienta: Vite con JavaScript puro

- **Vite** da un servidor de desarrollo rápido, variables de entorno (`.env`) y un `build` listo para Netlify o Vercel, sin configuración.
- **JavaScript puro** porque la página tiene solo dos vistas. Un framework añadiría conceptos (componentes, estado) que no aportan aquí, y el código queda más fácil de leer.
- Separé el código por responsabilidades: `api.js` (red), `ai.js` (IA) y `main.js` (interfaz), para que cada archivo se entienda por separado.
- La navegación usa el hash de la URL (`#/character/1`). Así el botón «Atrás» funciona y cada personaje tiene un enlace compartible.
- El texto que viene de la API se escapa antes de insertarse como HTML, y el JSON y el resumen de la IA se muestran con `textContent`.

### Decisiones de redacción (Parte 1)

- **Orden:** descripción → parámetros → solicitud → respuesta → errores. Sigue el orden de un desarrollador nuevo usa el endpoint: qué hace, qué envío, cómo lo pruebo, qué recibo y qué hago si falla.
- **Tono:** directo y en segunda persona («usa un ID entre 1 y 826»), con frases cortas.
- **Detalle:** el ejemplo `curl` funciona tal como está escrito, y cada campo de la respuesta tiene su tipo y sus valores posibles (por ejemplo, `status`: `Alive`, `Dead` o `unknown`). El error 404 incluye el cuerpo real y la acción para resolverlo.
- **Verificación:** comprobé los campos y los tipos con la documentación oficial y probé las solicitudes con Postman.

## Integración con IA

**Evolución del prompt:** la primera versión pedía un resumen y devolvía texto plano, describia las caracteristicas que arroja el GET. Mejoré dándole un rol de escritor de ciencia ficción, un estilo concreto (gancho inicial, narración y cierre memorable) y reglas explícitas de veracidad. El prompt pide español y un párrafo de 3–4 líneas; limita los hechos a los campos recibidos y prohíbe inventar eventos, familiares, poderes o episodios. También trata los datos nulos o desconocidos con cuidado. Envío los campos relevantes, no la lista completa de episodios, y fijo `temperature: 0.4` para moderar la creatividad.

**Verificación:** contrasté los resúmenes con el JSON mostrado en pantalla, fijándome en nombre, especie, estado y origen.

**Qué haría si la IA inventa información:**
1. Corregir el prompt con especificaciones mas estrictas y bajar la temperatura.
2. Validar por código que el texto mencione el nombre y no contradiga el estado antes de mostrarlo.
3. Mostrar el aviso «Contenido generado por IA», que ya incluye la página, y permitir regenerar.

## Preguntas de criterio

### 1. CI/CD: validaciones antes de publicar

Usaría GitHub Actions con dos momentos:

- **En cada pull request** (bloquean la fusión si fallan):
  - **Validación del spec OpenAPI** con Spectral, para detectar campos mal definidos o sin descripción.
  - **Enlaces rotos** con una herramienta como `lychee`. Esta API enlaza a imágenes, episodios y ubicaciones, así que un enlace caído se vería en los ejemplos.
  - **Ortografía y estilo** con `cspell` o Vale, porque la redacción es parte de la calidad de la documentación.
  - **Build** (`npm run build`) para asegurar que la página compila.
- **Antes de publicar (rama principal):** una prueba que ejecute el `curl` del ejemplo contra la API real y compare los campos de la respuesta con la tabla de la documentación. Así detecto si la API cambió y la documentación quedó inexacta. Esta prueba también puede correr de forma programada (por ejemplo, cada semana).

Lo rápido va en el PR para dar feedback inmediato; lo que depende de un servicio externo va en la rama principal y en la ejecución programada para que un fallo de la API no bloquee cambios no relacionados.

### 3. OpenAPI como fuente de verdad

Mantendría un único archivo `openapi.yaml` y **generaría** la referencia publicada a partir de él (por ejemplo, con Redoc o Swagger UI), en lugar de escribir la documentación a mano en dos sitios. Los ejemplos de respuesta saldrían del mismo spec.

Cuando la API cambia:
1. El cambio en el spec se hace en el mismo pull request que el cambio en la API.
2. El CI valida el spec con Spectral y compara contra la versión anterior con `oasdiff` para detectar cambios que rompen compatibilidad.
3. Una prueba de contrato (por ejemplo, con Schemathesis) llama a la API real y comprueba que sus respuestas cumplen el spec. Si no coinciden, el pipeline falla.

Con esto, un campo nuevo o renombrado en `/character/{id}` se detecta antes de que la documentación mienta.

## Si tuviera más tiempo

- Mover la llamada a la API de IA a una función serverless para no exponer la clave.
- Añadir paginación y filtros (`name`, `status`) en la cuadrícula.
- Escribir el spec `openapi.yaml` y publicarlo con Redoc.
- Pruebas automáticas y el pipeline de GitHub Actions descrito arriba.
- Soporte para el modo oscuro y revisión de accesibilidad con Lighthouse.

import { getCharacters, getCharacterById, NotFoundError } from './api.js';
import { generateSummary } from './ai.js';

const app = document.querySelector('#app');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-id');

// ---------- Utilidades ----------

/** Escapa texto de la API antes de insertarlo como HTML. */
function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

const showLoading = (message) => {
  app.innerHTML = `<p class="status">${message}</p>`;
};

// ---------- Vista: página principal (cuadrícula) ----------

async function renderHome() {
  showLoading('Cargando personajes…');
  try {
    const characters = await getCharacters();
    app.innerHTML = `
      <h1>Personajes</h1>
      <p class="lead">Haz clic en una tarjeta para ver el detalle o busca por ID en la barra superior.</p>
      <div class="grid">
        ${characters
          .map(
            (c) => `
          <a class="card" href="#/character/${c.id}">
            <img src="${c.image}" alt="${escapeHtml(c.name)}" loading="lazy" />
            <h2>${escapeHtml(c.name)}</h2>
          </a>`
          )
          .join('')}
      </div>`;
  } catch {
    app.innerHTML = `<p class="status status--error">No se pudieron cargar los personajes. Revisa tu conexión e intenta de nuevo.</p>`;
  }
}

// ---------- Vista: detalle / "Try it out" ----------

async function renderDetail(id) {
  searchInput.value = id;
  showLoading('Consultando personaje…');

  let character;
  try {
    character = await getCharacterById(id);
  } catch (error) {
    const message =
      error instanceof NotFoundError
        ? 'Personaje no encontrado. Intenta con otro ID.'
        : 'Ocurrió un error al consultar la API. Intenta de nuevo.';
    app.innerHTML = `
      <a class="back" href="#">← Volver</a>
      <p class="status status--error">${message}</p>`;
    return;
  }

  app.innerHTML = `
    <a class="back" href="#">← Volver</a>
    <article class="detail">
      <img src="${character.image}" alt="${escapeHtml(character.name)}" />
      <div>
        <h1>${escapeHtml(character.name)}</h1>
        <dl>
          <dt>Estado</dt><dd>${escapeHtml(character.status)}</dd>
          <dt>Especie</dt><dd>${escapeHtml(character.species)}</dd>
          <dt>Género</dt><dd>${escapeHtml(character.gender)}</dd>
          <dt>Origen</dt><dd>${escapeHtml(character.origin.name)}</dd>
          <dt>Última ubicación</dt><dd>${escapeHtml(character.location.name)}</dd>
          <dt>Episodios</dt><dd>${character.episode.length}</dd>
        </dl>
        <button id="ai-button" type="button">Generar resumen con IA</button>
      </div>
    </article>

    <section id="ai-result" aria-live="polite"></section>

    <section>
      <h2>Respuesta JSON</h2>
      <p class="lead"><code>GET /character/${character.id}</code></p>
      <pre></pre>
    </section>`;

  // textContent evita interpretar el JSON como HTML.
  app.querySelector('pre').textContent = JSON.stringify(character, null, 2);
  app.querySelector('#ai-button').addEventListener('click', (event) => handleSummary(character, event.target));
}

async function handleSummary(character, button) {
  const result = app.querySelector('#ai-result');
  button.disabled = true;
  result.innerHTML = `<p class="status">Generando resumen…</p>`;

  try {
    const { text, simulated } = await generateSummary(character);
    result.innerHTML = `
      <div class="summary">
        <h2>Resumen con IA</h2>
        <p class="summary__text"></p>
        <small>${
          simulated
            ? 'Respuesta simulada (no hay clave de API configurada).'
            : 'Contenido generado por IA. Puede contener errores: compáralo con los datos de arriba.'
        }</small>
      </div>`;
    result.querySelector('.summary__text').textContent = text;
  } catch {
    result.innerHTML = `<p class="status status--error">No se pudo generar el resumen. Intenta de nuevo.</p>`;
  } finally {
    button.disabled = false;
  }
}

// ---------- Enrutamiento simple con el hash de la URL ----------

function router() {
  const match = location.hash.match(/^#\/character\/(\d+)$/);
  if (match) renderDetail(match[1]);
  else renderHome();
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = searchInput.value.trim();
  if (id) location.hash = `#/character/${id}`;
});

document.querySelector('#home-link').addEventListener('click', () => {
  searchInput.value = '';
});

window.addEventListener('hashchange', router);
router();

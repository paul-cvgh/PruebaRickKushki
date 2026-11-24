// Capa de acceso a la API de Rick and Morty.
// Todas las peticiones pasan por aquí, así main.js no sabe nada de fetch.

const BASE_URL = 'https://rickandmortyapi.com/api';

/** Error propio para distinguir un 404 de otros fallos. */
export class NotFoundError extends Error {}

/** Devuelve los primeros personajes (la API entrega 20 por página). */
export async function getCharacters(page = 1) {
  const response = await fetch(`${BASE_URL}/character?page=${page}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  const data = await response.json();
  return data.results;
}

/** Devuelve un personaje por ID. Lanza NotFoundError si no existe (404). */
export async function getCharacterById(id) {
  const response = await fetch(`${BASE_URL}/character/${id}`);
  if (response.status === 404) throw new NotFoundError();
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}

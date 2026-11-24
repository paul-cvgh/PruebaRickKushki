// Integración con IA generativa mediante una API compatible con OpenAI
// (Groq, OpenRouter, DeepSeek, etc.). Se configura desde el archivo .env.
// Si no hay clave, se devuelve un resumen simulado para poder probar la interfaz.

const API_KEY = import.meta.env.VITE_AI_API_KEY;
const API_URL = import.meta.env.VITE_AI_API_URL;
const MODEL = import.meta.env.VITE_AI_MODEL;

/** Construye el prompt. Da libertad creativa en el estilo, pero los hechos salen solo de los datos. */
export function buildPrompt(character) {
  const { name, status, species, type, gender, origin, location, episode } = character;
  const data = {
    nombre: name,
    estado: status,
    especie: species,
    subtipo: type || null,
    genero: gender,
    origen: origin.name,
    ultima_ubicacion: location.name,
    episodios_en_los_que_aparece: episode.length,
  };

  return `Eres un escritor de ciencia ficción con humor ácido, al estilo de la serie Rick and Morty.
Escribe en español UN párrafo de 3 a 4 líneas que presente a este personaje a un fan, como si fuera la reseña de un archivo secreto del multiverso.

Estilo:
- Empieza con una frase que atrape (una imagen o una ironía), no con "X es un...".
- Integra los datos dentro de la narración. Nunca los enumeres como una ficha.
- Usa un tono ingenioso y con un toque de humor oscuro, sin exagerar.
- Cierra con una frase memorable.

Reglas de veracidad (obligatorias):
- Los HECHOS salen solo de los datos: nombre, estado, especie, origen, ubicación y número de episodios.
- Puedes usar metáforas y ambiente, pero NO inventes eventos, familiares, poderes, frases del personaje ni episodios concretos.
- Si el estado es "Dead", no digas que sigue vivo; si es "unknown", déjalo como un misterio.
- Si un dato es null o "unknown", no lo menciones o úsalo como misterio.

Datos del personaje:
${JSON.stringify(data)}`;
}


export async function generateSummary(character) {
  if (!API_KEY || !API_URL || !MODEL) return { text: simulatedSummary(character), simulated: true };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: buildPrompt(character) }],
      temperature: 0.4, 
    }),
  });
  if (!response.ok) throw new Error(`Error ${response.status} de la API de IA`);

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('La IA no devolvió texto');
  return { text: text.trim(), simulated: false };
}


function simulatedSummary({ name, species, status, origin }) {
  const estados = { Alive: 'sigue con vida', Dead: 'ya no está entre los vivos', unknown: 'tiene un destino incierto' };
  return `${name} es un ${species} que ${estados[status] ?? 'tiene un destino incierto'} y que llegó al multiverso desde ${origin.name}. Su paso por la galaxia no pasa desapercibido para los fans de la ciencia ficción.`;
}
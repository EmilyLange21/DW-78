// Forma de las respuestas de la API (PRD: "Cómo va a venir la información").

export interface Meta {
  total: number;
  pagina: number;
  porPagina: number;
}

/** Éxito. Un recurso solo trae `meta: null`; una lista trae la paginación. */
export interface Respuesta<T> {
  datos: T;
  meta: Meta | null;
}

/** Cuerpo de un error de la API. */
export interface CuerpoDeError {
  error: { codigo: string; mensaje: string };
}

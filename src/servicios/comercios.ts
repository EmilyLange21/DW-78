import type { Comercio, Respuesta, Rubro } from "../tipos";
import { api } from "./api";

export type FiltrosComercios = {
  rubroId?: string;
  /** Busca en nombre y descripción, sin tildes ni mayúsculas. */
  q?: string;
  latitud?: number;
  longitud?: number;
  radioMetros?: number;
  orden?: "nombre" | "distancia" | "puntaje";
  pagina?: number;
  /** Hasta 1000: el listado completo se guarda en el teléfono. */
  porPagina?: number;
};

export function listarComercios(filtros: FiltrosComercios = {}): Promise<Respuesta<Comercio[]>> {
  return api.get<Comercio[]>("/comercios", { params: filtros });
}

export async function obtenerComercio(id: string): Promise<Comercio> {
  return (await api.get<Comercio>(`/comercios/${encodeURIComponent(id)}`)).datos;
}

export async function listarRubros(): Promise<Rubro[]> {
  return (await api.get<Rubro[]>("/rubros")).datos;
}

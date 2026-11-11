import type { Promocion, Respuesta, UsoDePromocion } from "../tipos";
import { api } from "./api";

export type EstadoPromos = "vigentes" | "proximas" | "por-vencer";

export type FiltrosPromociones = {
    estado?: EstadoPromos;
    rubroId?: string;
    comercioId?: string;
    pagina?: number;
    porPagina?: number;
};

export function listarPromociones(
    filtros: FiltrosPromociones = {},
): Promise<Respuesta<Promocion[]>> {
    return api.get<Promocion[]>("/promociones", { params: filtros });
}

export async function obtenerPromocion(id: string): Promise<Promocion> {
    return (await api.get<Promocion>(`/promociones/${encodeURIComponent(id)}`)).datos;
}

export async function generarCodigo(promocionId: string): Promise<UsoDePromocion> {
    return (
        await api.post<UsoDePromocion>(`/promociones/${encodeURIComponent(promocionId)}/usos`)
    ).datos;
}

export function listarMisUsos(): Promise<Respuesta<UsoDePromocion[]>> {
    return api.get<UsoDePromocion[]>("/yo/usos");
}

export async function validarCodigo(codigo: string): Promise<UsoDePromocion> {
    return (await api.post<UsoDePromocion>("/mi-comercio/usos/validar", { codigo })).datos;
}
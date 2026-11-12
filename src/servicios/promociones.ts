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

export type DatosPromocion = {
    titulo: string;
    detalle: string;
    descuento?: number | null;
    desde?: string;
    hasta: string;
    soloApp?: boolean;
};

export function listarMisPromociones(pagina = 1): Promise<Respuesta<Promocion[]>> {
    return api.get<Promocion[]>("/mi-comercio/promociones", {
        params: {pagina, porPagina: 20 },
    });
}

export async function crearPromocion(datos: DatosPromocion): Promise<Promocion> {
    return (await api.post<Promocion>("/mi-comercio/promociones", datos)).datos;
}

export async function editarPromocion(
    id: string,
    datos: Partial<DatosPromocion>,
): Promise<Promocion> {
    return (
        await api.patch<Promocion>(`/mi-comercio/promociones/${encodeURIComponent(id)}`, datos)
    ).datos;
}

export async function darDeBajaPromocion(id: string): Promise<void> {
    await api.delete(`/mi-comercio/promociones/${encodeURIComponent(id)}`);
}


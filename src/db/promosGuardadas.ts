import type { SQLiteDatabase } from "expo-sqlite";
import type { Promocion } from "../tipos";

// reemplazar por el id del usuario de la sesión (parte de Axel)
export const USUARIO_PROVISORIO = "local";

export type PromoGuardada = {
    usuario_id: string;
    id: string;
    comercio_id: string;
    titulo: string;
    descuento: number | null;
    hasta: string;
    guardada_en: string;
};

export async function guardarPromo(db: SQLiteDatabase, usuarioId: string, promo: Promocion) {
    await db.runAsync(
        `INSERT OR REPLACE INTO promos_guardadas
            (usuario_id, id, comercio_id, titulo, descuento, hasta, guardada_en)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            usuarioId,
            promo.id,
            promo.comercioId,
            promo.titulo,
            promo.descuento,
            promo.hasta,
            new Date().toISOString(),
        ],
    );
}

export async function quitarPromo(db: SQLiteDatabase, usuarioId: string, promoId: string) {
    await db.runAsync("DELETE FROM promos_guardadas WHERE usuario_id = ? AND id = ?", [
        usuarioId,
        promoId,
    ]);
}

export async function estaGuardada(
    db: SQLiteDatabase,
    usuarioId: string,
    promoId: string,
): Promise<boolean> {
    const fila = await db.getFirstAsync<{ ok: number }>(
        "SELECT 1 AS ok FROM promos_guardadas WHERE usuario_id = ? AND id = ?",
        [usuarioId, promoId],
    );
    return fila !== null;
}

export function listarGuardadas(db: SQLiteDatabase, usuarioId: string): Promise<PromoGuardada[]> {
    return db.getAllAsync<PromoGuardada>(
        "SELECT * FROM promos_guardadas WHERE usuario_id = ? ORDER BY hasta ASC",
        [usuarioId],
    );
}


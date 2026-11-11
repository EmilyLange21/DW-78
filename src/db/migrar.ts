import type { SQLiteDatabase } from "expo-sqlite";

const VERSION = 1;

export async function migrar(db: SQLiteDatabase) {
    const fila = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version")
    let actual = fila?.user_version ?? 0;
    if (actual >= VERSION) return;

    if (actual === 0) {
        await db.execAsync(`
            PRAGMA journal_mode = 'wal';
            CREATE TABLE promos_guardadas (
                usuario_id TEXT NOT NULL,
                id TEXT NOT NULL,
                comercio_id TEXT NOT NULL,
                titulo TEXT NOT NULL,
                descuento INTEGER,
                hasta TEXT NOT NULL,
                guardada_en TEXT NOT NULL,
                PRIMARY KEY (usuario_id, id)
            );
        `);
        actual = 1;
    }

    // para agregar otra tabla subir VERSION a 2 y agregar acá un if (actual === 1) {...; actual = 2; }

    await db.execAsync(`PRAGMA user_version = ${VERSION}`);
}
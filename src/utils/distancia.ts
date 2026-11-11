import type { Coordenadas } from "../tipos";

const RADIO_TIERRA_M = 6_371_000;
const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** Distancia en línea recta entre dos puntos, en metros (fórmula de Haversine). */
export function distanciaEntre(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRadianes(b.latitud - a.latitud);
  const dLon = aRadianes(b.longitud - a.longitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.latitud)) * Math.cos(aRadianes(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(h));
}

/** 300 m, 1,2 km, 15 km. Redondea a 10 m para que no parezca más preciso de lo que es. */
export function formatearDistancia(metros: number): string {
  const redondeado = Math.max(10, Math.round(metros / 10) * 10);
  if (redondeado < 1000) return `${redondeado} m`;
  const km = Math.round(metros / 100) / 10; // un decimal
  return km < 10 ? `${km.toFixed(1).replace(".", ",")} km` : `${Math.round(km)} km`;
}

export type ConDistancia<T> = T & { distanciaM: number | null };

/** Suma `distanciaM` a cada elemento. Sin ubicación del usuario queda en null. */
export function agregarDistancia<T extends { coordenadas: Coordenadas }>(
  items: T[],
  desde: Coordenadas | null,
): ConDistancia<T>[] {
  return items.map((item) => ({
    ...item,
    distanciaM: desde ? distanciaEntre(desde, item.coordenadas) : null,
  }));
}

/** De más cerca a más lejos. Los que no tienen distancia van al final. No modifica el original. */
export function ordenarPorDistancia<T extends { distanciaM: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.distanciaM === null && b.distanciaM === null) return 0;
    if (a.distanciaM === null) return 1;
    if (b.distanciaM === null) return -1;
    return a.distanciaM - b.distanciaM;
  });
}

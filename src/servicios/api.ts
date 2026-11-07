import { API_URL } from "../config";
import type { CuerpoDeError, Respuesta } from "../tipos";

/**
 * Error de la API o de la red. `codigo` es estable (decide qué hace la app);
 * `message` se puede mostrar tal cual en pantalla.
 *
 * Códigos propios del cliente: SIN_CONEXION y TIEMPO_AGOTADO (status 0).
 */
export class ErrorApi extends Error {
  codigo: string;
  status: number;

  constructor(codigo: string, mensaje: string, status: number) {
    super(mensaje);
    this.name = "ErrorApi";
    this.codigo = codigo;
    this.status = status;
  }
}

type Valor = string | number | boolean | null | undefined;
export type Params = Record<string, Valor>;

export interface Opciones {
  params?: Params;
  cuerpo?: unknown;
  /** Cabecera X-Simular de la API: "error-500" o "demora-3000". */
  simular?: string;
  timeoutMs?: number;
}

// La API gratis de Render tarda ~1 minuto en despertar: no bajar mucho este valor.
const TIMEOUT_POR_DEFECTO_MS = 30_000;

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

let obtenerToken: () => Promise<string | null> = async () => null;

/**
 * Quien haga el ingreso conecta acá el token guardado en expo-secure-store:
 *   configurarProveedorToken(() => SecureStore.getItemAsync("token"));
 */
export function configurarProveedorToken(fn: () => Promise<string | null>) {
  obtenerToken = fn;
}

function armarUrl(ruta: string, params?: Params): string {
  const base = `${API_URL}${ruta}`;
  if (!params) return base;
  const partes = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return partes.length > 0 ? `${base}?${partes.join("&")}` : base;
}

async function pedir<T>(metodo: Metodo, ruta: string, op: Opciones = {}): Promise<Respuesta<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = await obtenerToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (op.cuerpo !== undefined) headers["Content-Type"] = "application/json";
  if (op.simular) headers["X-Simular"] = op.simular;

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), op.timeoutMs ?? TIMEOUT_POR_DEFECTO_MS);

  let res: Response;
  try {
    res = await fetch(armarUrl(ruta, op.params), {
      method: metodo,
      headers,
      body: op.cuerpo !== undefined ? JSON.stringify(op.cuerpo) : undefined,
      signal: controlador.signal,
    });
  } catch {
    if (controlador.signal.aborted) {
      throw new ErrorApi("TIEMPO_AGOTADO", "El servidor tardó demasiado en responder. Probá de nuevo.", 0);
    }
    throw new ErrorApi("SIN_CONEXION", "No pudimos conectarnos. Revisá tu conexión a internet.", 0);
  } finally {
    clearTimeout(temporizador);
  }

  // DELETE exitoso: 204 sin cuerpo.
  if (res.status === 204) return { datos: null as T, meta: null };

  let cuerpo: unknown = null;
  try {
    cuerpo = await res.json();
  } catch {
    // Respuesta que no es JSON (por ejemplo un 502 del hosting).
  }

  if (!res.ok) {
    const error = (cuerpo as CuerpoDeError | null)?.error;
    throw new ErrorApi(
      error?.codigo ?? "ERROR_INTERNO",
      error?.mensaje ?? "Algo salió mal de nuestro lado. Probá de nuevo en un rato.",
      res.status,
    );
  }

  const ok = cuerpo as Respuesta<T> | null;
  return { datos: ok?.datos as T, meta: ok?.meta ?? null };
}

export const api = {
  get: <T>(ruta: string, op?: Opciones) => pedir<T>("GET", ruta, op),
  post: <T>(ruta: string, cuerpo?: unknown, op?: Opciones) => pedir<T>("POST", ruta, { ...op, cuerpo }),
  put: <T>(ruta: string, cuerpo?: unknown, op?: Opciones) => pedir<T>("PUT", ruta, { ...op, cuerpo }),
  patch: <T>(ruta: string, cuerpo?: unknown, op?: Opciones) => pedir<T>("PATCH", ruta, { ...op, cuerpo }),
  delete: (ruta: string, op?: Opciones) => pedir<null>("DELETE", ruta, op),
};

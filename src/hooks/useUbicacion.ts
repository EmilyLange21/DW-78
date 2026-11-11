import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import type { Coordenadas } from "../tipos";

export type EstadoUbicacion =
  | "cargando"
  | "sin-preguntar" // nunca se le preguntó (undetermined): hay que explicar y pedir
  | "lista" // hay coordenadas
  | "denegado" // dijo que no, pero se le puede volver a preguntar
  | "bloqueado" // canAskAgain = false: solo se arregla desde los ajustes del teléfono
  | "apagada" // el GPS / los servicios de ubicación están apagados
  | "sin-lectura"; // permiso ok, pero no se pudo obtener la posición

// Compartida entre pantallas: si el listado ya ubicó al usuario, el mapa arranca con ese dato.
let ultimaConocida: Coordenadas | null = null;

function aCoordenadas(p: Location.LocationObject): Coordenadas {
  return { latitud: p.coords.latitude, longitud: p.coords.longitude };
}

/**
 * Ubicación del usuario (solo permiso "mientras uso la app").
 *
 * Al abrir NO muestra el cartel del sistema: solo consulta el estado
 * (getForegroundPermissionsAsync). Si nunca se preguntó, `estado` queda en "sin-preguntar"
 * y la pantalla explica para qué se usa y llama a `pedirPermiso()` desde un botón.
 *
 * Sin permiso la app sigue funcionando: `coordenadas` queda en null.
 */
export function useUbicacion() {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(ultimaConocida);
  const [estado, setEstado] = useState<EstadoUbicacion>(ultimaConocida ? "lista" : "cargando");
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const publicar = useCallback((posicion: Location.LocationObject) => {
    ultimaConocida = aCoordenadas(posicion);
    if (!montado.current) return;
    setCoordenadas(ultimaConocida);
    setEstado("lista");
  }, []);

  const ubicar = useCallback(async () => {
    try {
      if (!(await Location.hasServicesEnabledAsync())) {
        if (montado.current) setEstado("apagada");
        return;
      }
      const vieja = await Location.getLastKnownPositionAsync(); // rápida, puede ser vieja
      if (vieja) publicar(vieja);
      const actual = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // precisa, tarda
      });
      publicar(actual);
    } catch {
      // Si ya teníamos una lectura, la dejamos; si no, avisamos.
      if (montado.current && !ultimaConocida) setEstado("sin-lectura");
    }
  }, [publicar]);

  const procesar = useCallback(
    async (permiso: Location.LocationPermissionResponse) => {
      if (permiso.granted) {
        await ubicar();
        return;
      }
      // Sin permiso (o revocado desde los ajustes): no quedan distancias viejas dando vueltas.
      ultimaConocida = null;
      if (!montado.current) return;
      setCoordenadas(null);
      if (permiso.status === Location.PermissionStatus.UNDETERMINED) setEstado("sin-preguntar");
      else setEstado(permiso.canAskAgain ? "denegado" : "bloqueado");
    },
    [ubicar],
  );

  /** Consulta el estado SIN mostrar el cartel del sistema. */
  const reintentar = useCallback(async () => {
    await procesar(await Location.getForegroundPermissionsAsync());
  }, [procesar]);

  /** Muestra el cartel del sistema. Llamarlo solo desde un botón, después de explicar para qué. */
  const pedirPermiso = useCallback(async () => {
    await procesar(await Location.requestForegroundPermissionsAsync());
  }, [procesar]);

  useEffect(() => {
    reintentar();
  }, [reintentar]);

  // Si el usuario fue a los ajustes a activar el permiso o el GPS, al volver reconsultamos.
  useEffect(() => {
    const suscripcion = AppState.addEventListener("change", (nuevo) => {
      if (nuevo === "active") reintentar();
    });
    return () => suscripcion.remove();
  }, [reintentar]);

  return { coordenadas, estado, pedirPermiso, reintentar };
}

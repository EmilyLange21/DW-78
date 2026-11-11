import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useUbicacion, type EstadoUbicacion } from "../../src/hooks/useUbicacion";
import { listarComercios, listarRubros } from "../../src/servicios/comercios";
import type { Comercio, Rubro } from "../../src/tipos";
import { distanciaEntre, formatearDistancia } from "../../src/utils/distancia";

// Centro de Concepción del Uruguay (zona de 9 de Julio).
const CENTRO = { latitud: -32.4825, longitud: -58.2372 };
const RADIO_CIUDAD_M = 20_000;

// Mensajes propios de la app: explican para qué se usa la ubicación ANTES del cartel del sistema.
// El mapa sigue mostrando todos los comercios en cualquiera de estos estados.
const AVISOS: Partial<Record<EstadoUbicacion, { texto: string; boton: string }>> = {
  "sin-preguntar": {
    texto: "Usamos tu ubicación, solo mientras tenés la app abierta, para mostrarte qué comercios tenés cerca.",
    boton: "Usar mi ubicación",
  },
  denegado: {
    texto: "No tenemos acceso a tu ubicación. Podés seguir explorando el mapa o permitirlo para ver qué tenés cerca.",
    boton: "Permitir",
  },
  bloqueado: {
    texto: "El acceso a la ubicación está bloqueado. Para activarlo, andá a los ajustes del teléfono.",
    boton: "Abrir ajustes",
  },
  apagada: { texto: "Tenés la ubicación del teléfono apagada. Activala para ver qué tenés cerca.", boton: "Reintentar" },
  "sin-lectura": { texto: "No pudimos obtener tu ubicación.", boton: "Reintentar" },
};

export default function Mapa() {
  const { coordenadas, estado, pedirPermiso, reintentar } = useUbicacion();
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [rubroId, setRubroId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapa = useRef<MapView>(null);
  const yaCentrado = useRef(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [lista, rubrosApi] = await Promise.all([listarComercios({ porPagina: 1000 }), listarRubros()]);
      setComercios(lista.datos);
      setRubros(rubrosApi);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos cargar los comercios.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Centra el mapa en la persona, solo una vez y solo si está en la ciudad.
  // (Probando desde otra ciudad, el mapa se queda en el centro de Concepción.)
  useEffect(() => {
    if (!coordenadas || yaCentrado.current) return;
    if (distanciaEntre(coordenadas, CENTRO) > RADIO_CIUDAD_M) return;
    yaCentrado.current = true;
    mapa.current?.animateToRegion(
      { latitude: coordenadas.latitud, longitude: coordenadas.longitud, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      500,
    );
  }, [coordenadas]);

  const colorDeRubro = new Map(rubros.map((r) => [r.id, r.color]));
  const visibles = rubroId ? comercios.filter((c) => c.rubroId === rubroId) : comercios;
  const aviso = AVISOS[estado];

  function accionDelAviso() {
    if (estado === "bloqueado") Linking.openSettings();
    else if (estado === "sin-preguntar" || estado === "denegado") pedirPermiso();
    else reintentar();
  }

  return (
    <View style={estilos.contenedor}>
      <MapView
        ref={mapa}
        style={estilos.mapa}
        initialRegion={{
          latitude: CENTRO.latitud,
          longitude: CENTRO.longitud,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={estado === "lista"}
        showsMyLocationButton
        mapPadding={{ top: 56, right: 0, bottom: 0, left: 0 }}
      >
        {visibles.map((c) => {
          const distancia = coordenadas ? formatearDistancia(distanciaEntre(coordenadas, c.coordenadas)) : null;
          return (
            <Marker
              key={c.id}
              coordinate={{ latitude: c.coordenadas.latitud, longitude: c.coordenadas.longitud }}
              title={c.nombre}
              description={distancia ? `${c.direccion} (a ${distancia})` : c.direccion}
              pinColor={colorDeRubro.get(c.rubroId)}
              // TODO: cuando exista la ficha (Parte 1), onCalloutPress → router.push a la ficha de c.id
            />
          );
        })}
      </MapView>

      {rubros.length > 0 && (
        <View style={estilos.filtros}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtrosLista}>
            <Chip texto="Todos" activo={rubroId === null} alPresionar={() => setRubroId(null)} />
            {rubros.map((r) => (
              <Chip key={r.id} texto={r.nombre} activo={rubroId === r.id} alPresionar={() => setRubroId(r.id)} />
            ))}
          </ScrollView>
        </View>
      )}

      {cargando && (
        <View style={estilos.cargando} pointerEvents="none">
          <ActivityIndicator size="large" />
        </View>
      )}

      <View style={estilos.avisos} pointerEvents="box-none">
        {error && (
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>{error}</Text>
            <Pressable onPress={cargar} style={estilos.avisoBoton}>
              <Text style={estilos.avisoBotonTexto}>Reintentar</Text>
            </Pressable>
          </View>
        )}

        {!error && !cargando && visibles.length === 0 && (
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>No hay comercios en este rubro.</Text>
          </View>
        )}

        {aviso && (
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>{aviso.texto}</Text>
            <Pressable onPress={accionDelAviso} style={estilos.avisoBoton}>
              <Text style={estilos.avisoBotonTexto}>{aviso.boton}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function Chip({ texto, activo, alPresionar }: { texto: string; activo: boolean; alPresionar: () => void }) {
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={[estilos.chip, activo && estilos.chipActivo]}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
  mapa: { flex: 1 },
  filtros: { position: "absolute", top: 8, left: 0, right: 0 },
  filtrosLista: { paddingHorizontal: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd2d9",
  },
  chipActivo: { backgroundColor: "#0b5c8a", borderColor: "#0b5c8a" },
  chipTexto: { fontSize: 14, color: "#1f2933" },
  chipTextoActivo: { color: "#fff", fontWeight: "600" },
  cargando: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  avisos: { position: "absolute", left: 12, right: 12, bottom: 12, gap: 8 },
  aviso: {
    padding: 12,
    gap: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd2d9",
  },
  avisoTexto: { fontSize: 14, color: "#1f2933" },
  avisoBoton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#0b5c8a",
  },
  avisoBotonTexto: { color: "#fff", fontWeight: "600" },
});

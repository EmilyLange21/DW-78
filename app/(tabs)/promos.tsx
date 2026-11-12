import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import { listarRubros } from "../../src/servicios/comercios";
import { listarPromociones, type EstadoPromos } from "../../src/servicios/promociones";
import type { Promocion, Rubro } from "../../src/tipos";

const OPCIONES_ESTADO: { valor: EstadoPromos; etiqueta: string }[] = [
  { valor: "vigentes", etiqueta: "Vigentes" },
  { valor: "proximas", etiqueta: "Próximas" },
  { valor: "por-vencer", etiqueta: "Por vencer" },
];

function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[estilos.chip, activo && estilos.chipActivo]}>
      <Text style={[estilos.textoChip, activo && estilos.textoChipActivo]}>{texto}</Text>
    </Pressable>
  );
}

export default function PantallaPromos() {
  const esComercio = true; // reemplazar por el rol de la sesión (parte de Axel)
  const [estado, setEstado] = useState<EstadoPromos>("vigentes");
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [rubroId, setRubroId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await listarPromociones({ estado, rubroId: rubroId ?? undefined });
      setPromos(respuesta.datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  }, [estado, rubroId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    listarRubros()
      .then(setRubros)
      .catch(() => setRubros([]));
  }, []);

  return (
    <View style={estilos.pantalla}>
      {esComercio && (                                                        
        <Pressable style={estilos.botonComercio} onPress={() => router.push("/validar")}>
          <Text style={estilos.textoBoton}>Escanear código de cliente</Text>
        </Pressable>
      )}

      {esComercio && (
        <Pressable style={estilos.botonComercio} onPress={() => router.push("/mis-promos")}>
          <Text style={estilos.textoBoton}>Administrar mis promociones</Text>
        </Pressable>
      )}

      <Pressable style={estilos.botonGuardadas} onPress={() => router.push("/guardadas")}>
        <Text style={estilos.textoGuardadas}>Mis promociones guardadas</Text>
      </Pressable>

      <View style={estilos.filtros}>
        {OPCIONES_ESTADO.map((opcion) => (
          <Chip
            key={opcion.valor}
            texto={opcion.etiqueta}
            activo={estado === opcion.valor}
            onPress={() => setEstado(opcion.valor)}
          />
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={estilos.filaRubros}
        contentContainerStyle={estilos.filtros}
      >
        <Chip texto="Todos" activo={rubroId === null} onPress={() => setRubroId(null)} />
        {rubros.map((rubro) => (
          <Chip
            key={rubro.id}
            texto={rubro.nombre}
            activo={rubroId === rubro.id}
            onPress={() => setRubroId(rubro.id)}
          />
        ))}
      </ScrollView>

      {cargando && (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text style={estilos.mensaje}>Cargando promociones...</Text>
        </View>
      )}

      {!cargando && error && (
        <View style={estilos.centro}>
          <Text style={estilos.mensaje}>{error}</Text>
          <Pressable style={estilos.boton} onPress={cargar}>
            <Text style={estilos.textoBoton}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {!cargando && !error && (
        <FlatList
          data={promos}
          keyExtractor={(promo) => promo.id}
          contentContainerStyle={estilos.lista}
          ListEmptyComponent={
            <Text style={estilos.mensaje}>No hay promociones en esta categoría por ahora.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={estilos.tarjeta}
              onPress={() => router.push({ pathname: "/promocion/[id]", params: { id: item.id } })}
            >
              <Text style={estilos.titulo}>{item.titulo}</Text>
              {item.descuento !== null && (
                <Text style={estilos.descuento}>{item.descuento}% OFF</Text>
              )}
              <Text numberOfLines={2}>{item.detalle}</Text>
              <Text style={estilos.fecha}>
                {estado === "proximas"
                  ? `Desde el ${new Date(item.desde).toLocaleDateString("es-AR")}`
                  : `Hasta el ${new Date(item.hasta).toLocaleDateString("es-AR")}`}
              </Text>
              {item.soloApp && <Text style={estilos.exclusiva}>Exclusiva de la app</Text>}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  filtros: { flexDirection: "row", gap: 8, padding: 12 },
  filaRubros: { flexGrow: 0, flexShrink: 0 },
  botonComercio: { marginHorizontal: 12, marginTop: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: "#05a342", alignItems: "center"},
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#8885" },
  chipActivo: { backgroundColor: "#2f95dc", borderColor: "#2f95dc" },
  textoChip: { fontSize: 14 },
  textoChipActivo: { color: "#fff", fontWeight: "600" },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  mensaje: { fontSize: 16, textAlign: "center", marginTop: 12 },
  boton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#2f95dc" },
  textoBoton: { color: "#fff", fontWeight: "600" },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 4 },
  titulo: { fontSize: 17, fontWeight: "700" },
  descuento: { fontSize: 15, fontWeight: "600", color: "#05931a" },
  fecha: { fontSize: 13, opacity: 0.7 },
  exclusiva: { fontSize: 13, fontWeight: "600", color: "#d86705" },
  botonGuardadas: {marginHorizontal: 12, marginTop: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#2f95dc", alignItems: "center"},
  textoGuardadas: { color: "#2f95dc", fontWeight: "600" },
});


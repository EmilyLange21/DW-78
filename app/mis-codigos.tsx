import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet} from "react-native";
import { Text, View } from "../components/Themed";
import { listarMisUsos } from "../src/servicios/promociones";
import type { UsoDePromocion } from "../src/tipos";

export default function MisCodigos() {
    const [usos, setUsos] = useState<UsoDePromocion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await listarMisUsos();
            setUsos(respuesta.datos);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
        } finally {
            setCargando(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            cargar();
        }, [cargar]),
    );

    return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: "Mis códigos" }} />

      {cargando && (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text style={estilos.mensaje}>Cargando tus códigos...</Text>
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
          data={usos}
          keyExtractor={(uso) => uso.id}
          contentContainerStyle={estilos.lista}
          ListEmptyComponent={
            <Text style={estilos.mensaje}>
              Todavía no obtuviste ningún código. Entrá a una promoción y tocá "Obtener mi código".
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={estilos.tarjeta}
              onPress={() =>
                router.push({ pathname: "/promocion/[id]", params: { id: item.promocionId } })
              }
            >
              <Text style={estilos.codigo}>{item.codigo}</Text>
              {item.validadoEn ? (
                <Text style={estilos.usado}>
                  Usado el {new Date(item.validadoEn).toLocaleString("es-AR")}
                </Text>
              ) : (
                <Text style={estilos.sinUsar}>Sin usar: tocá para ver la promoción y su QR</Text>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  mensaje: { fontSize: 16, textAlign: "center", marginTop: 12 },
  boton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#2f95dc" },
  textoBoton: { color: "#fff", fontWeight: "600" },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 4 },
  codigo: { fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  usado: { fontSize: 13, opacity: 0.7 },
  sinUsar: { fontSize: 13, fontWeight: "600", color: "#16a34a" },
});


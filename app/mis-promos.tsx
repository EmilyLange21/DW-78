import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { darDeBajaPromocion, listarMisPromociones } from "../src/servicios/promociones";
import type { Promocion } from "../src/tipos";

function estadoDe(promo: Promocion): { texto: string; color: string } {
    const ahora = new Date();
    if (!promo.activa) return { texto: "Dado de baja", color: "#6b7280" };
    if (new Date(promo.hasta) < ahora) return { texto: "Vencida", color: "#dc2626" };
    if (new Date(promo.desde) > ahora) return { texto: "Próxima", color: "#d97706"};
    return { texto: "Vigente", color: "#16a34a"}
}

export default function MisPromos() {
    const [promos, setPromos] = useState<Promocion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        
        try {
            const respuesta = await listarMisPromociones();
            setPromos(respuesta.datos);
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

    function confirmarBaja(promo: Promocion) {
        Alert.alert(
            "Dar de baja",
            `¿Querés dar de baja "${promo.titulo}"? Dejará de verse para los vecinos, pero se conservan sus usos.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Dar de baja",
                    style: "destructive",
                    onPress: async () => {
                        setErrorAccion(null);
                        try {
                            await darDeBajaPromocion(promo.id);
                            await cargar();
                        } catch (e) {
                            setErrorAccion(
                                e instanceof Error ? e.message : "No pudimos dar de baja la promoción.",
                            );
                        }
                    },
                },
            ],
        );
    }

    return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: "Mis promociones" }} />

      <Pressable style={estilos.botonNueva} onPress={() => router.push("/promo-form")}>
        <Text style={estilos.textoBoton}>Nueva promoción</Text>
      </Pressable>
      {errorAccion && <Text style={estilos.errorAccion}>{errorAccion}</Text>}

      {cargando && (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text style={estilos.mensaje}>Cargando tus promociones...</Text>
        </View>
      )}

      {!cargando && error && (
        <View style={estilos.centro}>
          <Text style={estilos.mensaje}>{error}</Text>
          <Pressable style={estilos.botonNueva} onPress={cargar}>
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
            <Text style={estilos.mensaje}>Todavía no cargaste ninguna promoción.</Text>
          }
          renderItem={({ item }) => {
            const estado = estadoDe(item);
            const vencida = new Date(item.hasta) < new Date();
            const editable = item.activa && !vencida;
            return (
              <View style={estilos.tarjeta}>
                <View style={estilos.fila}>
                  <Text style={estilos.titulo}>{item.titulo}</Text>
                  <Text style={[estilos.estado, { color: estado.color }]}>{estado.texto}</Text>
                </View>
                <Text style={estilos.usos}>
                  {item.usos} {item.usos === 1 ? "uso" : "usos"}
                </Text>
                <Text style={estilos.fecha}>
                  Del {new Date(item.desde).toLocaleDateString("es-AR")} al{" "}
                  {new Date(item.hasta).toLocaleDateString("es-AR")}
                </Text>
                {item.activa && (
                  <View style={estilos.acciones}>
                    {editable && (
                      <Pressable
                        style={estilos.accion}
                        onPress={() =>
                          router.push({ pathname: "/promo-form", params: { id: item.id } })
                        }
                      >
                        <Text style={estilos.textoAccion}>Editar</Text>
                      </Pressable>
                    )}
                    <Pressable style={estilos.accion} onPress={() => confirmarBaja(item)}>
                      <Text style={[estilos.textoAccion, estilos.textoBaja]}>Dar de baja</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  botonNueva: { marginHorizontal: 12, marginTop: 12, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#2f95dc", alignItems: "center" },
  textoBoton: { color: "#fff", fontWeight: "600" },
  errorAccion: { color: "#dc2626", marginHorizontal: 12, marginTop: 8 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  mensaje: { fontSize: 16, textAlign: "center", marginTop: 12 },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 4 },
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  titulo: { fontSize: 17, fontWeight: "700", flexShrink: 1 },
  estado: { fontSize: 13, fontWeight: "700" },
  usos: { fontSize: 15, fontWeight: "600" },
  fecha: { fontSize: 13, opacity: 0.7 },
  acciones: { flexDirection: "row", gap: 16, marginTop: 8 },
  accion: { paddingVertical: 4 },
  textoAccion: { color: "#2f95dc", fontWeight: "600" },
  textoBaja: { color: "#dc2626" },
});



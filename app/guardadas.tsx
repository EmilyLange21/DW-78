import { router, Stack, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { listarGuardadas, USUARIO_PROVISORIO, type PromoGuardada } from "../src/db/promosGuardadas";

export default function promosGuardadas() {
    const db = useSQLiteContext();
    const [promos, setPromos] = useState<PromoGuardada[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            setError(null);
            listarGuardadas(db, USUARIO_PROVISORIO)
            .then(setPromos)
            .catch(() => setError("No pudimos leer tus promociones guardadas."))
            .finally(() => setCargando(false));
        }, [db]),
    );


    return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: "Promociones guardadas" }} />
      <Text style={estilos.aviso}>
        Guardadas en tu teléfono: pueden haber cambiado desde que las guardaste.
      </Text>

      {cargando && (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {!cargando && error && <Text style={estilos.mensaje}>{error}</Text>}

      {!cargando && !error && (
        <FlatList
          data={promos}
          keyExtractor={(promo) => promo.id}
          contentContainerStyle={estilos.lista}
          ListEmptyComponent={
            <Text style={estilos.mensaje}>Todavía no guardaste ninguna promoción.</Text>
          }
          renderItem={({ item }) => {
            const vencida = new Date(item.hasta) < new Date();
            return (
              <Pressable
                style={estilos.tarjeta}
                onPress={() =>
                  router.push({ pathname: "/promocion/[id]", params: { id: item.id } })
                }
              >
                <Text style={estilos.titulo}>{item.titulo}</Text>
                {item.descuento !== null && (
                  <Text style={estilos.descuento}>{item.descuento}% OFF</Text>
                )}
                <Text style={[estilos.fecha, vencida && estilos.vencida]}>
                  {vencida ? "Vencida" : "Vence"} el{" "}
                  {new Date(item.hasta).toLocaleDateString("es-AR")}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  aviso: { fontSize: 13, opacity: 0.7, paddingHorizontal: 16, paddingTop: 12 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  mensaje: { fontSize: 16, textAlign: "center", marginTop: 24, paddingHorizontal: 24 },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 4 },
  titulo: { fontSize: 17, fontWeight: "700" },
  descuento: { fontSize: 15, fontWeight: "600", color: "#25b309" },
  fecha: { fontSize: 13, opacity: 0.7 },
  vencida: { color: "#dc2626", opacity: 1, fontWeight: "600" },
});
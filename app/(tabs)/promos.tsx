import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import { listarPromociones } from "../../src/servicios/promociones";
import type { Promocion } from "../../src/tipos";


export default function PantallaPromos() {
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await listarPromociones({ estado: "vigentes" });
      setPromos(respuesta.datos);
    } catch (e) {
      setError(e instanceof Error ? e.message: "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect (() => {
    cargar();
  }, [cargar]);

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" />
        <Text style={estilos.mensaje}>Cargando promociones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.mensaje}>{error}</Text>
        <Pressable style={estilos.boton} onPress={cargar}>
          <Text style={estilos.textoBoton}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={promos}
      keyExtractor={(promo) => promo.id}
      contentContainerStyle={estilos.lista}
      ListEmptyComponent={
        <Text style={estilos.mensaje}>No hay promociones vigentes por ahora.</Text>
      }
      renderItem={({ item}) => (
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>{item.titulo}</Text>
          {item.descuento !== null && (
            <Text style={estilos.descuento}>{item.descuento}% OFF</Text>
          )}
          <Text numberOfLines={2}>{item.detalle}</Text>
          <Text style={estilos.fecha}>
            Hasta el {new Date(item.hasta).toLocaleDateString("es-AR")}
          </Text>
          {item.soloApp && <Text style={estilos.exclusiva}>Exclusiva de la app</Text>}
        </View>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24},
  mensaje: { fontSize: 16, textAlign: "center", marginTop: 12},
  boton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#2f95dc" },
  textoBoton: { color: "#fff", fontWeight: "600" },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 4 },
  titulo: { fontSize: 17, fontWeight: "700" },
  descuento: { fontSize: 15, fontWeight: "600", color: "#2f95dc" },
  fecha: { fontSize: 13, opacity: 0.7 },
  exclusiva: {fontSize: 13, fontWeight: "600", color: "#d97706" },
});



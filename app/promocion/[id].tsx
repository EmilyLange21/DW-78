import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import { obtenerComercio } from "../../src/servicios/comercios";
import { generarCodigo, obtenerPromocion } from "../../src/servicios/promociones";
import type { Comercio, Promocion, UsoDePromocion } from "../../src/tipos";


export default function DetallePromocion() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [promo, setPromo] = useState<Promocion | null>(null);
    const [comercio, setComercio] = useState<Comercio | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uso, setUso] = useState<UsoDePromocion | null>(null);
    const [generando, setGenerando ] = useState(false);
    const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        
        try {
            const datos = await obtenerPromocion(id);
            setPromo(datos);
            setComercio(await obtenerComercio(datos.comercioId).catch(() => null));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
        } finally {
            setCargando(false);
        }
    }, [id]);


    useEffect(() => {
        cargar();
    }, [cargar]);

    async function pedirCodigo() {
        if (!promo) return;
        setGenerando(true);
        setErrorCodigo(null);
        
        try {
            setUso(await generarCodigo(promo.id));
        } catch (e) {
            setErrorCodigo(e instanceof Error ? e.message : "No pudimos generar tu código.")
        } finally {
            setGenerando(false);
        }
    }

    return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: "Promoción" }} />

      {cargando && (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text style={estilos.mensaje}>Cargando promoción...</Text>
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

      {!cargando && !error && promo && (
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={estilos.titulo}>{promo.titulo}</Text>
          {comercio && <Text style={estilos.comercio}>{comercio.nombre}</Text>}
          {promo.descuento !== null && (
            <Text style={estilos.descuento}>{promo.descuento}% OFF</Text>
          )}
          {promo.soloApp && <Text style={estilos.exclusiva}>Exclusiva de la app</Text>}

          <Text style={estilos.subtitulo}>Detalle y condiciones</Text>
          <Text>{promo.detalle}</Text>

          <Text style={estilos.fecha}>
            Del {new Date(promo.desde).toLocaleDateString("es-AR")} al{" "}
            {new Date(promo.hasta).toLocaleDateString("es-AR")}
          </Text>

          {uso ? (
            <View style={estilos.cajaCodigo}>
              <Text>Mostrá este código en el comercio</Text>
              <Text style={estilos.codigo}>{uso.codigo}</Text>
            </View>
          ) : (
            <Pressable style={estilos.boton} onPress={pedirCodigo} disabled={generando}>
              <Text style={estilos.textoBoton}>
                {generando ? "Generando..." : "Obtener mi código"}
              </Text>
            </Pressable>
          )}
          {errorCodigo && <Text style={estilos.errorCodigo}>{errorCodigo}</Text>}
        </ScrollView>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  mensaje: { fontSize: 16, textAlign: "center", marginTop: 12 },
  contenido: { padding: 16, gap: 8 },
  titulo: { fontSize: 22, fontWeight: "700" },
  comercio: { fontSize: 16, opacity: 0.8 },
  descuento: { fontSize: 18, fontWeight: "600", color: "#2f95dc" },
  exclusiva: { fontSize: 13, fontWeight: "600", color: "#d97706" },
  subtitulo: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  fecha: { fontSize: 13, opacity: 0.7, marginTop: 8 },
  boton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, backgroundColor: "#2f95dc", alignItems: "center" },
  textoBoton: { color: "#fff", fontWeight: "600" },
  cajaCodigo: { marginTop: 16, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#8885", alignItems: "center", gap: 8 },
  codigo: { fontSize: 24, fontWeight: "700", letterSpacing: 2 },
  errorCodigo: { color: "#dc2626", marginTop: 8 },
});
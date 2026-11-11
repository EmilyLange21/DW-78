import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import QRScanner from "../components/QRScanner";
import { Text, View } from "../components/Themed";
import { obtenerPromocion, validarCodigo } from "../src/servicios/promociones";
import type { Promocion, UsoDePromocion } from "../src/tipos";

export default function ValidarCodigo() {
    const [escaneando, setEscaneando] = useState(false);
    const [codigo, setCodigo] = useState("");
    const [validando, setValidando] = useState(false);
    const [uso, setUso] = useState<UsoDePromocion | null>(null);
    const [promo, setPromo] = useState<Promocion | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    async function validar(valor: string) {
        const limpio = valor.trim();
        if (!limpio) {
            setError("Ingresá o escaneá un código.");
            return;
        }
        setValidando(true);
        setUso(null);
        setPromo(null);
        setError(null);
        
        try{
            const resultado = await validarCodigo(limpio);
            setUso(resultado);
            setPromo(await obtenerPromocion(resultado.promocionId).catch(() => null));
            setCodigo("");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            setError(e instanceof Error ? e.message: "No pudimos validar el código.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setValidando(false);
        }
    }

    function alLeerQR(leido: string) {
        setEscaneando(false);
        validar(leido);
    }

    return (
    <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: "Validar código" }} />

      <Text style={estilos.titulo}>Validar código de cliente</Text>
      <Text style={estilos.ayuda}>
        Escaneá el QR que muestra el cliente o ingresá su código a mano.
      </Text>

      <Pressable style={estilos.boton} onPress={() => setEscaneando(true)}>
        <Text style={estilos.textoBoton}>Escanear QR</Text>
      </Pressable>

      <Text style={estilos.separador}>o ingresá el código</Text>
      <TextInput
        style={estilos.input}
        value={codigo}
        onChangeText={setCodigo}
        placeholder="CCU-XXXX-XXXX"
        placeholderTextColor="#888"
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <Pressable style={estilos.boton} onPress={() => validar(codigo)} disabled={validando}>
        <Text style={estilos.textoBoton}>{validando ? "Validando..." : "Validar código"}</Text>
      </Pressable>

      {uso && (
        <View style={[estilos.resultado, estilos.ok]}>
          <Text style={estilos.tituloResultado}>Código válido: uso registrado</Text>
          {promo && <Text>Promoción: {promo.titulo}</Text>}
          <Text>Código: {uso.codigo}</Text>
          {uso.validadoEn && (
            <Text>Validado: {new Date(uso.validadoEn).toLocaleString("es-AR")}</Text>
          )}
        </View>
      )}

      {error && (
        <View style={[estilos.resultado, estilos.fallo]}>
          <Text style={estilos.tituloResultado}>No se pudo validar</Text>
          <Text>{error}</Text>
        </View>
      )}

      <QRScanner
        visible={escaneando}
        onClose={() => setEscaneando(false)}
        onCodigo={alLeerQR}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: "700" },
  ayuda: { fontSize: 14, opacity: 0.8 },
  separador: { textAlign: "center", opacity: 0.7, marginTop: 8 },
  boton: { paddingVertical: 12, borderRadius: 8, backgroundColor: "#2f95dc", alignItems: "center" },
  textoBoton: { color: "#fff", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#8885", borderRadius: 8, padding: 12, fontSize: 18, letterSpacing: 1, backgroundColor: "#fff", color: "#000" },
  resultado: { padding: 14, borderRadius: 10, borderWidth: 1, gap: 4, marginTop: 8 },
  ok: { backgroundColor: "#16a34a22", borderColor: "#16a34a" },
  fallo: { backgroundColor: "#dc262622", borderColor: "#dc2626" },
  tituloResultado: { fontSize: 16, fontWeight: "700" },
});
import Ionicons from "@react-native-vector-icons/ionicons";
import { Alert, Linking, Platform, Pressable, StyleSheet, Text } from "react-native";
import type { Coordenadas } from "../tipos";

type Modo = "walking" | "driving";

function urlDeRuta(destino: Coordenadas, modo: Modo): string {
  const { latitud, longitud } = destino;
  if (Platform.OS === "ios") {
    // Apple Maps: w = caminando, d = en auto.
    return `http://maps.apple.com/?daddr=${latitud},${longitud}&dirflg=${modo === "walking" ? "w" : "d"}`;
  }
  // Android: abre Google Maps con la ruta ya armada.
  return `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=${modo}`;
}

async function abrirRuta(destino: Coordenadas, modo: Modo) {
  try {
    await Linking.openURL(urlDeRuta(destino, modo));
  } catch {
    Alert.alert("No pudimos abrir el mapa", "Probá abrir tu app de mapas y buscar la dirección a mano.");
  }
}

interface Props {
  destino: Coordenadas;
  nombre?: string;
}

/** Botón "Ir": pregunta cómo quiere ir y abre la app de mapas del teléfono con la ruta. */
export function BotonIr({ destino, nombre }: Props) {
  function preguntar() {
    Alert.alert("¿Cómo querés ir?", nombre, [
      { text: "Caminando", onPress: () => abrirRuta(destino, "walking") },
      { text: "En auto", onPress: () => abrirRuta(destino, "driving") },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  return (
    <Pressable
      onPress={preguntar}
      accessibilityRole="button"
      accessibilityLabel={nombre ? `Ir a ${nombre}` : "Cómo llegar"}
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
    >
      <Ionicons name="navigate-outline" size={20} color="#fff" />
      <Text style={estilos.texto}>Ir</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 48, // área táctil cómoda
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#0b5c8a",
  },
  presionado: { opacity: 0.8 },
  texto: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

import { StyleSheet, Text, View } from "react-native";

export default function Pantalla() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Buscar</Text>
      <Text style={estilos.texto}>Listado, búsqueda y filtros de comercios.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  titulo: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  texto: { fontSize: 15, textAlign: "center", opacity: 0.7 },
});

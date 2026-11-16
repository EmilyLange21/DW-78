import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

interface Props {
  onEnviar: (texto: string) => Promise<string | null>; // null = salió bien
    onCancelar: () => void;
}

export default function FormularioRespuesta({ onEnviar, onCancelar }: Props) {
    const colorTexto = useColorScheme() === "dark" ? "#ffffff" : "#000000";
    const [texto, setTexto] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    async function enviar() {
        if (enviando) return;
        if (texto.trim() === "") {
        setError("Escribí una respuesta.");
        return;
        }
        setEnviando(true);
        setError(null);
        const mensaje = await onEnviar(texto);
        setEnviando(false);
        if (mensaje) setError(mensaje);
    }

    return (
        <View style={estilos.contenedor}>
        <Text style={estilos.etiqueta}>Tu respuesta (se puede una sola vez)</Text>
        <TextInput
            style={[estilos.campo, { color: colorTexto }]}
            placeholder="Escribí tu respuesta"
            placeholderTextColor="#888888"
            value={texto}
            onChangeText={setTexto}
            multiline
        />
        {error !== null && <Text style={estilos.error}>{error}</Text>}
        <Pressable style={[estilos.boton, enviando && estilos.inactivo]} onPress={enviar} disabled={enviando}>
            <Text style={estilos.textoBoton}>{enviando ? "Enviando..." : "Publicar respuesta"}</Text>
        </Pressable>
        <Pressable style={estilos.botonCancelar} onPress={onCancelar}>
            <Text style={estilos.textoCancelar}>Cancelar</Text>
        </Pressable>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { gap: 8, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#2f95dc" },
    etiqueta: { fontSize: 16, fontWeight: "600" },
    campo: {
        minHeight: 80,
        borderWidth: 1,
        borderColor: "#8885",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        textAlignVertical: "top",
    },
    error: { fontSize: 16, color: "#cc3333" },
    boton: { minHeight: 52, borderRadius: 10, backgroundColor: "#2f95dc", alignItems: "center", justifyContent: "center" },
    inactivo: { opacity: 0.6 },
    textoBoton: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
    botonCancelar: { minHeight: 52, borderRadius: 10, borderWidth: 1, borderColor: "#8885", alignItems: "center", justifyContent: "center" },
    textoCancelar: { fontSize: 18, fontWeight: "600" },
});
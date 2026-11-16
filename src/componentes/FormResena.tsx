import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import Estrellas from "./Estrellas";

type Puntaje = 1 | 2 | 3 | 4 | 5;

interface Props {
    inicial?: { estrellas: Puntaje; comentario: string };
    textoBoton?: string;
    onEnviar: (estrellas: Puntaje, comentario: string) => Promise<string | null>;
    onCancelar?: () => void;
    }

    export default function FormularioResena({ inicial, textoBoton = "Publicar reseña", onEnviar, onCancelar }: Props) {
    const colorTexto = useColorScheme() === "dark" ? "#ffffff" : "#000000";
    const [estrellas, setEstrellas] = useState<Puntaje | null>(inicial?.estrellas ?? null);
    const [comentario, setComentario] = useState(inicial?.comentario ?? "");
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    async function enviar() {
        if (enviando) return;
        if (estrellas === null) {
        setError("Elegí un puntaje de 1 a 5 estrellas.");
        return;
        }
        if (comentario.trim() === "") {
        setError("Escribí un comentario.");
        return;
        }
        setEnviando(true);
        setError(null);
        const mensaje = await onEnviar(estrellas, comentario);
        setEnviando(false);
        if (mensaje) setError(mensaje);
        else if (!inicial) {
        setEstrellas(null);
        setComentario("");
        }
    }

    return (
        <View style={estilos.contenedor}>
        <Text style={estilos.etiqueta}>Tu puntaje</Text>
        <Estrellas valor={estrellas ?? 0} onCambiar={setEstrellas} tamano={36} />

        <Text style={estilos.etiqueta}>Tu comentario</Text>
        <TextInput
            style={[estilos.campo, { color: colorTexto }]}
            placeholder="Contá tu experiencia"
            placeholderTextColor="#888888"
            value={comentario}
            onChangeText={setComentario}
            multiline
        />

        {error !== null && <Text style={estilos.error}>{error}</Text>}

        <Pressable style={[estilos.boton, enviando && estilos.inactivo]} onPress={enviar} disabled={enviando}>
            <Text style={estilos.textoBoton}>{enviando ? "Enviando..." : textoBoton}</Text>
        </Pressable>

        {onCancelar && (
            <Pressable style={estilos.botonCancelar} onPress={onCancelar}>
            <Text style={estilos.textoCancelar}>Cancelar</Text>
            </Pressable>
        )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { gap: 8, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885" },
    etiqueta: { fontSize: 16, fontWeight: "600" },
    campo: {
        minHeight: 100,
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
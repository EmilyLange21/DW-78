import { Text, View } from "@/components/Themed";
import type { Resena } from "@/src/tipos";
import { Pressable, StyleSheet } from "react-native";
import Estrellas from "./Estrellas";

interface Props {
    resena: Resena;
    onEditar?: () => void;
    onBorrar?: () => void;
    onReportar?: () => void;
    onResponder?: () => void;
}

export default function TarjetaResena({ resena, onEditar, onBorrar, onReportar, onResponder }: Props) {
    const fecha = new Date(resena.creadaEn).toLocaleDateString("es-AR");
    const hayAcciones = onEditar || onBorrar || onReportar || onResponder;

    return (
        <View style={estilos.tarjeta}>
        <View style={estilos.cabecera}>
            <Estrellas valor={resena.estrellas} />
            <Text style={estilos.fecha}>{fecha}</Text>
        </View>

        <Text style={estilos.comentario}>{resena.comentario}</Text>

        {resena.respuesta !== null && (
            <View style={estilos.respuesta}>
            <Text style={estilos.respuestaTitulo}>Respuesta del comercio</Text>
            <Text style={estilos.respuestaTexto}>{resena.respuesta}</Text>
            </View>
        )}

        {hayAcciones && (
            <View style={estilos.acciones}>
            {onEditar && (
                <Pressable style={estilos.botonAzul} onPress={onEditar}>
                <Text style={estilos.textoAzul}>Editar</Text>
                </Pressable>
            )}
            {onBorrar && (
                <Pressable style={estilos.botonRojo} onPress={onBorrar}>
                <Text style={estilos.textoRojo}>Borrar</Text>
                </Pressable>
            )}
            {onResponder && resena.respuesta === null && (
                <Pressable style={estilos.botonAzul} onPress={onResponder}>
                <Text style={estilos.textoAzul}>Responder</Text>
                </Pressable>
            )}
            {onReportar &&
                (resena.reportada ? (
                <Text style={estilos.reportada}>Reportada</Text>
                ) : (
                <Pressable style={estilos.botonGris} onPress={onReportar}>
                    <Text style={estilos.textoGris}>Reportar</Text>
                </Pressable>
                ))}
            </View>
        )}
        </View>
    );
}

const estilos = StyleSheet.create({
    tarjeta: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 8 },
    cabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    fecha: { fontSize: 14, opacity: 0.7 },
    comentario: { fontSize: 16 },
    respuesta: {
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#2f95dc",
        backgroundColor: "#8881",
        gap: 2,
    },
    respuestaTitulo: { fontSize: 14, fontWeight: "700" },
    respuestaTexto: { fontSize: 15 },
    acciones: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
    botonAzul: { minHeight: 44, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#2f95dc", justifyContent: "center" },
    textoAzul: { color: "#2f95dc", fontSize: 16, fontWeight: "600" },
    botonRojo: { minHeight: 44, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#cc3333", justifyContent: "center" },
    textoRojo: { color: "#cc3333", fontSize: 16, fontWeight: "600" },
    botonGris: { minHeight: 44, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#8885", justifyContent: "center" },
    textoGris: { fontSize: 16, opacity: 0.7 },
    reportada: { fontSize: 15, opacity: 0.6 },
});
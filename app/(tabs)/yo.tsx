import { Text, View } from "@/components/Themed";
import FavoritosYRubros from "@/src/componentes/FavoritosYRubros";
import { useSesion } from "@/src/context/SesionContext";
import { activarAvisos } from "@/src/servicios/usuarios";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch } from "react-native";

export default function Yo() {
    const { usuario, cargando, salir, actualizarUsuario } = useSesion();
    const [mensaje, setMensaje] = useState<string | null>(null);

    if (cargando) {
        return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
    }

    if (!usuario) {
        return (
        <View style={estilos.pantallaSinSesion}>
            <Text style={estilos.titulo}>Tu cuenta</Text>
            <Text style={estilos.texto}>
            Ingresá para guardar tus comercios favoritos, escribir reseñas y usar promociones.
            </Text>

            <Link href="/login" asChild>
            <Pressable style={estilos.botonPrincipal}>
                <Text style={estilos.textoBotonPrincipal}>Ingresar</Text>
            </Pressable>
            </Link>

            <Link href="/registro" asChild>
            <Pressable style={estilos.botonSecundario}>
                <Text style={estilos.textoBotonSecundario}>Crear cuenta</Text>
            </Pressable>
            </Link>
        </View>
        );
    }

    async function cambiarAvisos(valor: boolean) {
        setMensaje(null);
        const r = await activarAvisos(valor);
        if ("error" in r) setMensaje(r.error.mensaje);
        else actualizarUsuario(r.datos);
    }

    return (
        <ScrollView contentContainerStyle={estilos.pantalla}>
            <View style={estilos.tarjeta}>
                <Text style={estilos.nombre}>Hola, {usuario.nombre}</Text>
                <Text style={estilos.email}>{usuario.email}</Text>
            </View>

            <View style={[estilos.tarjeta, estilos.filaAvisos]}>
                <Text style={estilos.textoAvisos}>Recibir avisos de promociones</Text>
                <Switch value={usuario.avisosActivos} onValueChange={cambiarAvisos} />
            </View>

            {mensaje !== null && <Text style={estilos.error}>{mensaje}</Text>}

            <FavoritosYRubros usuario={usuario} onActualizar={actualizarUsuario} />

            <Pressable style={estilos.botonSalir} onPress={salir}>
                <Text style={estilos.textoBotonSalir}>Cerrar sesión</Text>
            </Pressable>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    pantalla: { padding: 16, gap: 12 },
    pantallaSinSesion: { flex: 1, padding: 20, gap: 12, justifyContent: "center" },
    titulo: { fontSize: 24, fontWeight: "700" },
    texto: { fontSize: 16 },
    tarjeta: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 4 },
    nombre: { fontSize: 20, fontWeight: "700" },
    email: { fontSize: 16, opacity: 0.7 },
    filaAvisos: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    textoAvisos: { fontSize: 16, flex: 1 },
    error: { fontSize: 16, color: "#cc3333" },
    botonPrincipal: {
        minHeight: 52,
        borderRadius: 10,
        backgroundColor: "#2f95dc",
        alignItems: "center",
        justifyContent: "center",
    },
    textoBotonPrincipal: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
    botonSecundario: {
        minHeight: 52,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#2f95dc",
        alignItems: "center",
        justifyContent: "center",
    },
    textoBotonSecundario: { color: "#2f95dc", fontSize: 18, fontWeight: "700" },
    botonSalir: {
        minHeight: 52,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#cc3333",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    textoBotonSalir: { color: "#cc3333", fontSize: 18, fontWeight: "700" },
    });
import { Text, View } from "@/components/Themed";
import Estrellas from "@/src/componentes/Estrellas";
import FormularioResena from "@/src/componentes/FormResena";
import TarjetaResena from "@/src/componentes/TarjetaResena";
import { useSesion } from "@/src/context/SesionContext";
import {crearResena,editarResena,eliminaResena,obtenerResenas,reportarResena,
} from "@/src/servicios/resenas";
import { Resena } from "@/src/tipos/resena";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

export default function SeccionResenas({ comercioId }: { comercioId: string }) {
    const { usuario } = useSesion();
    const Yo = usuario?.id ?? "";

    const [resenas, setResenas] = useState<Resena[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    async function recargar() {
        const r = await obtenerResenas(comercioId);
        if ("error" in r) setError(r.error.mensaje);
        else {
        setError(null);
        setResenas(r.datos);
        }
        setCargando(false);
    }

    useEffect(() => {
        setCargando(true);
        setEditandoId(null);
        recargar();
    }, [comercioId]);

    async function borrar(id: string) {
        setMensaje(null);
        const r = await eliminaResena(id);
        if ("error" in r) setMensaje(r.error.mensaje);
        else await recargar();
    }

    async function reportar(id: string) {
        setMensaje(null);
        const r = await reportarResena(id);
        if ("error" in r) setMensaje(r.error.mensaje);
        else await recargar();
    }

    if (cargando) {
        return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
    }

    const miResena = resenas.find((r) => r.usuarioId === Yo);
    const promedio =
        resenas.length > 0 ? resenas.reduce((suma, r) => suma + r.estrellas, 0) / resenas.length : null;

    return (
        <View style={estilos.contenedor}>
        {promedio !== null && (
            <View style={estilos.resumen}>
            <Text style={estilos.promedio}>{promedio.toFixed(1).replace(".", ",")}</Text>
            <View style={{ gap: 2 }}>
                <Estrellas valor={promedio} />
                <Text style={estilos.cantidad}>{resenas.length} reseñas</Text>
            </View>
            </View>
        )}

        {!usuario && (
            <View style={estilos.aviso}>
            <Text style={estilos.texto}>Ingresá para dejar tu reseña.</Text>
            <Link href="/login" asChild>
                <Pressable style={estilos.boton}>
                <Text style={estilos.textoBoton}>Ingresar</Text>
                </Pressable>
            </Link>
            </View>
        )}

        {usuario?.rol === "vecino" && !miResena && (
            <FormularioResena
            onEnviar={async (estrellas, comentario) => {
                const r = await crearResena({ comercioId, estrellas, comentario });
                if ("error" in r) return r.error.mensaje;
                await recargar();
                return null;
            }}
            />
        )}

        {error !== null && <Text style={estilos.error}>{error}</Text>}
        {mensaje !== null && <Text style={estilos.error}>{mensaje}</Text>}

        {resenas.length === 0 && error === null && (
            <Text style={estilos.texto}>Todavía no hay reseñas.</Text>
        )}

        {resenas.map((r) =>
            editandoId === r.id ? (
            <FormularioResena
                key={r.id}
                inicial={{ estrellas: r.estrellas, comentario: r.comentario }}
                textoBoton="Guardar cambios"
                onEnviar={async (estrellas, comentario) => {
                const res = await editarResena(r.id, { estrellas, comentario });
                if ("error" in res) return res.error.mensaje;
                setEditandoId(null);
                await recargar();
                return null;
                }}
                onCancelar={() => setEditandoId(null)}
            />
            ) : (
            <TarjetaResena
                key={r.id}
                resena={r}
                onEditar={r.usuarioId === Yo ? () => setEditandoId(r.id) : undefined}
                onBorrar={r.usuarioId === Yo ? () => borrar(r.id) : undefined}
                onReportar={usuario && r.usuarioId !== Yo ? () => reportar(r.id) : undefined}
            />
            )
        )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { gap: 12 },
    resumen: { flexDirection: "row", alignItems: "center", gap: 12 },
    promedio: { fontSize: 40, fontWeight: "700" },
    cantidad: { fontSize: 14, opacity: 0.7 },
    texto: { fontSize: 16 },
    error: { fontSize: 16, color: "#cc3333" },
    aviso: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#8885", gap: 10 },
    boton: { minHeight: 52, borderRadius: 10, backgroundColor: "#2f95dc", alignItems: "center", justifyContent: "center" },
    textoBoton: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
});
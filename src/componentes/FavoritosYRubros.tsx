import { useEffect, useState } from "react";
import { Button } from "react-native";
import { listarRubros, obtenerComercio } from "@/src/servicios/comercios";
import { alternarFavoritos, guardarRubrosDeInteres } from "@/src/servicios/usuarios";
import type { Comercio, Rubro, Usuario } from "@/src/tipos";
import { Text, View } from "@/components/Themed";
import { Pressable, StyleSheet, Switch } from "react-native";


interface Props {
    usuario: Usuario;
    onActualizar: (usuario: Usuario) => void;
}

export default function FavoritosYRubros({ usuario, onActualizar }: Props) {
    const [comercios, setComercios] = useState<Comercio[]>([]);
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [mensaje, setMensaje] = useState<string | null>(null);

    const clave = usuario.favoritos.join(",");

    useEffect(() => {
        let vigente = true;
        async function cargar() {
        const resultados = await Promise.allSettled(
            usuario.favoritos.map((id) => obtenerComercio(id))
        );
        if (!vigente) return;
        setComercios(
            resultados.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
        );
        }
        cargar();
        return () => {
        vigente = false;
        };
    }, [clave]);

    useEffect(() => {
        listarRubros()
        .then(setRubros)
        .catch(() => setMensaje("No pudimos cargar los rubros."));
    }, []);

    async function quitar(id: string) {
        setMensaje(null);
        const r = await alternarFavoritos(id, true);
        if ("error" in r) setMensaje(r.error.mensaje);
        else onActualizar(r.datos);
    }

    async function cambiarRubro(id: string, activo: boolean) {
        setMensaje(null);
        const nuevos = activo
        ? [...usuario.rubrosDeInteres, id]
        : usuario.rubrosDeInteres.filter((x) => x !== id);
        const r = await guardarRubrosDeInteres(nuevos);
        if ("error" in r) setMensaje(r.error.mensaje);
        else onActualizar(r.datos);
    }

    return (
        <View style={estilos.contenedor}>
            <Text style={estilos.seccion}>Favoritos</Text>
            {usuario.favoritos.length === 0 && (
            <Text style={estilos.vacio}>Todavía no marcaste ningún favorito.</Text>
            )}
            {comercios.map((c) => (
            <View key={c.id} style={estilos.fila}>
                <Text style={estilos.nombre}>{c.nombre}</Text>
                <Pressable style={estilos.botonQuitar} onPress={() => quitar(c.id)}>
                <Text style={estilos.textoQuitar}>Quitar</Text>
                </Pressable>
            </View>
            ))}

            <Text style={estilos.seccion}>Rubros de interés</Text>
            {rubros.map((r) => (
            <View key={r.id} style={estilos.fila}>
                <Text style={estilos.nombre}>{r.nombre}</Text>
                <Switch
                value={usuario.rubrosDeInteres.includes(r.id)}
                onValueChange={(valor) => cambiarRubro(r.id, valor)}
                />
            </View>
            ))}

            {mensaje !== null && <Text style={estilos.error}>{mensaje}</Text>}
        </View>
    );
}


const estilos = StyleSheet.create({
    contenedor: { gap: 10 },
    seccion: { fontSize: 18, fontWeight: "700", marginTop: 8 },
    vacio: { fontSize: 16, opacity: 0.7 },
    fila: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#8885",
    },
    nombre: { fontSize: 16, flex: 1 },
    botonQuitar: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cc3333",
    },
    textoQuitar: { color: "#cc3333", fontSize: 16, fontWeight: "600" },
    error: { fontSize: 16, color: "#cc3333" },
});
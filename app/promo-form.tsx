import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, TextInput } from "react-native";
import { Text, View } from "../components/Themed";
import { crearPromocion, editarPromocion, obtenerPromocion, type DatosPromocion } from "../src/servicios/promociones";

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function fechaValida(texto: string): boolean {
    return FORMATO_FECHA.test(texto) && !Number.isNaN(new Date(`${texto}T00:00:00-03:00`).getTime());
}

function aFecha(iso: string): string {
    const f = new Date(iso);
    const mes = String(f.getMonth() + 1).padStart(2, "0");
    const dia = String(f.getDate()).padStart(2, "0");
    return `${f.getFullYear()}-${mes}-${dia}`;
}

export default function FormularioPromo() {
    const { id } = useLocalSearchParams<{ id?: string}>();
    const esEdicion = Boolean(id);

    const [titulo, setTitulo] = useState("");
    const [detalle, setDetalle] = useState("");
    const [descuento, setDescuento] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [soloApp, setSoloApp] = useState(false);
    const [desdeOriginal, setDesdeOriginal] = useState("");
    const [cargando, setCargando] = useState(esEdicion);
    const [errorCarga, setErrorCarga] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!id) return;
        obtenerPromocion(id)
        .then((p) => {
            setTitulo(p.titulo);
            setDetalle(p.detalle);
            setDescuento(p.descuento === null ? "" : String(p.descuento));
            setDesde(aFecha(p.desde));
            setDesdeOriginal(aFecha(p.desde));
            setHasta(aFecha(p.hasta));
            setSoloApp(p.soloApp);
        })
        .catch((e) =>
            setErrorCarga(e instanceof Error ? e.message : "No pudimos cargar la promoción."),
    )
    .finally(() => setCargando(false));
    }, [id]);

    async function guardar() {
        setError(null);
        const textoDescuento = descuento.trim();
        const textoDesde = desde.trim();
        const textoHasta = hasta.trim();

        if (!titulo.trim() || !detalle.trim()) {
            setError("Completá el títuloy el detalle.")
            return;
        }
        if (textoDescuento !== "") {
            const n = Number(textoDescuento);
            if (!Number.isInteger(n) || n < 1 || n > 100) {
                setError("El descuento tiene que ser un número entero entre 1 a 100.")
                return;
            }

        }
        if (!fechaValida(textoHasta)) {
            setError("La fecha de fin tiene que tener el formato AAA-MM-DD.")
            return;
        }
        if (textoDesde !== "" && !fechaValida(textoDesde)) {
            setError("La fecha de inicio tiene que tener el formato AAAA-MM-DD.");
            return;
        }

        const datos: DatosPromocion = {
            titulo: titulo.trim(),
            detalle: detalle.trim(),
            hasta: `${textoHasta}T23:59:59-03:00`,
            soloApp,
        };
        if (textoDescuento !== "") datos.descuento = Number(textoDescuento);
        else if (esEdicion) datos.descuento = null;
        if (textoDesde !== "" && textoDesde !== desdeOriginal) {
            datos.desde = `${textoDesde}T00:00:00-03:00`;
        }

        setGuardando(true);
        try {
            if (id) await editarPromocion(id, datos);
            else await crearPromocion(datos);
            router.back();
        } catch (e) {
            setError (e instanceof Error ? e.message: "No pudimos guardar la promoción.");
        } finally {
            setGuardando(false);
        }
    }

    return (
        <View style={estilos.pantalla}>
        <Stack.Screen options={{ title: esEdicion ? "Editar promoción" : "Nueva promoción" }} />

        {cargando && (
            <View style={estilos.centro}>
            <ActivityIndicator size="large" />
            </View>
        )}

        {!cargando && errorCarga && (
            <View style={estilos.centro}>
            <Text style={estilos.mensaje}>{errorCarga}</Text>
            </View>
        )}

        {!cargando && !errorCarga && (
            <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
            <Text style={estilos.etiqueta}>Título</Text>
            <TextInput
                style={estilos.input}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={120}
                placeholderTextColor="#888"
            />

            <Text style={estilos.etiqueta}>Detalle y condiciones</Text>
            <TextInput
                style={[estilos.input, estilos.inputLargo]}
                value={detalle}
                onChangeText={setDetalle}
                multiline
                maxLength={2000}
                placeholderTextColor="#888"
            />

            <Text style={estilos.etiqueta}>Descuento en % (opcional)</Text>
            <TextInput
                style={estilos.input}
                value={descuento}
                onChangeText={setDescuento}
                keyboardType="number-pad"
                placeholder="Ej: 15"
                placeholderTextColor="#888"
            />

            <Text style={estilos.etiqueta}>Empieza (opcional)</Text>
            <TextInput
                style={estilos.input}
                value={desde}
                onChangeText={setDesde}
                placeholder="AAAA-MM-DD (vacío = desde ahora)"
                placeholderTextColor="#888"
                autoCorrect={false}
            />

            <Text style={estilos.etiqueta}>Termina</Text>
            <TextInput
                style={estilos.input}
                value={hasta}
                onChangeText={setHasta}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#888"
                autoCorrect={false}
            />

            <View style={estilos.filaSwitch}>
                <Text style={estilos.etiqueta}>Exclusiva de la app</Text>
                <Switch value={soloApp} onValueChange={setSoloApp} />
            </View>

            {error && <Text style={estilos.error}>{error}</Text>}

            <Pressable style={estilos.boton} onPress={guardar} disabled={guardando}>
                <Text style={estilos.textoBoton}>
                {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear promoción"}
                </Text>
            </Pressable>
            </ScrollView>
        )}
        </View>
    );
}

const estilos = StyleSheet.create({
    pantalla: { flex: 1 },
    centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    mensaje: { fontSize: 16, textAlign: "center" },
    contenido: { padding: 16, gap: 8 },
    etiqueta: { fontSize: 15, fontWeight: "600", marginTop: 8 },
    input: { borderWidth: 1, borderColor: "#8885", borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: "#fff", color: "#000" },
    inputLargo: { minHeight: 100, textAlignVertical: "top" },
    filaSwitch: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
    error: { color: "#dc2626", marginTop: 8 },
    boton: { marginTop: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: "#2f95dc", alignItems: "center" },
    textoBoton: { color: "#fff", fontWeight: "600" },
});
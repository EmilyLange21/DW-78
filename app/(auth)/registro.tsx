import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, TextInput } from "react-native";
import { useSesion } from "@/src/context/SesionContext";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme.web";
import { Pressable, ScrollView, StyleSheet } from "react-native";

export default function Registro(){
    const {crearCuenta}=useSesion()
    const router=useRouter()
    const oscuro = useColorScheme() === "dark";
    const colorTexto = oscuro ? "#ffffff" : "#000000"

    const [nombre, setNombre]=useState("")
    const [email, setEmail]=useState("")
    const [contrasena, setContrasena] = useState("")
    const [error, setError]=useState<string|null>(null)
    const [enviando, setEnviando]=useState(false)

    async function enviar(){
        if(enviando) return
        setEnviando(true)
        setError(null)
        const mensaje = await crearCuenta(nombre, email, contrasena)
        setEnviando(false)

        if(mensaje){
            setError(mensaje)
            return
        }
        if(router.canGoBack()) router.dismissAll();
        router.replace("/")
    }


    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={estilos.pantalla} keyboardShouldPersistTaps="handled">
                <Text style={estilos.titulo}>Creá tu cuenta</Text>

                <Text style={estilos.etiqueta}>Nombre</Text>
                <TextInput
                style={[estilos.campo, { color: colorTexto }]}
                placeholder="Tu nombre"
                placeholderTextColor="#888888"
                value={nombre}
                onChangeText={setNombre}
                />

                <Text style={estilos.etiqueta}>Email</Text>
                <TextInput
                style={[estilos.campo, { color: colorTexto }]}
                placeholder="tuemail@ejemplo.com"
                placeholderTextColor="#888888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                />

                <Text style={estilos.etiqueta}>Contraseña</Text>
                <TextInput
                style={[estilos.campo, { color: colorTexto }]}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#888888"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
                />

                {error !== null && <Text style={estilos.error}>{error}</Text>}

                <Pressable
                style={[estilos.boton, enviando && estilos.botonInactivo]}
                onPress={enviar}
                disabled={enviando}
                >
                <Text style={estilos.textoBoton}>{enviando ? "Creando..." : "Crear cuenta"}</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const estilos = StyleSheet.create({
    pantalla: { flexGrow: 1, padding: 20, gap: 8 },
    titulo: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
    etiqueta: { fontSize: 16, fontWeight: "600", marginTop: 8 },
    campo: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: "#8885",
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 18,
    },
    error: { fontSize: 16, color: "#cc3333", marginTop: 8 },
    boton: {
        marginTop: 16,
        minHeight: 52,
        borderRadius: 10,
        backgroundColor: "#2f95dc",
        alignItems: "center",
        justifyContent: "center",
    },
    botonInactivo: { opacity: 0.6 },
    textoBoton: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
    });

import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useSesion } from "@/src/context/SesionContext";

export default function Registro(){
    const {crearCuenta}=useSesion()
    const router=useRouter()

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


    return(
        <View style={{padding:16, gap:12}}>
            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={{borderWidth:1, padding:10}}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={{borderWidth:1, padding: 10}}
            />
            <TextInput
                placeholder="Contraseña (minimo 8 caracteres)"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
                style={{borderWidth:1, padding:10}}
            />

            {error !== null && <Text style={{color: "red"}}>{error}</Text>}

            <Button title={enviando ? "Creando..." : "Crear cuenta"} onPress={enviar} disabled={enviando}/>
        </View>
    )
}
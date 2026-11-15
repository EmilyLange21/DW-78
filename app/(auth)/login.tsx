import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useSesion } from "@/src/context/SesionContext";
import * as Linking from "expo-linking"

export default function Login(){
    console.log("Login montado")
    const {ingresar, usuario}=useSesion()
    const router=useRouter()

    const [email, setEmail]=useState("")
    const [contrasena, setContrasena] = useState("")
    const [error, setError]=useState<string|null>(null)
    const [enviando, setEnviando]=useState(false)

    useEffect(()=>{
        if(usuario) router.replace("/")
    },[usuario]);

    useEffect(()=>{
        Linking.getInitialURL().then((url)=>console.log("URL inicial:" ,url))
    },[])

    async function enviar(){
        if(enviando) return;
        if(email.trim()==="" || contrasena===""){
            setError("Completá con email y contraseña")
            return
        }

        setEnviando(true)
        setError(null)
        const mensaje=await ingresar(email, contrasena); //Null: salio todo bien
        setEnviando(false)

        if(mensaje){
            setError(mensaje);
            return
        }
        if(router.canGoBack())router.back();
        else router.replace("/")
    }


    return(
        <View style={{padding:16, gap:12}}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={{borderWidth:1, padding:10}}
            />
            <TextInput
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
                style={{borderWidth:1, padding:10}}
            />

            {error !== null && <Text style={{color:"red"}}>{error}</Text>}
        
            <Button title={enviando ? "Ingresando..." : "Ingresar"} onPress={enviar} disabled={enviando}/>
        
            <Link href="/registro"> ¿No tienes cuenta? Creá una ahora mismo</Link>
        </View>
    )
}


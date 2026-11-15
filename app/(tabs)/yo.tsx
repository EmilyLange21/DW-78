import { useState } from "react";
import { Link } from "expo-router";
import { Button, ScrollView, Text, ActivityIndicator, Switch, View } from "react-native";
import { useSesion } from "@/src/context/SesionContext";
import { activarAvisos } from "@/src/servicios/usuarios";

export default function Yo(){
    const {usuario, cargando, salir, actualizarUsuario}=useSesion();
    const [mensaje, setMensaje]=useState<string|null>(null)

    if(cargando){
        return <ActivityIndicator size="large" style={{marginTop:100}}/>
    }

    if(!usuario){
        return(
            <View>
                <Text>Ingresá para guardar tus comercios favoritos, escribir reseñas y usar promosiones.</Text>
                <Link href="/login">Ingresar</Link>
                <Link href="/registro">Crear cuenta</Link>
            </View>
        )
    }

    async function cambiarAvisos(valor:boolean){
        setMensaje(null);
        const r = await activarAvisos(valor)
        if("error" in r) setMensaje(r.error.mensaje)
        else actualizarUsuario(r.datos)
    }

    return(
        <ScrollView contentContainerStyle={{padding:16, gap:12}}>
            <Text>Hola, {usuario.nombre}</Text>
            <Text>{usuario.email}</Text>

            <View style={{flexDirection:"row", alignItems:"center", gap:8}}>
                <Text>Recibir Avisos</Text>
                <Switch value={usuario.avisosActivos} onValueChange={cambiarAvisos}/>
            </View>
        
            {mensaje !== null && <Text style={{color:"red"}}>{mensaje}</Text>}

            <Text>Favoritos: {usuario.favoritos.length} </Text>
            <Text>Rubros de Interés: {usuario.rubrosDeInteres.length} </Text>

            <Button title="Salir" onPress={salir}/>
        </ScrollView>
    )
}


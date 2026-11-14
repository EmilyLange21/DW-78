import { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import {useSesion } from "@/src/context/SesionContext";

export default function Sesion(){
    const {usuario, token, cargando, ingresar, salir}=useSesion()
    const [mensaje, setMensaje]=useState("")

    if(cargando){
        return <ActivityIndicator size={"large"} style={{marginTop:100}}/>
    }

    async function Entrar(){
        const error=await ingresar("marta@mail.com", "demo1234")
        setMensaje(error ?? "OK")
    }

    return(
        <View style={{padding:16, paddingTop:60}}>
            {usuario ? (<>
            <Text>Hola, {usuario.nombre}</Text>
            <Text>Token, {token}</Text>
            <Button title="Salir" onPress={salir}/>
            </>
            ):(
                <>
                <Text>Sin Sesion</Text>
                <Button title="Entrar como Marta" onPress={Entrar}/>
                </>
            )}
            <Text style={{marginTop:16}}>{mensaje}</Text>
        </View>
    )
}
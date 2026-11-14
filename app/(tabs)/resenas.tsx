import { useEffect, useState } from "react";
import { ScrollView, Text, View, Button } from "react-native";
import { obtenerResenas, crearResena, editarResena, eliminaResena, reportarResena, responderResena } from "@/src/servicios/resenas";
import { Resena } from "@/src/tipos/resena";
import { Respuesta, CuerpoDeError } from "@/src/tipos";
import { useSesion } from "@/src/context/SesionContext";


const comercio="com-118"

export default function PruebaResenas(){

    const {usuario}=useSesion()
    const Yo= usuario?.id??"";

    const [resenas, setResenas]= useState<Resena[]>([])
    const [mensaje, setMensaje]= useState("")

    async function Recargar() {
        const respuesta=await obtenerResenas(comercio)
        if(!("error" in respuesta)) setResenas(respuesta.datos)
    }

    useEffect(()=>{
        Recargar();
    },[]);

    function mostrar(r:Respuesta<unknown>|CuerpoDeError){
        setMensaje("error" in r ? `ERROR ${r.error.codigo}: ${r.error.mensaje}` : "OK")
    }

    async function crear() {
        mostrar(
            await crearResena({comercioId:"com-104", estrellas:4, comentario:"Reseña de prueba"})
        );
        await Recargar();
    }

    async function editar(){
        const mio=resenas.find((r)=> r.usuarioId===Yo);
        if(!mio) return setMensaje("No tienes reseñas para editar")
        mostrar(await editarResena(mio.id,{estrellas:3, comentario:"Editada"}));
        await Recargar()
    }

    async function editarAjena(){
        const ajena=resenas.find((r)=> r.usuarioId !== Yo)
        if(!ajena) return setMensaje("No hay reseñas ajenas")
        mostrar(await editarResena(ajena.id,{estrellas:1, comentario:"X"}))
    }

    async function borrar(){
        const mio=resenas.find((r)=> r.usuarioId===Yo)
        if (!mio) return setMensaje("No tienes reseñas para borrar")
        mostrar(await eliminaResena(mio.id));
        await Recargar()
    }

    async function reportarAjena(){
        const ajena=resenas.find((r)=> r.usuarioId !== Yo && !r.reportada)
        if(!ajena) return setMensaje("No hay reseñas ajenas sin reportar")
        mostrar(await reportarResena(ajena.id));
        await Recargar()
    }

    async function reportarMio(){
        const mio=resenas.find((r)=> r.usuarioId===Yo)
        if(!mio) return setMensaje("No tienes reseñas");
        mostrar(await reportarResena(mio.id))
    }

    async function responderSinRespuesta(){
        const nada=resenas.find((r)=> r.respuesta===null)
        if(!nada) return setMensaje("Todas tienen respuesta")
        mostrar(await responderResena(nada.id, "Gracias por tu opinion"))
        await Recargar()    }

    async function responderYaRespondida() {
        const con = resenas.find((r) => r.respuesta !== null);
        if (!con) return setMensaje("Ninguna tiene respuesta todavía");
  mostrar(await responderResena(con.id, "Otra respuesta")); // debe fallar
}



    return(
        <ScrollView contentContainerStyle={{padding: 16, paddingTop:60}}>
            <Button title="Crear Reseña" onPress={crear}/>
            <Button title="Editar" onPress={editar}/>
            <Button title="Eliminar" onPress={borrar}/>
            <Button title="Reportar una ajena" onPress={reportarAjena} />
            <Button title="Reportar una mía (debe fallar)" onPress={reportarMio} />
            <Button title="Responder una sin respuesta" onPress={responderSinRespuesta} />
            <Button title="Responder una ya respondida (debe fallar)" onPress={responderYaRespondida} />

            <Text style={{marginVertical:16}}>Resultado: {mensaje}</Text>
            


            {resenas.map((r)=>(
                <View key={r.id} style={{marginBottom:16}}>
                    <Text>{r.estrellas} estrellas (de {r.usuarioId})</Text>
                    <Text>{r.comentario}</Text>
                    {r.respuesta!== null && <Text>Respuesta: {r.respuesta}</Text>}
                    {r.reportada && <Text>⚠ Reportada</Text>}
                </View>
            ))}        
        </ScrollView>
    )
}
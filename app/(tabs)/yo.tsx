/**import { StyleSheet, Text, View } from "react-native";

export default function Pantalla() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Yo</Text>
      <Text style={estilos.texto}>Cuenta, favoritos y avisos.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  titulo: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  texto: { fontSize: 15, textAlign: "center", opacity: 0.7 },
}); */

import { useState } from "react";
import { Button, ScrollView, Text } from "react-native";
import { iniciarSesion, registrarse, alternarFavoritos, guardarRubrosDeInteres, activarAvisos } from "@/src/servicios/usuarios";
import { CuerpoDeError, Respuesta } from "@/src/tipos";
import { Usuario } from "@/src/tipos";

export default function Usuarios(){
    const [usuario, setUsuario]=useState<Usuario|null>(null)
    const [token, setToken]=useState<string|null>(null)
    const [mensaje, setMensaje]=useState("")

    function mostrar(r:Respuesta<unknown>|CuerpoDeError){
        setMensaje("error" in r ? `ERROR ${r.error.codigo}: ${r.error.mensaje}` : "OK")
        }

    async function entrar(email:string, password:string){
        const r = await iniciarSesion(email, password);
        mostrar(r);
        if(!("error" in r)){
            setUsuario(r.datos.usuario)
            setToken(r.datos.token)
        }
    }

    async function crearCuenta(){
        const r=await registrarse({nombre:"Nuevo vecino", email:"Vecino@mail.com",password:"demo1235"});
        mostrar(r)
        if(!("error" in r)){
            setUsuario(r.datos.usuario)
            setToken(r.datos.token)
        }
    }

    async function registrarEmailRepetido() {
        mostrar(await registrarse({ nombre: "X", email: "marta@mail.com", password: "demo1234" }));
        }

    async function cambiar(
        accion: () => Promise<Respuesta<Usuario> | CuerpoDeError>) 
        {const r = await accion();
            mostrar(r);
            if (!("error" in r)) setUsuario(r.datos);
                }



    return(
        <ScrollView contentContainerStyle={{padding:16, paddingTop:60}}>
            <Button title="Entrar como marta" onPress={()=>entrar("marta@mail.com", "demo1234")}/>
            <Button title="Entrar con contraseña mala (debe fallar)" onPress={()=> entrar("marta@mail.com", "mala")}/>
            <Button title="Crear cuenta nueva" onPress={crearCuenta} />
            <Button title="Registrar email repetido (debe fallar)" onPress={registrarEmailRepetido} />

        {usuario && (
        <>
        <Button
            title="Alternar favorito com-104"
            onPress={() => cambiar(() => alternarFavoritos("com-104", usuario.favoritos.includes("com-104")))}
        />
        <Button
            title="Rubros: gastronomía y hogar"
            onPress={() =>
                cambiar(() =>
                guardarRubrosDeInteres(["rub-gastronomia", "rub-ferreteria", "rub-libreria"])
                )
            }
        />
        <Button
            title="Alternar avisos"
            onPress={() => cambiar(() => activarAvisos(!usuario.avisosActivos))}
        />
        </>
    )}

        <Text style={{ marginVertical: 16 }}>Resultado: {mensaje}</Text>
        <Text>Token: {token ?? "(sin sesión)"}</Text>
        <Text style={{ fontFamily: "monospace", marginTop: 8 }}>
        {usuario ? JSON.stringify(usuario, null, 2) : "Sin usuario"}
        </Text>
        </ScrollView>
    )
}



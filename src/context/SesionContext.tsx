import * as SecureStore from "expo-secure-store"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { iniciarSesion, registrarse, cerrarSesion, obtenerUsuarioActual } from "../servicios/usuarios"
import { Usuario } from "../tipos/usuario"

const CLAVE_TOKEN="token-sesion";
console.log("SesionContext cargado");

interface ValorSesion{
    usuario: Usuario|null;
    token:string|null;
    cargando: boolean;
    ingresar:(email:string, password:string)=>Promise<string|null>;
    crearCuenta:(nombre:string, email:string, password:string)=>Promise<string|null>
    salir:()=>Promise<void>;
    actualizarUsuario:(usuario:Usuario)=>void;
}

const SesionContext=createContext<ValorSesion|null>(null);

export function SesionProvider({children}:{children: ReactNode}){
    const [usuario, setUsuario]=useState<Usuario|null>(null)
    const [token, setToken]=useState<string|null>(null)
    const [cargando, setCargando]=useState(true)

    useEffect(()=>{
        async function existeToken(){
            try{
                const guardado=await SecureStore.getItemAsync(CLAVE_TOKEN);
                if(guardado){
                    const r = await obtenerUsuarioActual(guardado);
                    if("error" in r){
                        await SecureStore.deleteItemAsync(CLAVE_TOKEN)
                    } else{
                        setUsuario(r.datos)
                        setToken(guardado)
                    }
                }
            } finally{
                setCargando(false)
            }
        } 
        existeToken()
    },[])

    async function guardarSesion(u:Usuario, t:string){
        await SecureStore.setItemAsync(CLAVE_TOKEN, t);
        setUsuario(u)
        setToken(t)
    }

    async function ingresar(email:string, password:string){
        const r=await iniciarSesion(email, password)
        if("error" in r) return r.error.mensaje
        await guardarSesion(r.datos.usuario, r.datos.token)
        return null
    }

    async function crearCuenta(nombre:string, email:string, password:string){
        const r = await registrarse({nombre, email, password})
        if("error" in r) return r.error.mensaje
        await guardarSesion(r.datos.usuario, r.datos.token)
        return null
    }

    async function salir(){
        await cerrarSesion()
        await SecureStore.deleteItemAsync(CLAVE_TOKEN)
        setUsuario(null)
        setToken(null)
    }

    return (
    <SesionContext.Provider value={{usuario, token, cargando, ingresar, crearCuenta, salir, actualizarUsuario:setUsuario}}>
        {children}
    </SesionContext.Provider>
    )

    
}

export function useSesion(){
    const valor=useContext(SesionContext)
    if (!valor){
        throw new Error("useSesion se usa dentro de un <SesionProvider>")
    }
    return valor;
}
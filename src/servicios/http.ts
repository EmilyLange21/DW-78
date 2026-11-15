import * as SecureStore from "expo-secure-store"
import { CuerpoDeError, Respuesta } from "../tipos"

export const CLAVE_TOKEN="token-sesion"

const URL_BASE="http://localhost:3000"

export async function traerDato<T>(ruta:string, opciones:{metodo?:string; cuerpo?:unknown}={}):
    Promise<Respuesta<T>|CuerpoDeError>{
        try{
            const token=await SecureStore.getItemAsync(CLAVE_TOKEN)

            const headers: Record<string, string>={}
            if(opciones.cuerpo!==undefined) headers["Content-Type"]="application/json";
            if (token) headers.Authorization= `Bearer ${token}`

            const respuesta=await fetch(`${URL_BASE}${ruta}`, {
                method: opciones.metodo??"GET",
                headers, 
                body:opciones.cuerpo!==undefined?JSON.stringify(opciones.cuerpo):undefined,
            });

            //Delete existoso responde 204 sin cuerpo
            if(respuesta.status===204){
                return{datos:null as unknown as T, meta:null}
            }

            return (await respuesta.json())as Respuesta<T>|CuerpoDeError;
        }catch{
            return{
                error:{
                    codigo:"SIN_RED",
                    mensaje:"No pudimos conectarnos. Revisar internet e vuelve a intentar"
                }
            }
        }
    }
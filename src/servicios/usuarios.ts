import { Respuesta, CuerpoDeError } from "../tipos";
import { Usuario } from "../tipos";
import { demora, Fallo } from "./resenas";
import { traerDato } from "./http";

export interface SesionIniciada{
    usuario: Usuario;
    token: string;
}

type ResultadoUser=Respuesta<Usuario>|CuerpoDeError

const normalizarEmail=(email:string)=>email.trim().toLowerCase();

export async function iniciarSesion(email:string, password:string){
    return traerDato<SesionIniciada>("/auth/ingreso", {
        metodo:"POST",
        cuerpo: {email: normalizarEmail(email), contrasena: password},
    })
}


export async function registrarse(entrada:{nombre:string, email:string, password:string}):
    Promise<Respuesta<SesionIniciada>|CuerpoDeError>{
        await demora();

        //chequeo comun para decirle al usuario
        const nombre=entrada.nombre.trim();
        if(nombre.length===0){
            return Fallo("NOMBRE_VACIO", "Tienes que escribir el nombre");
        }
        if(entrada.password.length<8){
            return Fallo("CONTRASEÑA_CORTA", "Contraseña mas de 8 caracteres")
        }

        return traerDato<SesionIniciada>("/auth/registro",{
            metodo:"POST",
            cuerpo:{
                nombre, 
                email:normalizarEmail(entrada.email), contrasena: entrada.password
            }
        });
    }


export async function cerrarSesion(): Promise<Respuesta<null>|CuerpoDeError>{
    await demora(100);
    return{datos:null, meta:null};
}

export async function obtenerUsuarioActual(){
    return traerDato<Usuario>("/yo")
}

function agregarFavorito(comercioId:string){
    return traerDato<Usuario>(`/yo/favoritos/${comercioId}`, {metodo: "PUT"})
}

async function quitarFavorito(comercioId:string):
    Promise<ResultadoUser>{
        const r=await traerDato<null>(`/yo/favoritos/${comercioId}`,{metodo:"DELETE"});
        if("error" in r) return r
        //DELETE no devuelve usuario. Se pide nuevamente
        return obtenerUsuarioActual()
    }
    
export async function alternarFavoritos(comercioId:string,  esFavoritoNow: boolean):
    Promise<Respuesta<Usuario>|CuerpoDeError>{
            await demora(150)
            return esFavoritoNow ? quitarFavorito(comercioId) : agregarFavorito(comercioId)
    }




export async function guardarRubrosDeInteres(rubroIds: string[]){
    await demora(150);
    return traerDato<Usuario>("/yo", {
        metodo: "PATCH",
        cuerpo:{rubrosDeInteres:[...new Set(rubroIds)]}
    })
}

export async function activarAvisos(activos: boolean){
    await demora(150);
    return traerDato<Usuario>("/yo", {
        metodo:"PATCH",
        cuerpo:{avisosActivos:activos}
    })
}


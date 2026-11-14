import { Resena } from "../tipos";
import { Respuesta, CuerpoDeError } from "../tipos";
import { traerDato } from "./http";

type Estrellas = 1|2|3|4|5

export const demora = (ms = 400)=> 
    new Promise<void>((resolver)=> setTimeout(resolver, ms));

export function Fallo(codigo: string, mensaje: string): CuerpoDeError{
    return {error: {codigo, mensaje}};
}

export async function obtenerResenas(
    comercioId:string, pagina = 1) {
    await demora();

    return traerDato<Resena[]>(`/comercios/${comercioId}/resenas?pagina=${pagina}`)
}

export async function crearResena(entrada:{
    comercioId: string,
    estrellas:Estrellas
    comentario:string,
}): Promise<Respuesta<Resena> | CuerpoDeError>{
    await demora();

    const comentarioVacio = entrada.comentario.trim();
    if (comentarioVacio.length===0){
        return Fallo("COMENTARIO_VACIO", "Tienes que escribir un comentario")
    }

    return traerDato<Resena>(`/comercios/${entrada.comercioId}/resenas`,{
        metodo:"POST",
        cuerpo:{estrellas: entrada.estrellas, comentario: comentarioVacio}
    })
}

export async function editarResena(id: string, cambios:{estrellas: Estrellas; comentario:string}): Promise<Respuesta<Resena> | CuerpoDeError>{
    await demora();

    const comentarioVacio = cambios.comentario.trim();
    if (comentarioVacio.length===0){
        return Fallo("COMENTARIO_VACIO", "Tienes que escribir un comentario")
    }
    return traerDato<Resena>(`/resenas/${id}`,{
        metodo:"PATCH",
        cuerpo:{estrellas:cambios.estrellas, comentario: comentarioVacio}
    })
}

export async function eliminaResena(id: string){
        await demora();
        return traerDato<null>(`/resenas/${id}`, { metodo: "DELETE" })
    }


export async function reportarResena(id: string){
        await demora();
        return traerDato<null>(`/resenas/${id}/reportes`, { metodo: "POST" })
    }

export async function responderResena(id: string, texto:string):
    Promise<Respuesta<Resena>|CuerpoDeError>{
        await demora();

        const respuesta= texto.trim();
        if(respuesta.length===0){
            return Fallo("RESPUESTA_VACIA", "Tienes que escribir una respuesta");
        }

        return traerDato<Resena>(`/resenas/${id}/respuesta`, {
            metodo: "POST",
            cuerpo:{respuesta}
        })
    }
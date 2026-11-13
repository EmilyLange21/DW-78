import { Resena } from "../tipos";
import { resenasMock } from "../mocks/resenas";
import { Respuesta, CuerpoDeError } from "../tipos";

let resenas: Resena[]= [...resenasMock];

export const demora = (ms = 400)=> 
    new Promise<void>((resolver)=> setTimeout(resolver, ms));

export function Fallo(codigo: string, mensaje: string): CuerpoDeError{
    return {error: {codigo, mensaje}};
}

export async function obtenerResenas(
    comercioId:string): Promise<Respuesta<Resena[]> | CuerpoDeError> {
    await demora();

    const lista = resenasMock
    .filter((r) => r.comercioId === comercioId)
    .sort((a, b) => Date.parse(b.creadaEn) - Date.parse(a.creadaEn));

    return {
        datos: lista,
        meta: {total: lista.length, pagina: 1, porPagina:20}
    };
}

export async function crearResena(entrada:{
    comercioId: string,
    usuarioId: string,
    estrellas: 1|2|3|4|5,
    comentario:string,
}): Promise<Respuesta<Resena> | CuerpoDeError>{
    await demora();

    const comentarioVacio = entrada.comentario.trim();
    if (comentarioVacio.length===0){
        return Fallo("COMENTARIO_VACIO", "Tienes que escribir un comentario")
    }

    const nueva: Resena={
        id: `res-${Math.floor(Math.random()*1000)}`,
        comercioId: entrada.comercioId,
        usuarioId:entrada.usuarioId,
        estrellas: entrada.estrellas,
        comentario: entrada.comentario,
        respuesta: null, 
        reportada: false,
        creadaEn: new Date().toISOString(),
        sincronizada: false
    };

    resenas=[nueva, ...resenas];
    return {datos: nueva, meta: null}
}

export async function editarResena(id: string, usuarioId:string, cambios:{estrellas: 1|2|3|4|5; comentario:string}): Promise<Respuesta<Resena> | CuerpoDeError>{
    await demora();

    const actual=resenas.find((r)=> r.id===id);
    if(actual?.usuarioId!==usuarioId){
        return Fallo("NO_AUTORIZADO", "Solo tus reseñas puedes editar")
    }
        const comentarioVacio = cambios.comentario.trim();
    if (comentarioVacio.length===0){
        return Fallo("COMENTARIO_VACIO", "Tienes que escribir un comentario")
    }

    const actualizado: Resena={...actual!, estrellas: cambios.estrellas, comentario: cambios.comentario};
    resenas=resenas.map((r)=> (r.id===id ? actualizado : r))
    return{datos: actualizado, meta: null}
}

export async function eliminaResena(id: string, usuarioId:string):
    Promise<Respuesta<null> | CuerpoDeError>{
        await demora();

        const actual= resenas.find((r)=> r.id===id);
        if(!actual){
            return Fallo("NO_EXISTE", "Esta reseña no existe");
        }
        if(actual.usuarioId!==usuarioId){
            return Fallo("NO_AUTORIZADO", "Solo tus reseñas puedes eliminar")
        }

        resenas=resenas.filter((r)=> r.id!==id);
        return {datos:null, meta:null}
    }


export async function reportarResena(id: string, usuarioId:string):
    Promise<Respuesta<Resena> | CuerpoDeError>{
        await demora();

        const actual=resenas.find((r)=> r.id===id);
        if(!actual){
            return Fallo("RESENA_INEXISTENTE", "Esta reseña no existe");
        }
        if(actual.usuarioId===usuarioId){
            return Fallo("SIN_PERMISO", "No puedes reportar tu propia reseña");
        }
        if(actual.reportada){
            return Fallo("REPORTADA", "Esta reseña ya esta reportada")
        }

        const reportada: Resena={...actual, reportada:true};
        resenas=resenas.map((r)=> (r.id===id ? reportada:r))
        return{datos:reportada, meta:null}
    }

export async function responderResena(id: string, comercioResponde:string|null, texto:string):
    Promise<Respuesta<Resena>|CuerpoDeError>{
        await demora();

        const ahora=resenas.find((r)=> r.id===id)
        if (!ahora){
            return Fallo("RESEÑA_NO_ENCONTRADA", "Esta reseña no exite")
        }
        if(comercioResponde===null || ahora.comercioId!==comercioResponde){
            return Fallo("NO_AUTORIZADO", "Solo el comercio puede responder");
        }
        if(ahora.respuesta!==null){
            return Fallo("RESPONDIDA", "Reseña ya respondida")
        }

        const respuesta= texto.trim();
        if(respuesta.length===0){
            return Fallo("RESPUESTA_VACIA", "Tienes que escribir una respuesta");
        }

        const respondida:Resena={...ahora, respuesta};
        resenas=resenas.map((r)=> (r.id===id ? respondida:r));
        return{datos:respondida, meta:null};
    }
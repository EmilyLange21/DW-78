import { usuariosMock, credencialesMock } from "../mocks/usuarios";
import { Respuesta, CuerpoDeError } from "../tipos";
import { Usuario } from "../tipos";
import { demora, Fallo } from "./resenas";

export interface SesionIniciada{
    usuario: Usuario;
    token: string;
}

let usuarios: Usuario[]=[...usuariosMock]
const credenciales: Record<string, string>={...credencialesMock}

const normalizarEmail=(email:string)=>email.trim().toLowerCase();

const crearToken=(usuarioId:string)=>`token-${usuarioId}`;

export async function iniciarSesion(email:string, password:string):
    Promise<Respuesta<SesionIniciada>|CuerpoDeError>{
        await demora()

        const correo=normalizarEmail(email);
        const usuario=usuarios.find((u)=> u.email===correo)

        if(!usuario||credenciales[correo]!== password){
            return Fallo("CREDENCIALES_INVALIDAS", "Datos Incorrectos")
        }

        return{datos:{usuario, token: crearToken(usuario.id)},
            meta: null,};
    }

export async function registrarse(entrada:{nombre:string, email:string, password:string}):
    Promise<Respuesta<SesionIniciada>|CuerpoDeError>{
        await demora();

        const nombre=entrada.nombre.trim();
        const correo=normalizarEmail(entrada.email);

        if(nombre.length===0){
            return Fallo("NOMBRE_VACIO", "Tienes que escribir el nombre");
        }
        if(!correo.includes("@")||!correo.includes(".")){
            return Fallo("EMAIL_INVALIDO", "Email no es valido")
        }
        if(entrada.password.length<6){
            return Fallo("CONTRASEÑA_CORTA", "Contraseña mas de 6 caracteres")
        }
        if(usuarios.some((u)=>u.email===correo)){
            return Fallo("EMAIL_EXISTENTE", "El email esta registrado")
        }

        const nuevo:Usuario={
            id:`usr-${Date.now()}`,
            nombre,
            email:correo, 
            rol:"vecino",
            comercioId:null, 
            favoritos:[], 
            rubrosDeInteres:[],
            avisosActivos:true,
        }

        usuarios=[...usuarios, nuevo];
        credenciales[correo]=entrada.password;

        return{datos:{usuario:nuevo, token:crearToken(nuevo.id)}, meta:null}
    }


export async function cerrarSesion(): Promise<Respuesta<null>|CuerpoDeError>{
    await demora(100);
    return{datos:null, meta:null};
}

export async function obtenerUsuarioActual(token:string):
    Promise <Respuesta<Usuario>|CuerpoDeError>{
        await demora()

        const usuario=usuarios.find((u)=>crearToken(u.id)===token);
        if(!usuario){
            return Fallo("SESION_TERMINADA","Sesion vencida. Volve a ingresar");
        }
        return {datos:usuario, meta:null};
    }

function actualizarUsuario(id:string, cambiar:(u:Usuario)=>Usuario):
    Respuesta<Usuario>|CuerpoDeError{
        const actual=usuarios.find((u)=>u.id===id);
        if(!actual){
            return Fallo("USUARIO_NO_ENCONTRADO", "Usuario no existe");
        }
        const nuevo=cambiar(actual);
        usuarios=usuarios.map((u)=>(u.id===id?nuevo:u));
        return{datos:nuevo, meta:null}
    }

export async function alternarFavoritos(usuarioId:string, comercioId:string):
    Promise<Respuesta<Usuario>|CuerpoDeError>{
        await demora(150)
        return actualizarUsuario(usuarioId, (u)=>({...u, favoritos:u.favoritos.includes(comercioId)?u.favoritos.filter((f)=>f!=comercioId):[...u.favoritos, comercioId]}))
    }

export async function guardarRubrosDeInteres(usuarioId: string, rubroIds: string[]): Promise<Respuesta<Usuario> | CuerpoDeError> {
    await demora(150);
    return actualizarUsuario(usuarioId, (u) => ({
    ...u,
    rubrosDeInteres: [...new Set(rubroIds)], // sin repetidos
    }));
}

export async function activarAvisos(usuarioId:string, activos: boolean): Promise<Respuesta<Usuario>|CuerpoDeError>{
    await demora(150);
    return actualizarUsuario(usuarioId, (u)=>({...u, avisosActivos:activos}))
}


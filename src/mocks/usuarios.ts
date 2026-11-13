import { Usuario } from "../tipos";

export const usuariosMock: Usuario[]=[
    {   "id": "usr-512", 
        "nombre": "Marta Giménez", 
        "email": "marta@mail.com",
        "rol": "vecino", 
        "comercioId": null, 
        "favoritos": ["com-118"],
        "rubrosDeInteres": ["rub-ferreteria"], 
        "avisosActivos": true 
    },
    {   "id": "usr-514", 
        "nombre": "Jose Jiménez", 
        "email": "Jose@mail.com",
        "rol": "comercio", 
        "comercioId": null, 
        "favoritos": [],
        "rubrosDeInteres": [], 
        "avisosActivos": false 
    },
    {   "id": "usr-516", 
        "nombre": "Supermercado La Esquina", 
        "email": "mercado@mail.com",
        "rol": "comercio", 
        "comercioId": "com-118", 
        "favoritos": [],
        "rubrosDeInteres": [], 
        "avisosActivos": true 
    }
];

export const credencialesMock: Record<string, string>={
    "marta@mail.com": "123456",
    "Jose@mail.com":"abcdef",
    "mercado@mail.com":"1a2b3c"
};
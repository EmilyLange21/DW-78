import { Resena } from "../tipos";

export const resenasMock: Resena[]=[
    {
        "id": "res-1", 
        "comercioId": "com-118", 
        "usuarioId": "usr-512",
        "estrellas": 5, 
        "comentario": "Tenían el tornillo raro que no conseguía en ningún lado.",
        "respuesta": "¡Gracias Marta! Siempre a las órdenes.",
        "reportada": false, 
        "creadaEn": "2026-09-10T17:05:00-03:00",
        "sincronizada": true
    },
    {
        "id": "res-2", 
        "comercioId": "com-118", 
        "usuarioId": "usr-515",
        "estrellas": 3, 
        "comentario": "Poca amabilidad del personal",
        "respuesta": "",
        "reportada": false, 
        "creadaEn": "2026-09-10T17:05:00-03:00",
        "sincronizada": true
    },
    {
        "id": "res-3", 
        "comercioId": "com-118", 
        "usuarioId": "usr-515",
        "estrellas": 3, 
        "comentario": "Chacha",
        "respuesta": "??",
        "reportada": true, 
        "creadaEn": "2026-09-10T17:05:00-03:00",
        "sincronizada": true
    },
];
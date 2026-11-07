// La dirección de la API sale de EXPO_PUBLIC_API_URL (archivo .env, que NO se sube a git).
// Copiá .env.example a .env y poné la IP de tu compu.
const url = process.env.EXPO_PUBLIC_API_URL;

if (!url) {
  throw new Error(
    "Falta EXPO_PUBLIC_API_URL. Copiá .env.example a .env, poné la IP de tu compu y reiniciá Expo con `npx expo start -c`.",
  );
}

export const API_URL = url.replace(/\/+$/, "");

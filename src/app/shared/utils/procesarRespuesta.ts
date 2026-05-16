import { AppError } from './error.utils';

export function procesarRespuestaUnica<T>(resp: any, clave: string): T {
    const valor = resp.data;
    if (!valor) {
        throw new AppError(`${clave}_respuesta_invalida`, { clave });
    }
    return valor as T;
}

export function procesarRespuestaArray<T>(resp: any, clave: string): T[] {
    const valor = resp.data;
    if (!Array.isArray(valor)) {
        throw new AppError(`${clave}_respuesta_invalida`, { clave });
    }
    return valor as T[];
}

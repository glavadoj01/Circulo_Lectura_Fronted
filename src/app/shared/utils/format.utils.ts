import { valorNumeroSeguro } from './validation.utils';

/**
 * Normaliza un valor de puntuación a un número entre 0 y 5.
 * Si el valor no es un número finito, se devuelve 0.
 * Si el valor es menor que 0, se devuelve 0.
 * Si el valor es mayor que 5, se devuelve 5.
 * @param valor El valor a normalizar.
 * @returns El valor normalizado entre 0 y 5.
 */
export function normalizarPuntuacion(valor: unknown): number {
    const num = valorNumeroSeguro(valor);

    return Math.max(0, Math.min(5, num));
}

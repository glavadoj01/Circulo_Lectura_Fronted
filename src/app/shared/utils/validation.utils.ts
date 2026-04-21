/**
 * Convierte un valor desconocido a una cadena de texto segura.
 * Si el valor es una cadena, se devuelve la cadena sin espacios al principio y al final.
 * Si el valor es un número finito, se convierte a cadena y se devuelve.
 * En cualquier otro caso, se devuelve una cadena vacía.
 * @param valor Valor a convertir a texto seguro.
 * @returns Cadena de texto segura.
 */
export function valorTextoSeguro(valor: unknown): string {
    if (typeof valor === 'string') {
        const limpio = valor.trim();
        return limpio.length > 0 ? limpio : '';
    }
    if (typeof valor === 'number' && Number.isFinite(valor)) {
        return String(valor);
    }
    return '';
}

/**
 * Verifica si un valor es un número finito y lo devuelve, o devuelve 0 si no es un número válido.
 * @param valor Valor a validar como número seguro.
 * @returns Número seguro o 0 si el valor no es un número finito.
 */
export function valorNumeroSeguro(valor: unknown): number {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
        return valor;
    }
    if (typeof valor === 'string' && valor.trim().length > 0 && !Number.isNaN(Number(valor))) {
        return Number(valor);
    }
    return 0;
}

/**
 * Valida si un valor es un número finito o una cadena que representa un número, y devuelve su representación en texto.
 * Si el valor es un número finito, se convierte a cadena y se devuelve.
 * Si el valor es una cadena que representa un número, se devuelve la cadena sin espacios al principio y al final.
 * En cualquier otro caso, se devuelve una cadena vacía.
 * @param valor Valor a validar como número o cadena numérica segura.
 * @returns Número en formato de texto seguro o una cadena vacía si el valor no es válido.
 */
export function valorNumeroTextoSeguro(valor: unknown): string {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
        return String(valor);
    } else if (typeof valor === 'string') {
        const limpio = valor.trim();
        return limpio.length > 0 && !Number.isNaN(Number(limpio)) ? limpio : '';
    }
    return '';
}

/**
 * Valida y procesa un array de autores.
 * @param autores Array de objetos que representan autores.
 * @returns Array de objetos con los nombres de los autores validados y limpios.
 */
export function validarAutores(
    autores: unknown,
): Array<{ nombre_autor: string; apellido_autor: string; id_autor: number }> {
    if (!Array.isArray(autores)) {
        return [];
    }
    return autores
        .filter(
            (item) =>
                item &&
                (typeof item.nombre_autor === 'string' ||
                    (typeof item.nombre_autor === 'object' &&
                        typeof item.nombre_autor.nombre_autor === 'string')) &&
                (typeof item.apellido_autor === 'string' ||
                    (typeof item.apellido_autor === 'object' &&
                        typeof item.apellido_autor.apellido_autor === 'string')) &&
                typeof item.id_autor === 'number' &&
                Number.isFinite(item.id_autor),
        )
        .map((item) => ({
            nombre_autor:
                typeof item.nombre_autor === 'string'
                    ? item.nombre_autor.trim()
                    : item.nombre_autor.nombre_autor.trim(),
            apellido_autor:
                typeof item.apellido_autor === 'string'
                    ? item.apellido_autor.trim()
                    : item.apellido_autor.apellido_autor.trim(),
            id_autor: item.id_autor,
        }));
}

/**
 * Valida y procesa un array de géneros.
 * @param generos Array de objetos que representan géneros.
 * @returns Array de objetos con los nombres de los géneros validados y limpios.
 */
export function validarGeneros(generos: unknown): Array<{ nombre_genero: string }> {
    if (!Array.isArray(generos)) {
        return [];
    }
    return generos
        .filter(
            (item) =>
                item &&
                (typeof item.nombre_genero === 'string' ||
                    (typeof item.nombre_genero === 'object' &&
                        typeof item.nombre_genero.nombre_genero === 'string')),
        )
        .map((item) => ({
            nombre_genero:
                typeof item.nombre_genero === 'string'
                    ? item.nombre_genero.trim()
                    : item.nombre_genero.nombre_genero.trim(),
        }));
}

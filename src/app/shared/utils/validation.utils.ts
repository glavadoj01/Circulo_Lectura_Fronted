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

export function validarAutores(autores: unknown): Array<{ nombre_autor: string }> {
    if (!Array.isArray(autores)) {
        return [];
    }
    return autores
        .filter((item) => item && typeof item.nombre_autor === 'string')
        .map((item) => ({
            nombre_autor: item.nombre_autor.trim(),
        }));
}

export function validarGeneros(generos: unknown): Array<{ nombre_genero: string }> {
    if (!Array.isArray(generos)) {
        return [];
    }
    return generos
        .filter((item) => item && typeof item.nombre_genero === 'string')
        .map((item) => ({
            nombre_genero: item.nombre_genero.trim(),
        }));
}

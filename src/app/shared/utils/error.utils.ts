import { HttpErrorResponse } from '@angular/common/http';

/**
 * Clase de error personalizada para la aplicación, que extiende la clase nativa Error.
 * Permite incluir metadatos adicionales sobre el error para facilitar su manejo y depuración.
 * - `meta`: Propiedad opcional que puede contener información adicional relevante al error (ej. detalles de la solicitud, contexto, etc.).
 * - El constructor acepta un mensaje de error y un objeto de metadatos opcional, y asegura que la instancia se comporte correctamente como un Error nativo.
 * Ejemplo de uso:
 * ```typescript
 * throw new AppError('campo_faltante', { campo: 'nombre' });
 * ```
 */
export class AppError extends Error {
    public readonly meta?: unknown;
    constructor(message: string, meta?: unknown) {
        super(message);
        this.name = 'AppError';
        this.meta = meta;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Interfaz que define la estructura de la respuesta de error que se devuelve al manejar un error con la función `manejarError`.
 * - `status`: Código de estado HTTP asociado al error (si aplica), o -1 para errores no HTTP.
 * - `codigo`: Código de error estandarizado que se puede usar para identificar el tipo de error (ej. 'campo_faltante', 'HTTP_404').
 * - `mensaje`: Mensaje de error amigable para mostrar en la UI, basado en el código de error.
 * - `origen`: Contexto o componente donde ocurrió el error (ej. 'CatalogoComponent', 'DetalleLibroService').
 * - `meta`: Información adicional relevante al error, que puede incluir detalles específicos del error para facilitar su manejo en la UI.
 * - `original`: El error original que fue manejado, para referencia o depuración adicional.
 */
export interface RespuestaError {
    status: number;
    codigo: string;
    mensaje: string;
    origen?: string;
    meta?: unknown;
    original?: unknown;
}

const Errores_Http: Record<string, string> = {
    HTTP_404: 'Recurso no encontrado (404).',
    HTTP_400: 'Solicitud inválida (400).',
    HTTP_500: 'Error interno del servidor (500).',
};

const Errores_Cache: Record<string, string> = {
    catalogo_cache_no_window: 'No hay objeto window disponible (SSR o entorno no navegador).',
    catalogo_cache_parse: 'Error al procesar la caché del catálogo.',
    catalogo_cache_guardar: 'Error al guardar la caché del catálogo.',
};

const Errores_App: Record<string, string> = {};

/**
 * Constante que define un mapa de códigos de error a mensajes de error amigables para mostrar en la UI.
 * - Las claves del objeto son códigos de error estandarizados (ej. 'campo_faltante', 'HTTP_404').
 * - Los valores son mensajes de error descriptivos que se pueden mostrar al usuario.
 * - Este mapa se utiliza en la función `manejarError` para traducir códigos de error a mensajes legibles.
 */
export const MENSAJES_ERROR: Record<string, string> = {
    ...Errores_Http,
    ...Errores_App,
    ...Errores_Cache,
    campo_faltante: 'Falta un campo obligatorio.',
    id_invalido: 'El identificador proporcionado no es válido.',
    libro_respuesta_invalida: 'La respuesta del libro es inválida o faltan campos obligatorios.',
    catalogo_error_carga: 'Error al cargar el catálogo de libros.',
    catalogo_error_pagina: 'Error al cargar la página de libros.',
    detallelibro_id_invalido: 'ID de libro inválido recibido en la ruta.',

    error_desconocido: 'Ha ocurrido un error inesperado.',
    default: 'Ha ocurrido un error.',
};

/**
 * Tipo que representa los códigos de error definidos en el mapa `MENSAJES_ERROR`, para asegurar que solo se usen códigos de error válidos en la aplicación.
 * - Este tipo se puede usar en la función `manejarError` y en cualquier lugar donde se necesite referenciar un código de error, para garantizar que solo se usen códigos definidos en `MENSAJES_ERROR`.
 */
export type CodigoError = keyof typeof MENSAJES_ERROR;

/**
 * Maneja errores de manera centralizada y homogénea
 * - Log detallado en consola para facilitar debugging.
 * - Formateo robusto para distintos tipos de error (HTTP, AppError, Error genérico, string).
 * - Devuelve un objeto con información estructurada del error para su uso en la UI.
 * @param error Error a manejar, puede ser de distintos tipos (HttpErrorResponse, AppError, Error genérico, string).
 * @param origen Elemento o contexto donde ocurrió el error (ej. 'CatalogoComponent', 'DetalleLibroService').
 * @param meta Metadatos adicionales sobre el error.
 * @returns Objeto con información estructurada del error.
 */
export function manejarError(error: unknown, origen: string, meta?: unknown): RespuestaError {
    console.error(`[${origen}]`, error, meta);

    // Formateo default para errores desconocidos (Type != AppError, HttpErrorResponse, Error, string)
    let status = -1;
    let codigo = 'error_desconocido';
    let mensaje = MENSAJES_ERROR['error_desconocido'];
    meta = meta ?? {};

    if (error instanceof HttpErrorResponse) {
        status = error.status;
        codigo = `HTTP_${error.status}`;
        mensaje = MENSAJES_ERROR[codigo] || error.message || MENSAJES_ERROR['default'];
    } else if (error instanceof AppError) {
        const cod = (error.message || '').toLowerCase();
        if (MENSAJES_ERROR[cod]) {
            codigo = cod;
            mensaje = MENSAJES_ERROR[cod];
        } else {
            (meta as any).detalle = error.message;
        }
        if (error.meta) Object.assign(meta as any, error.meta);
    } else if (error instanceof Error) {
        const cod = (error.message || '').toLowerCase();
        if (MENSAJES_ERROR[cod]) {
            codigo = cod;
            mensaje = MENSAJES_ERROR[cod];
        } else {
            (meta as any).detalle = error.message;
        }
    } else if (typeof error === 'string') {
        const cod = error.toLowerCase();
        if (MENSAJES_ERROR[cod]) {
            codigo = cod;
            mensaje = MENSAJES_ERROR[cod];
        } else {
            (meta as any).detalle = error;
        }
    }
    return {
        status,
        codigo,
        mensaje,
        origen,
        meta,
        original: error,
    };
}

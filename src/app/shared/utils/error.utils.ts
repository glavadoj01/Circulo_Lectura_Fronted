import { HttpErrorResponse } from '@angular/common/http';

export class AppError extends Error {
    public readonly meta?: unknown;
    constructor(message: string, meta?: unknown) {
        super(message);
        this.name = 'AppError';
        this.meta = meta;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export interface RespuestaError {
    status: number;
    codigo: string;
    mensaje: string;
    origen?: string;
    meta?: unknown;
    original?: unknown;
}

// Mensajes de error centralizados
export const MENSAJES_ERROR: Record<string, string> = {
    campo_faltante: 'Falta un campo obligatorio.',
    id_invalido: 'El identificador proporcionado no es válido.',
    libro_respuesta_invalida: 'La respuesta del libro es inválida o faltan campos obligatorios.',
    catalogo_error_carga: 'Error al cargar el catálogo de libros.',
    catalogo_error_pagina: 'Error al cargar la página de libros.',
    detallelibro_id_invalido: 'ID de libro inválido recibido en la ruta.',
    catalogo_cache_window: 'No hay objeto window disponible (SSR o entorno no navegador).',
    catalogo_cache_parse: 'Error al procesar la caché del catálogo.',
    HTTP_404: 'Recurso no encontrado (404).',
    HTTP_400: 'Solicitud inválida (400).',
    HTTP_500: 'Error interno del servidor (500).',
    error_desconocido: 'Ha ocurrido un error inesperado.',
    default: 'Ha ocurrido un error.',
};

// Manejo unificado: loguea, formatea y homogeneiza cualquier error
export function manejarError(error: unknown, origen: string, meta?: unknown): RespuestaError {
    // 1. Log detallado
    console.error(`[${origen}]`, error, meta);
    // 2. Formateo homogéneo y robusto
    let status = -1;
    let codigo = 'error_desconocido';
    let mensaje = MENSAJES_ERROR['error_desconocido'];

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
            meta = { ...(meta ?? {}), detalle: error.message };
        }
        if (error.meta) meta = { ...(meta ?? {}), ...(error.meta as object) };
    } else if (error instanceof Error) {
        const cod = (error.message || '').toLowerCase();
        if (MENSAJES_ERROR[cod]) {
            codigo = cod;
            mensaje = MENSAJES_ERROR[cod];
        } else {
            meta = { ...(meta ?? {}), detalle: error.message };
        }
    } else if (typeof error === 'string') {
        const cod = error.toLowerCase();
        if (MENSAJES_ERROR[cod]) {
            codigo = cod;
            mensaje = MENSAJES_ERROR[cod];
        } else {
            meta = { ...(meta ?? {}), detalle: error };
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

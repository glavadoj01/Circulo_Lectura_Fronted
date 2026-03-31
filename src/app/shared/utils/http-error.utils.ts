import { HttpErrorResponse } from '@angular/common/http';

interface ThrowMappedHttpErrorOptions {
    context: string;
    statusErrorPrefix: string;
    unknownErrorCode: string;
    meta?: unknown;
}

export function throwMappedHttpError(
    error: unknown,
    { context, statusErrorPrefix, unknownErrorCode, meta }: ThrowMappedHttpErrorOptions,
): never {
    if (error instanceof HttpErrorResponse) {
        if (typeof meta !== 'undefined') {
            console.error(context, error.status, meta);
        } else {
            console.error(context, error.status);
        }
        throw new Error(`${statusErrorPrefix}_${error.status}`);
    }

    if (typeof meta !== 'undefined') {
        console.error(`${context} (desconocido)`, meta);
    } else {
        console.error(`${context} (desconocido)`);
    }
    throw new Error(unknownErrorCode);
}

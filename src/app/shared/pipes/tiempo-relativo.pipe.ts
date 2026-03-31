import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tiempoRelativo',
})
export class TiempoRelativoPipe implements PipeTransform {
    transform(value: string | Date | null | undefined): string {
        const fechaConvertida = this.parseFechaFlexible(value ?? undefined);
        if (!fechaConvertida) return 'Fecha invalida';

        const ahora = new Date();
        const diferenciaMs = ahora.getTime() - fechaConvertida.getTime();
        if (diferenciaMs <= 0) return 'Hace un momento';

        const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
        if (diferenciaMinutos < 1) return 'Hace un momento';
        if (diferenciaMinutos < 60) {
            return `Hace ${diferenciaMinutos} minuto${diferenciaMinutos > 1 ? 's' : ''}`;
        }

        const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
        if (diferenciaHoras < 24) {
            return `Hace ${diferenciaHoras} hora${diferenciaHoras > 1 ? 's' : ''}`;
        }

        const diferenciaDias = Math.floor(diferenciaHoras / 24);
        if (diferenciaDias < 30) {
            return `Hace ${diferenciaDias} dia${diferenciaDias > 1 ? 's' : ''}`;
        }

        const diferenciaMeses = Math.floor(diferenciaDias / 30);
        if (diferenciaMeses < 12) {
            return `Hace ${diferenciaMeses} mes${diferenciaMeses > 1 ? 'es' : ''}`;
        }

        const diferenciaAnios = Math.floor(diferenciaMeses / 12);
        return `Hace ${diferenciaAnios} anio${diferenciaAnios > 1 ? 's' : ''}`;
    }

    private parseFechaFlexible(fecha: Date | string | undefined): Date | null {
        if (!fecha) {
            return null;
        }

        if (fecha instanceof Date) {
            return Number.isNaN(fecha.getTime()) ? null : fecha;
        }

        if (typeof fecha !== 'string') {
            return null;
        }

        const valor = fecha.trim();
        if (!valor) {
            return null;
        }

        const isoLike = valor.includes(' ') ? valor.replace(' ', 'T') : valor;
        const normalizado = /^\d{4}-\d{2}-\d{2}$/.test(isoLike) ? `${isoLike}T00:00:00` : isoLike;

        const fechaConvertida = new Date(normalizado);
        return Number.isNaN(fechaConvertida.getTime()) ? null : fechaConvertida;
    }
}

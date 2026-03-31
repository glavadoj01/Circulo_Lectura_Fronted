import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'puntuacionTexto',
})
export class PuntuacionTextoPipe implements PipeTransform {
    transform(value: unknown, digits = 1): string {
        // Convierte a número y valida
        const num = Number(value);
        
        // Si no es número válido, retorna "0" con los dígitos especificados
        if (!Number.isFinite(num)) {
            return (0).toFixed(Math.max(0, digits));
        }
        
        // Redondea el número según los dígitos pedidos
        const digitsSeguro = Math.max(0, Math.floor(digits));
        return num.toFixed(digitsSeguro);
    }
}

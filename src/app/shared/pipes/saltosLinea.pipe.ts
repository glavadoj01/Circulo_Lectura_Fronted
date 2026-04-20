import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'linebreaks' })
export class saltosLinea implements PipeTransform {
    transform(value: string): string {
        return value ? value.replace(/\n/g, '<br><br>') : '';
    }
}

import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'linebreaks' })
export class SaltosLinea implements PipeTransform {
    transform(value: string): string {
        return value ? value.replaceAll('\n', '<br><br>') : '';
    }
}

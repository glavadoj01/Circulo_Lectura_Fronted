import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { UsuarioCompleto } from '@interfaces/modelosApp/modelosApp';
import { TiempoRelativoPipe } from '@app/shared/pipes/tiempo-relativo.pipe';

@Component({
    selector: 'usuario-card',
    imports: [TiempoRelativoPipe],
    templateUrl: './usuario-card.html',
})
export class UsuarioCard {
    usuario = input.required<Partial<UsuarioCompleto>>();
    private readonly router = inject(Router);

    cambiarUsuario(id: string | number) {
        const idNum = Number(id);
        if (!Number.isFinite(idNum) || idNum <= 0) return;

        this.router.navigate(['/perfil-usuario', idNum]);
    }
}

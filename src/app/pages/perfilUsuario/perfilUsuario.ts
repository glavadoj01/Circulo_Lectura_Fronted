import { Component, inject, signal } from '@angular/core';
import { UsuarioCompleto } from '@app/interfaces/modelosApp/modelosApp';
import { ServicioUsuario } from '@app/services/servicioUsuario/servicioUsuario';
import { UsuarioCard } from '@app/shared/components/usuario-card/usuario-card';
import { ListaCardComponent } from '@app/shared/components/lista-card/lista-card';
import { ComentarioExistente } from '@app/shared/components/comentarioExistente/comentarioExistente';
import { LibroCard } from '@app/shared/components/libro-card/libro-card';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-perfil-usuario',
    imports: [UsuarioCard, ListaCardComponent, ComentarioExistente, LibroCard, RouterLink],
    templateUrl: './perfilUsuario.html',
})
export class PerfilUsuario {
    private readonly usuarioSrv = inject(ServicioUsuario);
    private readonly route = inject(ActivatedRoute);

    readonly idUsuario = signal<number>(1);
    readonly usuario = signal<Partial<UsuarioCompleto>>({
        id_usuario: 1,
        nombre_usuario: '',
        email_usuario: '',
        librosLeidos: [],
        librosPendientes: [],
        listasCreadas: [],
        listasSeguidas: [],
        eventosCreados: [],
        eventosAsistidos: [],
        criticas: [],
        avatarUrl: '',
    });

    tabActiva = signal<'listas' | 'criticas' | 'eventos' | 'libros'>('libros');

    constructor() {
        this.route.paramMap.subscribe((params) => {
            const id = Number(params.get('id'));
            if (Number.isFinite(id)) {
                this.idUsuario.set(id);
                this.cargarPerfil(id);
            }
        });
    }

    private cargarPerfil(id: number) {
        forkJoin({
            base: this.usuarioSrv.getUsuarioCompleto(id),
            leidos: this.usuarioSrv.getLibrosLeidos(id),
            pendientes: this.usuarioSrv.getLibrosPendientes(id),
            listasCreadas: this.usuarioSrv.getListasCreadas(id),
            listasSeguidas: this.usuarioSrv.getListasSeguidas(id),
            criticas: this.usuarioSrv.getCriticas(id),
            eventosCreados: this.usuarioSrv.getEventosCreados(id),
            eventosAsistidos: this.usuarioSrv.getEventosAsistidos(id),
        }).subscribe((r) => {
            const avatarUrl = ServicioUsuario.avatarUsuario(r.base.id_usuario);

            this.usuario.set({
                ...r.base,
                avatarUrl,
                librosLeidos: r.leidos,
                librosPendientes: r.pendientes,
                listasCreadas: r.listasCreadas,
                listasSeguidas: r.listasSeguidas,
                criticas: r.criticas,
                eventosCreados: r.eventosCreados,
                eventosAsistidos: r.eventosAsistidos,
            });
        });
    }
}

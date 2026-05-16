import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioCatalogoEventos } from '@services/servicioEventos/servicioCatalogoEventos';
import { EventoResumen } from '@interfaces/modelosApp/modelosApp';
import { EventoCardComponent } from '@sharedComponents/evento-card/evento-card';
import { EventoPasadoCardComponent } from '@sharedComponents/evento-pasado-card/evento-pasado-card';
import { BannerCargando } from '@sharedComponents/banner-cargando/banner-cargando';
import { BannerError } from '@sharedComponents/banner-error/banner-error';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-eventos',
    imports: [
        CommonModule,
        FormsModule,
        EventoCardComponent,
        EventoPasadoCardComponent,
        BannerCargando,
        BannerError,
        RouterLink,
    ],
    templateUrl: './eventos.html',
    providers: [ServicioCatalogoEventos],
})
export class Eventos {
    // Estado para eventos próximos
    eventosProximos = signal<EventoResumen[]>([]);
    totalEventosProximos = signal<number>(0);
    paginaProximos = signal<number>(1);
    busquedaProximos = signal<string>('');
    errorProximos = signal<boolean>(false);
    cargandoProximos = signal<boolean>(false);
    readonly pageSizeProximos = 6;

    // Estado para eventos pasados
    eventosPasados = signal<EventoResumen[]>([]);
    totalEventosPasados = signal<number>(0);
    paginaPasados = signal<number>(1);
    busquedaPasados = signal<string>('');
    errorPasados = signal<boolean>(false);
    cargandoPasados = signal<boolean>(false);
    readonly pageSizePasados = 4;

    constructor(private readonly catalogoEventos: ServicioCatalogoEventos) {
        try {
            this.cargarEventosProximos();
            this.cargarEventosPasados();
        } catch (error) {
            console.error('[CatalogoEventos] Error al inicializar los eventos:', error);
        }
    }

    cargarEventosProximos(): void {
        this.cargandoProximos.set(true);
        console.log(
            '[CatalogoEventos] Cargando eventos próximos. Página:',
            this.paginaProximos(),
            'Búsqueda:',
            this.busquedaProximos(),
        );
        this.catalogoEventos.getEventosProximos(this.busquedaProximos()).subscribe({
            next: (eventos) => {
                console.log('[CatalogoEventos] Eventos próximos recibidos del servicio:', eventos);
                this.eventosProximos.set(eventos);
                this.cargandoProximos.set(false);
                console.log('[CatalogoEventos] Eventos próximos recibidos del servicio:', eventos);
            },
            error: (err) => {
                console.error('[CatalogoEventos] Error al cargar eventos próximos:', err);
                this.cargandoProximos.set(false);
                this.errorProximos.set(true);
            },
        });
        this.catalogoEventos.getTotalEventosProximos(this.busquedaProximos()).subscribe({
            next: (total) => this.totalEventosProximos.set(total),
            error: (err) =>
                console.error(
                    '[CatalogoEventos] Error al obtener el total de eventos próximos:',
                    err,
                ),
        });
    }

    cargarEventosPasados(): void {
        this.cargandoPasados.set(true);
        this.catalogoEventos
            .getEventosPasados(this.busquedaPasados(), this.paginaPasados(), this.pageSizePasados)
            .subscribe({
                next: (eventos) => {
                    console.log(
                        '[CatalogoEventos] Eventos pasados recibidos del servicio:',
                        eventos,
                    );
                    this.eventosPasados.set(eventos);
                    this.cargandoPasados.set(false);
                },
                error: (err) => {
                    console.error('[CatalogoEventos] Error al cargar eventos pasados:', err);
                    this.cargandoPasados.set(false);
                    this.errorPasados.set(true);
                },
            });
        this.catalogoEventos.getTotalEventosPasados(this.busquedaPasados()).subscribe({
            next: (total) => this.totalEventosPasados.set(total),
            error: (err) =>
                console.error(
                    '[CatalogoEventos] Error al obtener el total de eventos pasados:',
                    err,
                ),
        });
    }

    buscarProximos(): void {
        this.paginaProximos.set(1);
        this.cargarEventosProximos();
    }

    buscarPasados(): void {
        this.paginaPasados.set(1);
        this.cargarEventosPasados();
    }

    cambiarPaginaProximos(p: number): void {
        this.paginaProximos.set(p);
        this.cargarEventosProximos();
    }

    cambiarPaginaPasados(p: number): void {
        this.paginaPasados.set(p);
        this.cargarEventosPasados();
    }
}

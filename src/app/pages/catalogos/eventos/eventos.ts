import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ServicioCatalogoEventos } from "@Services/servicioEventos/servicioCatalogoEventos";
import { EventoResumen } from "@Interfaces/modelosApp/modelosApp";
import { EventoCardComponent } from "@sharedComponents/evento-card/evento-card";
import { EventoPasadoCardComponent } from "@sharedComponents/evento-pasado-card/evento-pasado-card";
import { BannerCargando } from "@sharedComponents/banner-cargando/banner-cargando";
import { BannerError } from "@sharedComponents/banner-error/banner-error";

@Component({
	selector: "app-eventos",
	imports: [CommonModule, FormsModule, EventoCardComponent, EventoPasadoCardComponent, BannerCargando, BannerError],
	templateUrl: "./eventos.html",
	providers: [ServicioCatalogoEventos],
})
export class Eventos {
	busqueda = signal<string>("");
	// Estado para eventos próximos
	eventosProximos = signal<EventoResumen[]>([]);
	totalEventosProximos = signal<number>(0);
	totalPaginasProximos = signal<number>(1);
	paginaProximos = signal<number>(1);
	errorProximos = signal<boolean>(false);
	cargandoProximos = signal<boolean>(false);
	readonly pageSizeProximos = 4;

	// Estado para eventos pasados
	eventosPasados = signal<EventoResumen[]>([]);
	totalEventosPasados = signal<number>(0);
	totalPaginasPasados = signal<number>(1);
	paginaPasados = signal<number>(1);
	busquedaPasados = signal<string>("");
	errorPasados = signal<boolean>(false);
	cargandoPasados = signal<boolean>(false);
	readonly pageSizePasados = 2;

	constructor(private readonly catalogoEventos: ServicioCatalogoEventos) {
		try {
			// Inicializar páginas desde el cache del servicio (independientes por tipo)
			this.paginaProximos.set(this.catalogoEventos.getPaginaCatalogoActual("proximos"));
			this.paginaPasados.set(this.catalogoEventos.getPaginaCatalogoActual("pasados"));

			this.cargarEventosProximos();
			this.cargarEventosPasados();
		} catch (error) {
			console.error("[CatalogoEventos] Error al inicializar los eventos:", error);
		}
	}

	cargarEventosProximos(): void {
		this.cargandoProximos.set(true);
		console.log(
			"[CatalogoEventos] Cargando eventos próximos. Página:",
			this.paginaProximos(),
			"Búsqueda:",
			this.busqueda(),
		);
		this.catalogoEventos
			.getEventos("proximos", this.busqueda(), this.paginaProximos(), this.pageSizeProximos)
			.subscribe({
				next: eventos => {
					console.log("[CatalogoEventos] Eventos próximos recibidos del servicio:", eventos);
					this.eventosProximos.set(eventos);
					this.cargandoProximos.set(false);
				},
				error: err => {
					console.error("[CatalogoEventos] Error al cargar eventos próximos:", err);
					this.cargandoProximos.set(false);
					this.errorProximos.set(true);
				},
			});
		this.catalogoEventos.getTotalEventos("proximos", this.busqueda()).subscribe({
			next: total => {
				this.totalEventosProximos.set(total);
				this.totalPaginasProximos.set(Math.max(1, Math.ceil(total / this.pageSizeProximos)));
			},
			error: err => {
				this.totalPaginasProximos.set(1);
				console.error("[CatalogoEventos] Error al obtener el total de eventos próximos:", err);
			},
		});
	}

	cargarEventosPasados(): void {
		this.cargandoPasados.set(true);
		this.catalogoEventos
			.getEventos("pasados", this.busquedaPasados(), this.paginaPasados(), this.pageSizePasados)
			.subscribe({
				next: eventos => {
					console.log("[CatalogoEventos] Eventos pasados recibidos del servicio:", eventos);
					this.eventosPasados.set(eventos);
					this.cargandoPasados.set(false);
				},
				error: err => {
					console.error("[CatalogoEventos] Error al cargar eventos pasados:", err);
					this.cargandoPasados.set(false);
					this.errorPasados.set(true);
				},
			});
		this.catalogoEventos.getTotalEventos("pasados", this.busquedaPasados()).subscribe({
			next: total => {
				this.totalEventosPasados.set(total);
				this.totalPaginasPasados.set(Math.max(1, Math.ceil(total / this.pageSizePasados)));
			},
			error: err => {
				this.totalPaginasPasados.set(1);
				console.error("[CatalogoEventos] Error al obtener el total de eventos pasados:", err);
			},
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

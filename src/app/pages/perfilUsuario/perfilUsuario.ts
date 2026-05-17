import { Component, inject, signal } from "@angular/core";
import { UsuarioCompleto } from "@Interfaces/modelosApp/modelosApp";
import { ServicioUsuario } from "@app/services/servicioUsuario/servicioUsuario";
import { UsuarioCard } from "@sharedComponents/usuario-card/usuario-card";
import { ListaCardComponent } from "@sharedComponents/lista-card/lista-card";
import { ComentarioExistente } from "@sharedComponents/comentarioExistente/comentarioExistente";
import { LibroCard } from "@sharedComponents/libro-card/libro-card";
import { forkJoin } from "rxjs";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BannerCargando } from "@sharedComponents/banner-cargando/banner-cargando";
import { BannerError } from "@sharedComponents/banner-error/banner-error";
import { EventoCardComponent } from "@sharedComponents/evento-card/evento-card";

@Component({
	selector: "app-perfil-usuario",
	imports: [
		UsuarioCard,
		ListaCardComponent,
		ComentarioExistente,
		LibroCard,
		RouterLink,
		BannerCargando,
		BannerError,
		EventoCardComponent,
	],
	templateUrl: "./perfilUsuario.html",
})
export class PerfilUsuario {
	private readonly usuarioSrv = inject(ServicioUsuario);
	private readonly route = inject(ActivatedRoute);

	readonly usuario = signal<Partial<UsuarioCompleto>>({});

	readonly cargando = signal(true);
	readonly encontrado = signal(false);

	tabActiva = signal<"listas" | "criticas" | "eventos" | "libros">("libros");

	constructor() {
		this.route.paramMap.subscribe(params => {
			const id = Number(params.get("id"));
			if (Number.isFinite(id) && id > 0) {
				this.cargarPerfil(id);
				if (this.usuario().id_usuario) {
					this.encontrado.set(true);
				}
			}
			this.cargando.set(false);
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
		}).subscribe(r => {
			if (r.base.id_usuario) {
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
				this.encontrado.set(true);
			} else {
				this.encontrado.set(false);
			}
		});
	}
}

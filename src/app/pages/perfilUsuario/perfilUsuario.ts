import { Component, inject, signal } from "@angular/core";
import { UsuarioCompleto } from "@Interfaces/modelosApp/modelosApp";
import { ServicioUsuario } from "@app/services/servicioUsuario/servicioUsuario";
import { UsuarioCard } from "@app/shared/components/usuario-card/usuario-card";
import { ListaCardComponent } from "@app/shared/components/lista-card/lista-card";
import { ComentarioExistente } from "@app/shared/components/comentarioExistente/comentarioExistente";
import { LibroCard } from "@app/shared/components/libro-card/libro-card";
import { forkJoin } from "rxjs";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BannerCargando } from "@app/shared/components/banner-cargando/banner-cargando";
import { BannerError } from "@app/shared/components/banner-error/banner-error";

@Component({
	selector: "app-perfil-usuario",
	imports: [UsuarioCard, ListaCardComponent, ComentarioExistente, LibroCard, RouterLink, BannerCargando, BannerError],
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

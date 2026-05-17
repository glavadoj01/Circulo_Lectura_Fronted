import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environments";
import { catchError, map, Observable, of } from "rxjs";
import { EventoResumen } from "@Interfaces/modelosApp/modelosApp";
import { AppError, manejarError } from "@Utils/error.utils";
import { procesarRespuestaArray } from "@Utils/procesarRespuesta";

interface CacheCatalogoEventos {
	total: Record<string, number | null>;
	pages: Record<string, EventoResumen[]>;
	currentPage: Record<string, number>;
}

@Injectable({ providedIn: "root" })
export class ServicioCatalogoEventos {
	private readonly cacheCatalogoKey = "cacheCatalogoEventos";
	private readonly apiUrl = `${environment.apiUrl}:${environment.puerto}`;
	readonly paginaActual = signal<number>(1);

	constructor(private readonly http: HttpClient) {
		this.paginaActual.set(this.getPaginaCatalogoActual("proximos"));
	}

	private generarFiltrosKey(tipo: "proximos" | "pasados", busqueda: string = ""): string {
		const termino = busqueda.trim();
		return `${tipo}_${termino}`;
	}

	private construirParams(
		tipo: "proximos" | "pasados",
		pagina: number,
		limit: number,
		busqueda: string = "",
	): URLSearchParams {
		const params = new URLSearchParams({
			tipo,
			pagina: String(pagina),
			limit: String(limit),
		});

		if (busqueda && busqueda.trim()) {
			params.append("busqueda", busqueda);
		}

		return params;
	}

	getEventos(
		tipo: "proximos" | "pasados" = "proximos",
		busqueda: string = "",
		pagina: number = 1,
		limit: number = 2,
	): Observable<EventoResumen[]> {
		try {
			const cacheActual = this.leerCacheCatalogo();
			const filtrosKey = this.generarFiltrosKey(tipo, busqueda);
			const key = `${tipo}_${pagina}_${limit}_${filtrosKey}`;

			if (cacheActual.pages[key]) {
				return of(cacheActual.pages[key]);
			}

			const params = this.construirParams(tipo, pagina, limit, busqueda);
			console.log("[ServicioCatalogoEventos] getEventos - filtrosKey:", filtrosKey, "params:", params.toString());
			const url = `${environment.apiUrl}:${environment.puerto}/eventos?${params.toString()}`;
			console.log("[ServicioCatalogoEventos] getEventos - URL:", url);

			return this.http.get<{ data: EventoResumen[] }>(url).pipe(
				map(resp => {
					console.log("[ServicioCatalogoEventos] getEventos - respuesta HTTP:", resp);
					const eventos = procesarRespuestaArray<EventoResumen>(resp, "Eventos");
					const cacheActualizado = this.leerCacheCatalogo();
					this.guardarCacheCatalogo({
						...cacheActualizado,
						pages: {
							...cacheActualizado.pages,
							[key]: eventos,
						},
						currentPage: {
							...cacheActualizado.currentPage,
							[tipo]: pagina,
						},
					});
					return eventos;
				}),
				catchError(error => {
					throw manejarError(error, "servicioCatalogoEventos.getEventos.http");
				}),
			);
		} catch (error) {
			throw manejarError(error, "servicioCatalogoEventos.getEventos.cache");
		}
	}

	getTotalEventos(tipo: "proximos" | "pasados" = "proximos", busqueda: string = ""): Observable<number> {
		try {
			const cacheActual = this.leerCacheCatalogo();
			const filtrosKey = this.generarFiltrosKey(tipo, busqueda);

			if (cacheActual.total[filtrosKey] !== undefined && cacheActual.total[filtrosKey] !== null) {
				return of(cacheActual.total[filtrosKey] as number);
			}

			const params = this.construirParams(tipo, 1, 0, busqueda);
			console.log("[ServicioCatalogoEventos] getTotalEventos - filtrosKey:", filtrosKey, "params:", params.toString());
			const url = `${environment.apiUrl}:${environment.puerto}/eventos/total?${params.toString()}`;
			console.log("[ServicioCatalogoEventos] getTotalEventos - URL:", url);

			return this.http.get<{ data: { total: number } }>(url).pipe(
				map(resp => {
					console.log("[ServicioCatalogoEventos] getTotalEventos - respuesta HTTP:", resp);
					const total = Number(resp.data?.total ?? 0);
					const totalSeguro = Number.isFinite(total) && total > 0 ? total : 0;
					const cacheActualizado = this.leerCacheCatalogo();

					this.guardarCacheCatalogo({
						...cacheActualizado,
						total: { ...cacheActualizado.total, [filtrosKey]: totalSeguro },
					});
					return totalSeguro;
				}),
				catchError(error => {
					throw manejarError(error, "servicioCatalogoEventos.getTotalEventos.http");
				}),
			);
		} catch (error) {
			throw manejarError(error, "servicioCatalogoEventos.getTotalEventos.cache");
		}
	}

	getPaginaCatalogoActual(tipo: "proximos" | "pasados" = "proximos"): number {
		try {
			const cache = this.leerCacheCatalogo();
			return cache.currentPage[tipo] ?? 1;
		} catch (error) {
			throw manejarError(error, "servicioCatalogoEventos.getPaginaCatalogoActual");
		}
	}

	setPaginaCatalogoActual(tipo: "proximos" | "pasados", page: number): void {
		const paginaSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
		try {
			const cacheActual = this.leerCacheCatalogo();
			this.guardarCacheCatalogo({
				...cacheActual,
				currentPage: {
					...cacheActual.currentPage,
					[tipo]: paginaSegura,
				},
			});
			this.paginaActual.set(paginaSegura);
		} catch (error) {
			throw manejarError(error, "servicioCatalogoEventos.setPaginaCatalogoActual");
		}
	}

	private leerCacheCatalogo(): CacheCatalogoEventos {
		if (globalThis.window === undefined) {
			throw new AppError("catalogo_cache_no_window");
		}
		const raw = globalThis.sessionStorage.getItem(this.cacheCatalogoKey);
		if (!raw) {
			return {
				total: {},
				pages: {},
				currentPage: { proximos: 1, pasados: 1 },
			};
		}
		try {
			const parsed = JSON.parse(raw) as CacheCatalogoEventos;
			return {
				total: parsed?.total && typeof parsed.total === "object" ? parsed.total : {},
				pages: parsed?.pages && typeof parsed.pages === "object" ? parsed.pages : {},
				currentPage:
					parsed?.currentPage && typeof parsed.currentPage === "object"
						? {
								proximos:
									typeof parsed.currentPage["proximos"] === "number" &&
									Number.isFinite(parsed.currentPage["proximos"]) &&
									parsed.currentPage["proximos"] > 0
										? Math.floor(parsed.currentPage["proximos"])
										: 1,
								pasados:
									typeof parsed.currentPage["pasados"] === "number" &&
									Number.isFinite(parsed.currentPage["pasados"]) &&
									parsed.currentPage["pasados"] > 0
										? Math.floor(parsed.currentPage["pasados"])
										: 1,
							}
						: { proximos: 1, pasados: 1 },
			};
		} catch (error) {
			throw new AppError("catalogo_cache_parse", { raw, error });
		}
	}

	private guardarCacheCatalogo(cache: CacheCatalogoEventos): void {
		if (globalThis.window === undefined) {
			throw new AppError("catalogo_cache_no_window");
		}
		try {
			console.log("[ServicioCatalogoEventos] guardarCacheCatalogo - cache a guardar:", cache);
			globalThis.sessionStorage.setItem(this.cacheCatalogoKey, JSON.stringify(cache));
		} catch (error) {
			throw new AppError("catalogo_cache_guardar", { error });
		}
	}
}

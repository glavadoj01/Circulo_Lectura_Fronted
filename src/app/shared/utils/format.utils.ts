export function normalizarPuntuacion(valor: unknown): number {
    const num = Number(valor);
    if (!Number.isFinite(num)) {
        return 0;
    }

    return Math.max(0, Math.min(5, num));
}

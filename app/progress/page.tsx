import { getTemas, getProgreso } from "@/lib/queries";
import type { Tema, Progreso } from "@/types";

export const dynamic = "force-dynamic";

const DIFICULTAD_LABEL: Record<string, string> = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
};

const DIFICULTAD_COLORS: Record<string, { bar: string; badge: string }> = {
  easy: {
    bar: "bg-emerald-500",
    badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  medium: {
    bar: "bg-amber-500",
    badge: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  hard: {
    bar: "bg-red-500",
    badge: "text-red-300 bg-red-500/10 border-red-500/20",
  },
};

export default async function ProgressPage() {
  const [temas, progresos] = await Promise.all([getTemas(), getProgreso()]);

  const progresoMap = new Map<number, Progreso>(
    progresos.map((p) => [p.tema_id, p])
  );

  const avgProgress =
    temas.length > 0
      ? Math.round(
          temas.reduce((sum, t) => {
            const p = progresoMap.get(t.id);
            return sum + (p?.porcentaje ?? 0);
          }, 0) / temas.length
        )
      : 0;

  const hardAvg =
    temas
      .filter((t) => t.dificultad === "hard")
      .reduce((sum, t) => sum + (progresoMap.get(t.id)?.porcentaje ?? 0), 0) /
    Math.max(temas.filter((t) => t.dificultad === "hard").length, 1);

  const byDificultad: Record<string, Tema[]> = {
    hard: temas.filter((t) => t.dificultad === "hard"),
    medium: temas.filter((t) => t.dificultad === "medium"),
    easy: temas.filter((t) => t.dificultad === "easy"),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Progreso por Tema</h1>
        <p className="text-white/40 text-sm">Seguimiento de los 23 temas</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-[#13131f] border border-white/8 rounded-xl p-4">
          <div className="text-2xl font-bold text-violet-400">{avgProgress}%</div>
          <div className="text-xs text-white/40 mt-0.5">Media global</div>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
        <div className="bg-[#13131f] border border-white/8 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-400">
            {Math.round(hardAvg)}%
          </div>
          <div className="text-xs text-white/40 mt-0.5">Temas dificiles</div>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${Math.round(hardAvg)}%` }}
            />
          </div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-[#13131f] border border-white/8 rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-400">
            {temas.filter((t) => (progresoMap.get(t.id)?.porcentaje ?? 0) >= 80).length}
            <span className="text-base text-white/30">/{temas.length}</span>
          </div>
          <div className="text-xs text-white/40 mt-0.5">Con +80% de dominio</div>
        </div>
      </div>

      {/* Temas by difficulty */}
      <div className="flex flex-col gap-8">
        {(["hard", "medium", "easy"] as const).map((dif) => (
          <div key={dif}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-white/60">
                {DIFICULTAD_LABEL[dif]}
              </h2>
              <span className="text-xs text-white/20">
                {byDificultad[dif].length} temas
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {byDificultad[dif].map((tema) => {
                const progreso = progresoMap.get(tema.id);
                const pct = progreso?.porcentaje ?? 0;
                const colors = DIFICULTAD_COLORS[tema.dificultad];

                return (
                  <div
                    key={tema.id}
                    className="bg-[#13131f] border border-white/8 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="font-mono text-xs text-white/25 mt-0.5 flex-shrink-0">
                          T{tema.id}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white/80 leading-snug">
                            {tema.nombre}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[11px] px-1.5 py-0.5 rounded border ${colors.badge}`}
                            >
                              {DIFICULTAD_LABEL[tema.dificultad]}
                            </span>
                            <span className="text-[11px] text-white/25">
                              Peso: {tema.peso_examen}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold tabular-nums">
                          {pct}%
                        </div>
                        {progreso?.ultima_sesion && (
                          <div className="text-[11px] text-white/25">
                            {new Date(
                              progreso.ultima_sesion
                            ).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${colors.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {progreso?.notas && (
                      <p className="mt-2 text-[11px] text-white/30 italic truncate">
                        {progreso.notas}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getTodaySchedule, getTemasMap, getStudyStats } from "@/lib/queries";
import { BlockCard } from "@/components/BlockCard";
import { StatsBar } from "@/components/StatsBar";
import type { ScheduleBlock, Tema } from "@/types";

const TIPO_DIA_LABELS: Record<string, string> = {
  review: "Repaso + Test",
  test: "Dia de Test",
  simulacro: "Simulacro",
  mixed: "Mixto",
};

const TIPO_DIA_BADGE: Record<string, string> = {
  review: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  test: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  simulacro: "bg-red-500/15 text-red-300 border-red-500/20",
  mixed: "bg-amber-500/15 text-amber-300 border-amber-500/20",
};

const DAYS_ES = [
  "Domingo", "Lunes", "Martes", "Miercoles",
  "Jueves", "Viernes", "Sabado",
];
const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [dayWithBlocks, temasMap, stats] = await Promise.all([
    getTodaySchedule(),
    getTemasMap(),
    getStudyStats(),
  ]);

  const now = new Date();
  const dayName = DAYS_ES[now.getDay()];
  const dateStr = `${now.getDate()} de ${MONTHS_ES[now.getMonth()]}`;

  return (
    <div>
      <StatsBar {...stats} />

      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="text-2xl font-bold">{dayName}</h1>
          <span className="text-white/40 text-sm">{dateStr}</span>
        </div>
        <p className="text-white/40 text-sm">Tu horario de hoy</p>
      </div>

      {!dayWithBlocks ? (
        <div className="bg-[#13131f] border border-white/8 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-white/50 text-sm">
            No hay horario programado para hoy.
          </p>
          <p className="text-white/30 text-xs mt-1">
            Asegurate de haber generado el calendario en Supabase.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                TIPO_DIA_BADGE[dayWithBlocks.tipo_dia]
              }`}
            >
              {TIPO_DIA_LABELS[dayWithBlocks.tipo_dia]}
            </span>
            <span className="text-white/25 text-xs">
              Semana {dayWithBlocks.semana}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {dayWithBlocks.blocks.map((block: ScheduleBlock) => {
              const temas = (block.tema_ids ?? [])
                .map((id: number) => temasMap.get(id))
                .filter((t): t is Tema => t !== undefined);

              return (
                <BlockCard key={block.id} block={block} temas={temas} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

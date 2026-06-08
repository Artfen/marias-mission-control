import { getWeekSchedule, getAllWeeks, getTemasMap } from "@/lib/queries";
import Link from "next/link";
import type { ScheduleBlock, Tema } from "@/types";

export const revalidate = 60;

const DAYS_ES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

const TIPO_DIA_BADGE: Record<string, string> = {
  review: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  test: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  simulacro: "bg-red-500/15 text-red-300 border-red-500/20",
  mixed: "bg-amber-500/15 text-amber-300 border-amber-500/20",
};

const TIPO_DIA_LABELS: Record<string, string> = {
  review: "Repaso",
  test: "Test",
  simulacro: "Simulacro",
  mixed: "Mixto",
};

const TIPO_BLOCK_DOT: Record<string, string> = {
  repaso: "bg-violet-400",
  test_tema: "bg-emerald-400",
  test_mixto: "bg-amber-400",
  simulacro: "bg-red-400",
};

interface Props {
  searchParams: { semana?: string };
}

export default async function WeekPage({ searchParams }: Props) {
  const allWeeks = await getAllWeeks();
  const totalWeeks = allWeeks.length > 0 ? Math.max(...allWeeks) : 4;
  const currentWeek = Math.min(
    Math.max(parseInt(searchParams.semana ?? "1", 10), 1),
    totalWeeks
  );

  const [days, temasMap] = await Promise.all([
    getWeekSchedule(currentWeek),
    getTemasMap(),
  ]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Semana {currentWeek}</h1>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
            <Link
              key={w}
              href={`/week?semana=${w}`}
              className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                w === currentWeek
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {w}
            </Link>
          ))}
        </div>
      </div>

      {days.length === 0 ? (
        <div className="bg-[#13131f] border border-white/8 rounded-xl p-10 text-center">
          <p className="text-white/50 text-sm">
            No hay datos para la semana {currentWeek}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((day) => {
            const date = new Date(day.fecha + "T12:00:00");
            const dayLabel = DAYS_ES[date.getDay()];
            const dateNum = date.getDate();
            const isToday = day.fecha === today;
            const completedBlocks = day.blocks.filter(
              (b: ScheduleBlock) => b.completado
            ).length;
            const totalBlocks = day.blocks.length;
            const allDone = totalBlocks > 0 && completedBlocks === totalBlocks;

            return (
              <div
                key={day.id}
                className={`rounded-xl border p-4 flex flex-col gap-3 ${
                  isToday
                    ? "border-violet-500/40 bg-violet-500/5"
                    : allDone
                    ? "border-emerald-500/20 bg-emerald-500/3"
                    : "border-white/8 bg-[#13131f]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold ${
                          isToday ? "text-violet-300" : "text-white/70"
                        }`}
                      >
                        {dayLabel}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-medium text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded">
                          HOY
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold mt-0.5">{dateNum}</div>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                      TIPO_DIA_BADGE[day.tipo_dia]
                    }`}
                  >
                    {TIPO_DIA_LABELS[day.tipo_dia]}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {day.blocks.map((block: ScheduleBlock) => {
                    const blockTemas = (block.tema_ids ?? [])
                      .map((id: number) => temasMap.get(id))
                      .filter((t): t is Tema => t !== undefined)
                      .slice(0, 2);

                    return (
                      <div
                        key={block.id}
                        className={`flex items-start gap-2 p-2.5 rounded-lg ${
                          block.completado ? "bg-white/3 opacity-50" : "bg-black/20"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            TIPO_BLOCK_DOT[block.tipo]
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] text-white/40 mb-0.5">
                            {block.bloque === "manana" ? "Mañana" : "Tarde"}
                          </div>
                          {blockTemas.length > 0 ? (
                            blockTemas.map((t) => (
                              <div
                                key={t.id}
                                className="text-[11px] text-white/60 truncate"
                              >
                                T{t.id} {t.nombre.split(":")[0]}
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-white/40 capitalize">
                              {block.tipo.replace("_", " ")}
                            </div>
                          )}
                        </div>
                        {block.completado && (
                          <svg
                            className="w-3 h-3 text-emerald-400 flex-shrink-0 ml-auto mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {totalBlocks > 0 && (
                  <div className="mt-auto">
                    <div className="flex justify-between text-[11px] text-white/25 mb-1">
                      <span>{completedBlocks}/{totalBlocks} bloques</span>
                      {allDone && (
                        <span className="text-emerald-400">Completo</span>
                      )}
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${(completedBlocks / totalBlocks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

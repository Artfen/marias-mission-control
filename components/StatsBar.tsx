interface Props {
  totalBlocksCompleted: number;
  totalHoursStudied: number;
  currentStreak: number;
}

export function StatsBar({
  totalBlocksCompleted,
  totalHoursStudied,
  currentStreak,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <div className="bg-[#13131f] border border-white/8 rounded-xl p-4">
        <div className="text-2xl font-bold text-violet-400 tabular-nums">
          {currentStreak}
        </div>
        <div className="text-xs text-white/40 mt-0.5">Dias seguidos</div>
      </div>
      <div className="bg-[#13131f] border border-white/8 rounded-xl p-4">
        <div className="text-2xl font-bold text-emerald-400 tabular-nums">
          {totalHoursStudied}h
        </div>
        <div className="text-xs text-white/40 mt-0.5">Horas totales</div>
      </div>
      <div className="bg-[#13131f] border border-white/8 rounded-xl p-4">
        <div className="text-2xl font-bold text-white/70 tabular-nums">
          {totalBlocksCompleted}
        </div>
        <div className="text-xs text-white/40 mt-0.5">Bloques hechos</div>
      </div>
    </div>
  );
}

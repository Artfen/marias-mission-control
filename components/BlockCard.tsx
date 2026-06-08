"use client";
import { useState, useTransition } from "react";
import { markBlockComplete } from "@/lib/queries";
import type { ScheduleBlock, Tema } from "@/types";

interface Props {
  block: ScheduleBlock;
  temas: Tema[];
}

const BLOQUE_LABELS = {
  manana: "Mañana",
  tarde: "Tarde",
};

const BLOQUE_TIMES = {
  manana: "10:30 - 14:30",
  tarde: "16:30 - 20:00",
};

const TIPO_LABELS: Record<string, string> = {
  repaso: "Repaso",
  test_tema: "Test de Tema",
  test_mixto: "Test Mixto",
  simulacro: "Simulacro",
};

const TIPO_COLORS: Record<string, string> = {
  repaso: "text-violet-300 bg-violet-500/10 border-violet-500/20",
  test_tema: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  test_mixto: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  simulacro: "text-red-300 bg-red-500/10 border-red-500/20",
};

const DIFICULTAD_DOT: Record<string, string> = {
  easy: "bg-emerald-400",
  medium: "bg-amber-400",
  hard: "bg-red-400",
};

export function BlockCard({ block, temas }: Props) {
  const [completado, setCompletado] = useState(block.completado);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !completado;
    setCompletado(next);
    startTransition(async () => {
      try {
        await markBlockComplete(block.id, next);
      } catch {
        setCompletado(!next);
      }
    });
  };

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        completado
          ? "bg-white/3 border-white/5 opacity-60"
          : "bg-[#13131f] border-white/8"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/40 text-sm font-medium">
              {BLOQUE_LABELS[block.bloque]}
            </span>
            <span className="text-white/20 text-xs">
              {BLOQUE_TIMES[block.bloque]}
            </span>
            <span className="text-white/20 text-xs">
              {block.duracion_min} min
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded border ${
                TIPO_COLORS[block.tipo]
              }`}
            >
              {TIPO_LABELS[block.tipo]}
            </span>
            {block.tipo === "simulacro" && (
              <span className="text-xs text-white/30">100 preguntas</span>
            )}
          </div>

          {temas.length > 0 && (
            <div className="flex flex-col gap-2">
              {temas.map((tema) => (
                <div key={tema.id} className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      DIFICULTAD_DOT[tema.dificultad]
                    }`}
                  />
                  <span className="text-sm text-white/70 truncate">
                    <span className="text-white/30 font-mono text-xs mr-1.5">
                      T{tema.id}
                    </span>
                    {tema.nombre}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggle}
          disabled={pending}
          className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
            completado
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-white/15 hover:border-violet-500/50"
          } ${pending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {completado && (
            <svg
              className="w-4 h-4"
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
        </button>
      </div>
    </div>
  );
}

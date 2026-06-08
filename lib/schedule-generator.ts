import { TipoDia, TipoBloque } from "@/types";

export interface GeneratedBlock {
  bloque: "manana" | "tarde";
  tipo: TipoBloque;
  tema_ids: number[];
  duracion_min: number;
}

export interface GeneratedDay {
  fecha: string;
  semana: number;
  tipo_dia: TipoDia;
  blocks: GeneratedBlock[];
}

// T6 is always skipped
const SKIP_TEMA = 6;

// Temas weighted by difficulty for scheduling priority
const HARD_TEMAS = [1, 2, 9, 14, 15, 16];
const MEDIUM_TEMAS = [3, 4, 5, 8, 10, 11, 12, 13, 17, 18];
const EASY_TEMAS = [7, 19, 20, 21, 22, 23];
const ALL_TEMAS = [...HARD_TEMAS, ...MEDIUM_TEMAS, ...EASY_TEMAS].filter(
  (t) => t !== SKIP_TEMA
);

function pickWeightedTemas(
  count: number,
  exclude: number[] = [],
  seed: number = 0
): number[] {
  // Weighted pool: hard appears 3x, medium 2x, easy 1x
  const pool: number[] = [
    ...HARD_TEMAS.filter((t) => !exclude.includes(t)).flatMap((t) => [
      t,
      t,
      t,
    ]),
    ...MEDIUM_TEMAS.filter((t) => !exclude.includes(t)).flatMap((t) => [t, t]),
    ...EASY_TEMAS.filter((t) => !exclude.includes(t)),
  ];

  const picked: number[] = [];
  let idx = seed;
  while (picked.length < count && pool.length > 0) {
    const i = idx % pool.length;
    const tema = pool[i];
    if (!picked.includes(tema)) {
      picked.push(tema);
    }
    idx = (idx * 7 + 13) % (pool.length + 1);
    if (idx === 0) idx = 1;
  }
  return picked.slice(0, count);
}

function pickMixedTemas(count: number, seed: number): number[] {
  const shuffled = [...ALL_TEMAS].sort(
    (a, b) => ((a * seed + 17) % 23) - ((b * seed + 17) % 23)
  );
  return shuffled.slice(0, count);
}

export function generateSchedule(startDate: Date): GeneratedDay[] {
  const days: GeneratedDay[] = [];

  // Day type distribution pattern over 28 days
  // Week 1-3: ~60% review, ~20% test, ~20% simulacro
  // Week 4: ~30% review, ~40% test, ~30% simulacro
  const dayTypes: TipoDia[] = [
    // Week 1
    "review", "review", "test", "review", "simulacro", "review", "test",
    // Week 2
    "review", "simulacro", "review", "test", "review", "review", "simulacro",
    // Week 3
    "review", "test", "review", "simulacro", "review", "mixed", "test",
    // Week 4 (shift to test-heavy)
    "test", "simulacro", "review", "test", "simulacro", "test", "simulacro",
  ];

  for (let d = 0; d < 28; d++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + d);
    const fecha = date.toISOString().split("T")[0];
    const semana = Math.floor(d / 7) + 1;
    const tipo_dia = dayTypes[d];
    const seed = d * 31 + 7;

    const blocks: GeneratedBlock[] = [];

    if (tipo_dia === "review" || tipo_dia === "mixed") {
      // Morning: repaso of 2 weighted temas (hard/medium bias)
      const mañanaTemas = pickWeightedTemas(2, [], seed);
      blocks.push({
        bloque: "manana",
        tipo: "repaso",
        tema_ids: mañanaTemas,
        duracion_min: 240,
      });
      // Afternoon: test on those same temas
      const tardeTemas = tipo_dia === "mixed"
        ? pickMixedTemas(3, seed + 5)
        : mañanaTemas;
      blocks.push({
        bloque: "tarde",
        tipo: tipo_dia === "mixed" ? "test_mixto" : "test_tema",
        tema_ids: tardeTemas,
        duracion_min: 210,
      });
    } else if (tipo_dia === "test") {
      // Morning: test on specific temas
      const mañanaTemas = pickWeightedTemas(2, [], seed);
      blocks.push({
        bloque: "manana",
        tipo: "test_tema",
        tema_ids: mañanaTemas,
        duracion_min: 240,
      });
      // Afternoon: mixed topic test
      blocks.push({
        bloque: "tarde",
        tipo: "test_mixto",
        tema_ids: pickMixedTemas(5, seed + 11),
        duracion_min: 210,
      });
    } else if (tipo_dia === "simulacro") {
      // Both blocks: full simulacro (100 questions each)
      blocks.push({
        bloque: "manana",
        tipo: "simulacro",
        tema_ids: ALL_TEMAS.slice(0, 10),
        duracion_min: 240,
      });
      blocks.push({
        bloque: "tarde",
        tipo: "simulacro",
        tema_ids: ALL_TEMAS.slice(10),
        duracion_min: 210,
      });
    }

    days.push({ fecha, semana, tipo_dia, blocks });
  }

  return days;
}

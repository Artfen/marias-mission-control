export type Dificultad = "easy" | "medium" | "hard";
export type TipoDia = "review" | "test" | "simulacro" | "mixed";
export type Bloque = "manana" | "tarde";
export type TipoBloque = "repaso" | "test_tema" | "test_mixto" | "simulacro";

export interface Tema {
  id: number;
  nombre: string;
  dificultad: Dificultad;
  peso_examen: number;
  completada: boolean;
}

export interface ScheduleDay {
  id: number;
  fecha: string; // ISO date string
  semana: number;
  tipo_dia: TipoDia;
}

export interface ScheduleBlock {
  id: number;
  day_id: number;
  bloque: Bloque;
  tipo: TipoBloque;
  tema_ids: number[];
  duracion_min: number;
  completado: boolean;
}

export interface Progreso {
  id: number;
  tema_id: number;
  porcentaje: number;
  ultima_sesion: string | null;
  notas: string | null;
}

export interface DayWithBlocks extends ScheduleDay {
  blocks: ScheduleBlock[];
}

export interface BlockWithTemas extends ScheduleBlock {
  temas: Tema[];
}

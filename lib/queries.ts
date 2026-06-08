import { supabase } from "./supabase";
import type {
  Tema,
  ScheduleDay,
  ScheduleBlock,
  Progreso,
  DayWithBlocks,
  BlockWithTemas,
} from "@/types";

export async function getTemas(): Promise<Tema[]> {
  const { data, error } = await supabase
    .from("temas")
    .select("*")
    .order("id");
  if (error) throw error;
  return data;
}

export async function getTemasMap(): Promise<Map<number, Tema>> {
  const temas = await getTemas();
  return new Map(temas.map((t) => [t.id, t]));
}

export async function getTodaySchedule(): Promise<DayWithBlocks | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data: day, error: dayErr } = await supabase
    .from("schedule_days")
    .select("*")
    .eq("fecha", today)
    .single();

  if (dayErr || !day) return null;

  const { data: blocks, error: blocksErr } = await supabase
    .from("schedule_blocks")
    .select("*")
    .eq("day_id", day.id)
    .order("bloque");

  if (blocksErr) throw blocksErr;

  return { ...day, blocks: blocks ?? [] };
}

export async function getWeekSchedule(
  semana: number
): Promise<DayWithBlocks[]> {
  const { data: days, error: daysErr } = await supabase
    .from("schedule_days")
    .select("*")
    .eq("semana", semana)
    .order("fecha");

  if (daysErr) throw daysErr;
  if (!days || days.length === 0) return [];

  const dayIds = days.map((d: ScheduleDay) => d.id);

  const { data: blocks, error: blocksErr } = await supabase
    .from("schedule_blocks")
    .select("*")
    .in("day_id", dayIds)
    .order("bloque");

  if (blocksErr) throw blocksErr;

  return days.map((day: ScheduleDay) => ({
    ...day,
    blocks: (blocks ?? []).filter((b: ScheduleBlock) => b.day_id === day.id),
  }));
}

export async function getAllWeeks(): Promise<number[]> {
  const { data, error } = await supabase
    .from("schedule_days")
    .select("semana")
    .order("semana");
  if (error) throw error;
  const weeks = Array.from(new Set((data ?? []).map((d: { semana: number }) => d.semana)));
  return weeks;
}

export async function markBlockComplete(
  blockId: number,
  completado: boolean
): Promise<void> {
  const { error } = await supabase
    .from("schedule_blocks")
    .update({ completado })
    .eq("id", blockId);
  if (error) throw error;
}

export async function getProgreso(): Promise<Progreso[]> {
  const { data, error } = await supabase
    .from("progreso")
    .select("*")
    .order("tema_id");
  if (error) throw error;
  return data ?? [];
}

export async function updateProgreso(
  temaId: number,
  porcentaje: number,
  notas?: string
): Promise<void> {
  const { error } = await supabase.from("progreso").upsert(
    {
      tema_id: temaId,
      porcentaje,
      ultima_sesion: new Date().toISOString(),
      notas: notas ?? null,
    },
    { onConflict: "tema_id" }
  );
  if (error) throw error;
}

export async function getStudyStats(): Promise<{
  totalBlocksCompleted: number;
  totalHoursStudied: number;
  currentStreak: number;
}> {
  const { data: blocks, error } = await supabase
    .from("schedule_blocks")
    .select("completado, duracion_min, day_id")
    .eq("completado", true);

  if (error) throw error;

  const completedBlocks = blocks ?? [];
  const totalBlocksCompleted = completedBlocks.length;
  const totalHoursStudied = Math.round(
    completedBlocks.reduce(
      (sum: number, b: { duracion_min: number }) => sum + b.duracion_min,
      0
    ) / 60
  );

  // Calculate streak: count consecutive days where at least 1 block was completed
  const { data: days, error: daysErr } = await supabase
    .from("schedule_days")
    .select("id, fecha")
    .order("fecha", { ascending: false });

  if (daysErr) throw daysErr;

  const completedDayIds = new Set(
    completedBlocks.map((b: { day_id: number }) => b.day_id)
  );

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];

  for (const day of days ?? []) {
    if (day.fecha > today) continue;
    if (completedDayIds.has(day.id)) {
      streak++;
    } else {
      break;
    }
  }

  return { totalBlocksCompleted, totalHoursStudied, currentStreak: streak };
}

-- ============================================================
-- Maria's Mission Control — Supabase Schema + Seed
-- Paste this entire file into the Supabase SQL editor and run.
-- ============================================================

-- 1. TEMAS
create table if not exists temas (
  id             serial primary key,
  nombre         text not null,
  dificultad     text not null check (dificultad in ('easy', 'medium', 'hard')),
  peso_examen    int  not null,
  completada     boolean not null default false
);

-- 2. SCHEDULE DAYS
create table if not exists schedule_days (
  id       serial primary key,
  fecha    date not null unique,
  semana   int  not null,
  tipo_dia text not null check (tipo_dia in ('review', 'test', 'simulacro', 'mixed'))
);

-- 3. SCHEDULE BLOCKS
create table if not exists schedule_blocks (
  id           serial primary key,
  day_id       int  not null references schedule_days(id) on delete cascade,
  bloque       text not null check (bloque in ('manana', 'tarde')),
  tipo         text not null check (tipo in ('repaso', 'test_tema', 'test_mixto', 'simulacro')),
  tema_ids     int[] not null default '{}',
  duracion_min int  not null,
  completado   boolean not null default false
);

-- 4. PROGRESO
create table if not exists progreso (
  id            serial primary key,
  tema_id       int  not null unique references temas(id) on delete cascade,
  porcentaje    int  not null default 0 check (porcentaje between 0 and 100),
  ultima_sesion timestamptz,
  notas         text
);

-- ============================================================
-- SEED: 23 TEMAS
-- ============================================================
insert into temas (id, nombre, dificultad, peso_examen, completada) values
  (1,  'Constitución Española',                  'hard',   8, false),
  (2,  'Derechos y libertades',                  'hard',   6, false),
  (3,  'Corona, Cortes, Gobierno',               'medium', 5, false),
  (4,  'Poder Judicial',                         'medium', 4, false),
  (5,  'Organización territorial',               'medium', 5, false),
  (6,  'Fuerzas Armadas',                        'easy',   2, false),
  (7,  'Guardia Civil: historia',                'easy',   3, false),
  (8,  'Guardia Civil: organización',            'medium', 5, false),
  (9,  'Guardia Civil: régimen disciplinario',   'hard',   6, false),
  (10, 'Seguridad ciudadana',                    'medium', 4, false),
  (11, 'Extranjería',                            'medium', 4, false),
  (12, 'Violencia de género',                    'medium', 4, false),
  (13, 'Protección de datos',                    'medium', 3, false),
  (14, 'Ley de enjuiciamiento criminal',         'hard',   5, false),
  (15, 'Código Penal I',                         'hard',   6, false),
  (16, 'Código Penal II',                        'hard',   5, false),
  (17, 'Tráfico y seguridad vial',               'medium', 4, false),
  (18, 'Armas y explosivos',                     'medium', 3, false),
  (19, 'Geografía de España',                    'easy',   3, false),
  (20, 'Historia de España',                     'easy',   3, false),
  (21, 'Ciencias naturales',                     'easy',   2, false),
  (22, 'Inglés',                                 'easy',   2, false),
  (23, 'Ortografía y gramática',                 'easy',   2, false)
on conflict (id) do nothing;

-- Reset sequence after manual ID insert
select setval('temas_id_seq', 23);

-- ============================================================
-- SEED: 28-DAY SCHEDULE
-- Change '2026-06-09' to whatever your actual start date is.
-- ============================================================
do $$
declare
  start_date date := '2026-06-09';
  day_types  text[] := array[
    -- Week 1
    'review', 'review', 'test', 'review', 'simulacro', 'review', 'test',
    -- Week 2
    'review', 'simulacro', 'review', 'test', 'review', 'review', 'simulacro',
    -- Week 3
    'review', 'test', 'review', 'simulacro', 'review', 'mixed', 'test',
    -- Week 4
    'test', 'simulacro', 'review', 'test', 'simulacro', 'test', 'simulacro'
  ];
  hard_temas   int[] := array[1, 2, 9, 14, 15, 16];
  medium_temas int[] := array[3, 4, 5, 8, 10, 11, 12, 13, 17, 18];
  easy_temas   int[] := array[7, 19, 20, 21, 22, 23];
  all_temas    int[] := array[1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  review_pool  int[] := array[1, 1, 1, 2, 2, 2, 9, 9, 9, 14, 14, 14, 15, 15, 15, 16, 16, 16, 3, 3, 4, 4, 5, 5, 8, 8, 10, 11, 12, 13, 17, 18, 7, 19, 20, 21, 22, 23];
  d            int;
  cur_date     date;
  semana       int;
  tipo_dia     text;
  day_id       int;
  t1           int;
  t2           int;
  pool_len     int := array_length(review_pool, 1);
  seed_base    int;
begin
  for d in 0..27 loop
    cur_date := start_date + d;
    semana   := (d / 7) + 1;
    tipo_dia := day_types[d + 1];
    seed_base := (d * 31 + 7) % pool_len + 1;

    -- Insert day
    insert into schedule_days (fecha, semana, tipo_dia)
    values (cur_date, semana, tipo_dia)
    on conflict (fecha) do nothing
    returning id into day_id;

    if day_id is null then
      select id into day_id from schedule_days where fecha = cur_date;
    end if;

    -- Pick 2 review temas deterministically from weighted pool
    t1 := review_pool[seed_base];
    t2 := review_pool[((seed_base + 7) % pool_len) + 1];
    if t2 = t1 then
      t2 := review_pool[((seed_base + 13) % pool_len) + 1];
    end if;

    if tipo_dia = 'review' then
      insert into schedule_blocks (day_id, bloque, tipo, tema_ids, duracion_min)
      values
        (day_id, 'manana', 'repaso',    array[t1, t2], 240),
        (day_id, 'tarde',  'test_tema', array[t1, t2], 210);

    elsif tipo_dia = 'test' then
      insert into schedule_blocks (day_id, bloque, tipo, tema_ids, duracion_min)
      values
        (day_id, 'manana', 'test_tema',  array[t1, t2], 240),
        (day_id, 'tarde',  'test_mixto', all_temas[1:6], 210);

    elsif tipo_dia = 'simulacro' then
      insert into schedule_blocks (day_id, bloque, tipo, tema_ids, duracion_min)
      values
        (day_id, 'manana', 'simulacro', all_temas[1:11],  240),
        (day_id, 'tarde',  'simulacro', all_temas[12:22], 210);

    elsif tipo_dia = 'mixed' then
      insert into schedule_blocks (day_id, bloque, tipo, tema_ids, duracion_min)
      values
        (day_id, 'manana', 'repaso',    array[t1, t2], 240),
        (day_id, 'tarde',  'test_mixto', all_temas[1:5], 210);
    end if;

  end loop;
end $$;

-- ============================================================
-- SEED: empty progreso rows for each tema (optional, makes
-- the progress page show all temas even before any session)
-- ============================================================
insert into progreso (tema_id, porcentaje)
select id, 0 from temas
on conflict (tema_id) do nothing;

-- Enable Row Level Security (open policy for now — lock down per user later)
alter table temas           enable row level security;
alter table schedule_days   enable row level security;
alter table schedule_blocks enable row level security;
alter table progreso        enable row level security;

create policy "Allow all for anon" on temas           for all using (true) with check (true);
create policy "Allow all for anon" on schedule_days   for all using (true) with check (true);
create policy "Allow all for anon" on schedule_blocks for all using (true) with check (true);
create policy "Allow all for anon" on progreso        for all using (true) with check (true);

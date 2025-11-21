-- Up Migration
create table public.lista_mascotas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  tipo_aviso text not null, -- 'perdida' o 'encontrada'
  nombre_mascota text null,
  tipo_mascota text not null,
  raza text not null,
  descripcion_detallada text not null,
  ultima_ubicacion text not null,
  foto_url text null,
  contacto_usuario_id uuid null
);

-- Habilitar Row Level Security (RLS)
alter table public.lista_mascotas enable row level security;

-- Política para permitir la inserción de datos de forma anónima (para tu formulario)
create policy "Allow anonymous insert access"
on public.lista_mascotas for insert 
to public 
with check (true);

-- Down Migration
drop table public.lista_mascotas;
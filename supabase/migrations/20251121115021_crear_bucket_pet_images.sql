-- Up Migration: Crear bucket de storage para imágenes de mascotas

-- Crear el bucket 'pet-images' si no existe
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-images',
  'pet-images',
  true, -- Bucket público para que las imágenes sean accesibles
  52428800, -- 50MB límite de tamaño
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Habilitar RLS en el bucket
-- Nota: Los buckets ya tienen RLS habilitado por defecto en Supabase

-- Política para permitir subir archivos (INSERT) - Permite a usuarios anónimos subir
create policy "Allow public uploads to pet-images"
on storage.objects for insert
to public
with check (bucket_id = 'pet-images');

-- Política para permitir lectura pública de archivos (SELECT)
create policy "Allow public read access to pet-images"
on storage.objects for select
to public
using (bucket_id = 'pet-images');

-- Política para permitir actualización de archivos (UPDATE) - Opcional, si necesitas editar
create policy "Allow public update access to pet-images"
on storage.objects for update
to public
using (bucket_id = 'pet-images')
with check (bucket_id = 'pet-images');

-- Política para permitir eliminación de archivos (DELETE) - Opcional
create policy "Allow public delete access to pet-images"
on storage.objects for delete
to public
using (bucket_id = 'pet-images');

-- Down Migration: Eliminar políticas y bucket
drop policy if exists "Allow public uploads to pet-images" on storage.objects;
drop policy if exists "Allow public read access to pet-images" on storage.objects;
drop policy if exists "Allow public update access to pet-images" on storage.objects;
drop policy if exists "Allow public delete access to pet-images" on storage.objects;

delete from storage.buckets where id = 'pet-images';


-- Agregar columna 'status' a la tabla 'pets' si no existe
-- Esta columna indica si la mascota está 'perdida' o 'encontrada'

-- Agregar la columna status si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pets' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.pets 
        ADD COLUMN status text DEFAULT 'perdida';
        
        -- Actualizar registros existentes sin status
        UPDATE public.pets 
        SET status = 'perdida' 
        WHERE status IS NULL;
    END IF;
END $$;

-- Agregar constraint para asegurar que status solo sea 'perdida' o 'encontrada'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'pets_status_check'
    ) THEN
        ALTER TABLE public.pets 
        ADD CONSTRAINT pets_status_check 
        CHECK (status IN ('perdida', 'encontrada'));
    END IF;
END $$;

-- Asegurar que RLS esté habilitado
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (SELECT) de todas las mascotas
DROP POLICY IF EXISTS "Allow public read access to pets" ON public.pets;
CREATE POLICY "Allow public read access to pets"
ON public.pets FOR SELECT
TO public
USING (true);

-- Política para permitir inserción anónima (INSERT) - ya debería existir
-- Si no existe, la creamos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pets' 
        AND policyname = 'Allow anonymous insert access'
    ) THEN
        CREATE POLICY "Allow anonymous insert access"
        ON public.pets FOR INSERT
        TO public
        WITH CHECK (true);
    END IF;
END $$;


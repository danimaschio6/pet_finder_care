import { createClient } from '@supabase/supabase-js';
import env from '../../env'; // ajustá la ruta si está en otra carpeta

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

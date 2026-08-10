import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL.');
}

if (!supabaseSecretKey) {
  throw new Error(
    'Falta SUPABASE_SECRET_KEY. Esta variable debe existir solo en el servidor.'
  );
}

// CLIENTE PRIVILEGIADO: importar únicamente desde código del servidor.
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
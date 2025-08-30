
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Session, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;

const getSupabaseClient = (session: Session | null = null) => {
  if (!supabase) {
    supabase = createPagesBrowserClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });
  }

  if (session) {
    supabase.auth.setSession(session);
  }

  return supabase;
};

export default getSupabaseClient;

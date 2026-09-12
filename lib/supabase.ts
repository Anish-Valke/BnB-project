import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gregihjbvimwbuyngysa.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Standard Supabase client for client-side operations (Realtime listeners, read-only token queries)
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "dummy-anon-key-for-init"
);

/**
 * Server-side admin client using service-role key for authorized mutations (doctor queue advancements)
 */
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

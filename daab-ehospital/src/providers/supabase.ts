import { createClient } from "@refinedev/supabase";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? "https://placeholder.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});

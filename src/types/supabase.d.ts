import { User as SupabaseUser } from "@supabase/supabase-js";

declare module "@supabase/supabase-js" {
  interface User {
    user_metadata?: {
      full_name?: string;
      phone?: string;
      bio?: string;
    };
  }
}

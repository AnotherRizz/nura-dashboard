// hooks/useUserRole.ts
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRole() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("User")
          .select("role")
          .eq("id", user.id)
          .single();

        if (isMounted) {
          if (error) {
            console.error("Error fetching role:", error);
            setRole(null);
          } else {
            setRole(data?.role ?? null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error fetching role:", err);
        if (isMounted) setLoading(false);
      }
    }

    fetchRole();

    // auto refresh role kalau sesi login berubah
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
}

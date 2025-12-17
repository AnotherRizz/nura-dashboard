// services/poService.ts
import { supabase } from "./supabaseClient";

export async function updatePOStatus(poId: string, status: string) {
  const { error } = await supabase
    .from("purchase_order")
    .update({ status })
    .eq("id", poId);

  if (error) throw error;
}

import { supabase } from "../services/supabaseClient";

export async function updatePOAfterReceiving(poId: any, rows: string | any[], createdBarangByIndex: any[]) {
  if (!poId) return;

  // ======================================
  // UPDATE qty_received
  // ======================================
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const barangIdToUse = r.barangId || createdBarangByIndex[i];
    const jumlahInt = parseInt(r.jumlah || "0", 10);

    if (!barangIdToUse || !jumlahInt) continue;

    // ambil existing detail
    const { data: poDetailRow, error: detailErr } = await supabase
      .from("detail_purchase_order")
      .select("id, qty_received")
      .eq("purchase_order_id", poId)
      .eq("id_barang", barangIdToUse)
      .maybeSingle();

    if (detailErr) {
      console.error("Error mengambil detail:", detailErr);
      continue;
    }

    if (poDetailRow) {
      const newQty = (poDetailRow.qty_received || 0) + jumlahInt;

      await supabase
        .from("detail_purchase_order")
        .update({ qty_received: newQty })
        .eq("id", poDetailRow.id);
    }
  }

  // ======================================
  // UPDATE STATUS PO
  // ======================================
  const { data: cek, error: cekErr } = await supabase
    .from("detail_purchase_order")
    .select("jumlah, qty_received")
    .eq("purchase_order_id", poId);

  if (cekErr) {
    console.error("Gagal cek status PO:", cekErr);
    return;
  }

  if (!cek) return;

  const total = cek.length;
  const full = cek.filter((d) => d.qty_received >= d.jumlah).length;
  const zero = cek.filter((d) => d.qty_received === 0).length;

  let status = "PARTIAL";
  if (zero === total) status = "PENDING";
  else if (full === total) status = "DONE";

  await supabase
    .from("purchase_order")
    .update({ status })
    .eq("id", poId);
}

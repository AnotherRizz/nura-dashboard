// services/tambahStokService.ts
import { supabase } from "./supabaseClient";
import toast from "react-hot-toast";

// =============================
// TYPES
// =============================
export interface Barang {
  id: string;
  nama_barang: string;
  harga?: number;
  merk?: string;
  tipe?: string;
  satuan?: string;
  serial_number?: string;
  id_kategori?: string;
  supplier_id?: string;
}

export interface Kategori {
  id: string;
  nama_kategori: string;
}

export interface Supplier {
  id: string;
  nama_supplier: string;
}

export interface Gudang {
  id: string;
  nama_gudang: string;
}

export interface RowInput {
  barangId: string;
  search: string;
  jumlah: string;
  merk: string;
  tipe: string;
  satuan: string;
  kategoriId: string;
  supplierId: string;
  harga: string;
  serialNumbers: string[];
  hasSerial: boolean;
}

// =============================
// FETCH MASTER DATA
// =============================
export async function fetchMasterData() {
  try {
    const [barangRes, kategoriRes, supplierRes, gudangRes, poRes] =
      await Promise.all([
        supabase
          .from("Barang")
          .select(
            "id,nama_barang,harga,merk,tipe,satuan,serial_number,id_kategori,supplier_id"
          )
          .order("nama_barang"),

        supabase.from("Kategori").select("id,nama_kategori").order("nama_kategori"),

        supabase.from("Supplier").select("id,nama_supplier").order("nama_supplier"),

        supabase.from("gudang").select("id,nama_gudang").order("nama_gudang"),

        supabase.from("purchase_order").select("id,no_po,gudang_id").order("no_po"),
      ]);

    return {
      barangList: barangRes.data || [],
      kategoriList: kategoriRes.data || [],
      supplierList: supplierRes.data || [],
      gudangList: gudangRes.data || [],
      poList: poRes.data || [],
    };
  } catch (err) {
    toast.error("Gagal memuat data master");
    throw err;
  }
}

// =============================
// PO DETAIL LOADER
// =============================
export async function loadPODetails(poId: string) {
  const { data: poDetail, error: poErr } = await supabase
    .from("purchase_order")
    .select("id,gudang_id,keterangan")
    .eq("id", poId)
    .single();

  if (poErr || !poDetail) throw poErr || new Error("PO tidak ditemukan");

  const { data: details, error } = await supabase
    .from("detail_purchase_order")
    .select(
      `
      id_barang,
      jumlah,
      harga_satuan,
      Barang (
        id,
        nama_barang,
        merk,
        tipe,
        satuan,
        id_kategori,
        supplier_id,
        harga
      )
    `
    )
    .eq("purchase_order_id", poId);

  if (error) throw error;

  return { poDetail, details };
}

// =============================
// CREATE BARANG BARU JIKA BELUM ADA
// =============================
export async function createBarangIfNeeded(
  row: RowInput,
  barangList: Barang[],
  kategoriId?: string,
  supplierId?: string
): Promise<string> {
  // jika sudah punya barangId → langsung return
  if (row.barangId) return row.barangId;

  // cek apakah nama barang sudah ada
  const exist = barangList.find(
    (b) => b.nama_barang.trim().toLowerCase() === row.search.trim().toLowerCase()
  );

  if (exist) return exist.id;

  // buat baru
  const { data, error } = await supabase
    .from("Barang")
    .insert({
      nama_barang: row.search,
      id_kategori: kategoriId || null,
      supplier_id: supplierId || null,
      harga: row.harga ? Number(row.harga) : 0,
      merk: row.merk || "",
      tipe: row.tipe || "",
      satuan: row.satuan || "",
      serial_number: "",
    })
    .select()
    .single();

  if (error) throw error;

  return data.id;
}

// =============================
// UPDATE / INSERT STOK GUDANG
// =============================
export async function updateStokGudang(
  barangId: string,
  gudangId: string,
  jumlah: number
): Promise<string> {
  const { data: existing } = await supabase
    .from("stok_gudang")
    .select("*")
    .eq("barang_id", barangId)
    .eq("gudang_id", gudangId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("stok_gudang")
      .update({ stok: existing.stok + jumlah })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;

    return data.id;
  }

  const { data: created, error: insertErr } = await supabase
    .from("stok_gudang")
    .insert({
      barang_id: barangId,
      gudang_id: gudangId,
      stok: jumlah,
    })
    .select()
    .single();

  if (insertErr) throw insertErr;

  return created.id;
}



// =============================
// SUBMIT BARANG MASUK + DETAIL
// =============================
export async function submitBarangMasuk(
  rows: RowInput[],
  gudangId: string,
  keterangan: string,
  barangList: Barang[]
) {
  // create main entry
  const { data: masuk, error: masukErr } = await supabase
    .from("BarangMasuk")
    .insert({
      tanggal_masuk: new Date().toISOString(),
      keterangan,
      gudang_id: gudangId,
    })
    .select()
    .single();

  if (masukErr) throw masukErr;

  const detailInsertPayload: {
    id_barang_masuk: string;
    id_barang: string;
    jumlah: number;
    harga_masuk: number;
  }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    const barangId = await createBarangIfNeeded(
  r,
  barangList,
  r.kategoriId,
  r.supplierId
);

const jumlah = parseInt(r.jumlah);
const harga = r.harga ? Number(r.harga) : 0;

// Insert ke detail barang masuk
detailInsertPayload.push({
  id_barang_masuk: masuk.id,
  id_barang: barangId,
  jumlah,
  harga_masuk: harga,
});

// UPDATE STOK + AMBIL ID
const stokGudangId = await updateStokGudang(barangId, gudangId, jumlah);

// INSERT SERIAL NUMBER
if (r.serialNumbers && r.serialNumbers.length > 0) {
  const serialInsert = r.serialNumbers
    .filter((sn) => sn && sn.trim() !== "")
    .map((sn) => ({
      sn,
      stok_gudang_id: stokGudangId,
      status: "available",
    }));

  const { error: snErr } = await supabase
    .from("serial_number")
    .insert(serialInsert);

  if (snErr) throw snErr;
}

  }

  const { error: dtErr } = await supabase
    .from("DetailBarangMasuk")
    .insert(detailInsertPayload);

  if (dtErr) throw dtErr;

  return masuk.id;
}

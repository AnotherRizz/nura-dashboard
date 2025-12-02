"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

interface Barang {
  id: string;
  nama_barang: string;
  harga: number;
}

interface Gudang {
  id: string;
  nama_gudang: string;
}

interface Row {
  barangId: string;
  nama: string;
  jumlah: string;

  // NEW: gudang
  gudangId: string;
  gudangSearch: string;
  gudangNama: string;
  showGudangDropdown: boolean;

  // barang search
  search: string;
  showDropdown: boolean;
}

export default function TambahStokMultiple() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [gudangList, setGudangList] = useState<Gudang[]>([]); // NEW

  const [rows, setRows] = useState<Row[]>([
    {
      barangId: "",
      nama: "",
      jumlah: "",

      gudangId: "",
      gudangNama: "",
      gudangSearch: "",
      showGudangDropdown: false,

      search: "",
      showDropdown: false,
    },
  ]);

  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      const { data: barang } = await supabase
        .from("Barang")
        .select("id,nama_barang,harga")
        .order("nama_barang");

      const { data: gudang } = await supabase
        .from("gudang") // NEW
        .select("*")
        .order("nama_gudang");

      setBarangList(barang || []);
      setGudangList(gudang || []);
    };

    fetchData();
  }, []);

  const updateRow = <K extends keyof Row>(index: number, field: K, value: Row[K]) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        barangId: "",
        nama: "",
        jumlah: "",

        gudangId: "",
        gudangNama: "",
        gudangSearch: "",
        showGudangDropdown: false,

        search: "",
        showDropdown: false,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================= SUBMIT =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keterangan.trim()) return toast.error("Keterangan harus diisi!");

    for (const r of rows) {
      if (!r.barangId || !r.jumlah || !r.gudangId)
        return toast.error("Semua baris harus lengkap! Barang, jumlah & gudang wajib diisi.");
    }

    setLoading(true);

    try {
      // Insert BarangMasuk
      const { data: masuk, error: masukErr } = await supabase
        .from("BarangMasuk")
        .insert({
          tanggal_masuk: new Date().toISOString(),
          keterangan,
        })
        .select()
        .single();

      if (masukErr) throw masukErr;

      // Insert detail
      const detailInsert = [];

      for (const r of rows) {
        const barang = barangList.find((b) => b.id === r.barangId);
        if (!barang) continue;

        const jumlahInt = parseInt(r.jumlah);

        // Insert detail barang masuk
        detailInsert.push({
          id_barang_masuk: masuk.id,
          id_barang: r.barangId,
          jumlah: jumlahInt,
          harga_masuk: barang.harga,
        });

        // ====== SIMPAN STOK KE TABEL STOK_GUDANG ======
        const { data: existing } = await supabase
          .from("stok_gudang")
          .select("*")
          .eq("barang_id", r.barangId)
          .eq("gudang_id", r.gudangId)
          .maybeSingle();

        if (existing) {
          // update stok lama
          await supabase
            .from("stok_gudang")
            .update({ stok: existing.stok + jumlahInt })
            .eq("id", existing.id);
        } else {
          // insert stok baru
          await supabase.from("stok_gudang").insert({
            barang_id: r.barangId,
            gudang_id: r.gudangId,
            stok: jumlahInt,
          });
        }
      }

      await supabase.from("DetailBarangMasuk").insert(detailInsert);

      toast.success("Stok berhasil ditambahkan!");
      navigate("/barang-masuk");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form
        className="space-y-5 p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold dark:text-teal-400">
          Tambah Stok Barang (Multi)
        </h2>

        {/* Keterangan */}
        <div>
          <label className="text-sm font-semibold dark:text-white/80">Keterangan</label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Contoh: Restock gudang utama"
          />
        </div>

        {/* BARIS BARANG */}
        {rows.map((row, index) => {
          const filteredBarang = barangList.filter((b) =>
            b.nama_barang.toLowerCase().includes(row.search.toLowerCase())
          );

          const filteredGudang = gudangList.filter((g) =>
            g.nama_gudang.toLowerCase().includes(row.gudangSearch.toLowerCase())
          );

          return (
            <div
              key={index}
              className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 dark:border-gray-700 shadow-sm relative"
            >
              {/* ================= BARANG SEARCH ================= */}
              <label className="text-sm font-semibold dark:text-white/80">Barang</label>
              <input
                type="text"
                value={row.nama || row.search}
                onChange={(e) => {
                  updateRow(index, "search", e.target.value);
                  updateRow(index, "showDropdown", true);
                }}
                className="w-full border rounded px-3 py-2 mb-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Cari barang..."
              />

              {row.showDropdown && (
                <ul className="absolute bg-white dark:bg-gray-800 border dark:border-gray-600 w-full max-h-48 overflow-y-auto rounded shadow z-20">
                  {filteredBarang.length > 0 ? (
                    filteredBarang.map((b) => (
                      <li
                        key={b.id}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                        onClick={() => {
                          updateRow(index, "barangId", b.id);
                          updateRow(index, "nama", b.nama_barang);
                          updateRow(index, "search", b.nama_barang);
                          updateRow(index, "showDropdown", false);
                        }}
                      >
                        {b.nama_barang}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-500">Tidak ditemukan</li>
                  )}
                </ul>
              )}

              {/* ================= JUMLAH ================= */}
              <label className="block mt-3 text-sm font-semibold dark:text-white/80">
                Jumlah
              </label>
              <input
                type="number"
                value={row.jumlah}
                onChange={(e) => updateRow(index, "jumlah", e.target.value)}
                placeholder="Jumlah"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />

              {/* ================= GUDANG SEARCH ================= */}
              <label className="block mt-3 text-sm font-semibold dark:text-white/80">
                Gudang
              </label>
              <input
                type="text"
                value={row.gudangNama || row.gudangSearch}
                onChange={(e) => {
                  updateRow(index, "gudangSearch", e.target.value);
                  updateRow(index, "showGudangDropdown", true);
                }}
                placeholder="Cari gudang..."
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />

              {row.showGudangDropdown && (
                <ul className="absolute bg-white dark:bg-gray-800 border dark:border-gray-600 w-full max-h-48 overflow-y-auto rounded shadow z-20 mt-1">
                  {filteredGudang.length > 0 ? (
                    filteredGudang.map((g) => (
                      <li
                        key={g.id}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                        onClick={() => {
                          updateRow(index, "gudangId", g.id);
                          updateRow(index, "gudangNama", g.nama_gudang);
                          updateRow(index, "gudangSearch", g.nama_gudang);
                          updateRow(index, "showGudangDropdown", false);
                        }}
                      >
                        {g.nama_gudang}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-500">Gudang tidak ditemukan</li>
                  )}
                </ul>
              )}

              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="absolute top-2 right-2 text-red-500 text-xl"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* ADD ROW */}
        <button
          type="button"
          onClick={addRow}
          className="px-4 py-2 bg-teal-500 text-white rounded shadow"
        >
          + Tambah Baris
        </button>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Semua"}
          </button>
        </div>
      </form>

      {/* PREVIEW */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-3 dark:text-teal-400">Preview</h3>

        <p className="mb-3 dark:text-white">
          <b>Keterangan:</b> {keterangan || "-"}
        </p>

        {rows.map((r, i) => {
          const barang = barangList.find((b) => b.id === r.barangId);

          return (
            <div key={i} className="border-b dark:border-gray-700 pb-3 mb-3">
              <p className="dark:text-white">
                <b>Barang:</b> {r.nama || "-"}
              </p>
              <p className="dark:text-white">
                <b>Jumlah:</b> {r.jumlah || "-"}
              </p>
              <p className="dark:text-white">
                <b>Gudang:</b> {r.gudangNama || "-"}
              </p>
              <p className="dark:text-white">
                <b>Harga Per Item:</b>{" "}
                {barang ? barang.harga.toLocaleString() : "-"}
              </p>
              <p className="dark:text-white">
                <b>Total Harga:</b>{" "}
                {barang && r.jumlah
                  ? (barang.harga * parseInt(r.jumlah)).toLocaleString()
                  : "-"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

interface Barang {
  id: string;
  nama_barang: string;
  stok: number;
  harga: number;
}

interface Row {
  barangId: string;
  nama: string;
  jumlah: string;
  search: string;
  showDropdown: boolean;
}

export default function TambahStokMultiple() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [rows, setRows] = useState<Row[]>([
    { barangId: "", nama: "", jumlah: "", search: "", showDropdown: false }
  ]);

  const [keterangan, setKeterangan] = useState(""); // <-- KETERANGAN BARU!
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBarang = async () => {
      const { data } = await supabase
        .from("Barang")
        .select("id,nama_barang,stok,harga")
        .order("nama_barang");
      setBarangList(data || []);
    };
    fetchBarang();
  }, []);

  const updateRow = <K extends keyof Row>(index: number, field: K, value: Row[K]) => {
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { barangId: "", nama: "", jumlah: "", search: "", showDropdown: false }
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keterangan.trim()) {
      toast.error("Keterangan harus diisi!");
      return;
    }

    for (const r of rows) {
      if (!r.barangId || !r.jumlah) {
        toast.error("Semua baris harus diisi!");
        return;
      }
    }

    setLoading(true);

    try {
      const { data: masukData, error: masukError } = await supabase
        .from("BarangMasuk")
        .insert({
          tanggal_masuk: new Date().toISOString(),
          keterangan: keterangan // <-- sekarang memakai input user
        })
        .select()
        .single();

      if (masukError) throw masukError;

      const detailInsert = [];
      const updatePromises = [];

      for (const r of rows) {
        const barang = barangList.find(b => b.id === r.barangId);
        if (!barang) continue;

        const hargaFinal = barang.harga;

        detailInsert.push({
          id_barang_masuk: masukData.id,
          id_barang: r.barangId,
          jumlah: parseInt(r.jumlah),
          harga_masuk: hargaFinal
        });

        updatePromises.push(
          supabase
            .from("Barang")
            .update({
              stok: barang.stok + parseInt(r.jumlah),
              harga: hargaFinal
            })
            .eq("id", barang.id)
        );
      }

      await supabase.from("DetailBarangMasuk").insert(detailInsert);
      await Promise.all(updatePromises);

      toast.success("Berhasil menambah stok!");
      navigate("/barang-masuk");

    } catch (err) {
      console.error(err);
      toast.error("Gagal menambah stok");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* ================== FORM ================== */}
      <form
        className="space-y-5 p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold dark:text-teal-400">Tambah Stok Barang</h2>

        {/* INPUT KETERANGAN */}
        <div>
          <label className="text-sm font-semibold dark:text-white/80">Keterangan</label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Contoh: Barang restock gudang"
          />
        </div>

        {rows.map((row, index) => {
          const filtered = barangList.filter(b =>
            b.nama_barang.toLowerCase().includes(row.search.toLowerCase())
          );

          return (
            <div
              key={index}
              className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 dark:border-gray-700 shadow-sm relative"
            >
              {/* Search */}
              <label className="text-sm font-semibold dark:text-white/80">Barang</label>
              <input
                type="text"
                value={row.nama || row.search}
                onChange={(e) => {
                  updateRow(index, "search", e.target.value);
                  updateRow(index, "nama", "");
                  updateRow(index, "barangId", "");
                  updateRow(index, "showDropdown", true);
                }}
                className="w-full border rounded px-3 py-2 mb-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Cari barang..."
              />

              {row.showDropdown && (
                <ul className="absolute bg-white dark:bg-gray-800 border dark:border-gray-600 w-full max-h-48 overflow-y-auto rounded shadow z-20">
                  {filtered.length > 0 ? (
                    filtered.map(b => (
                      <li
                        key={b.id}
                        className="px-3 py-2 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          updateRow(index, "barangId", b.id);
                          updateRow(index, "nama", b.nama_barang);
                          updateRow(index, "search", b.nama_barang);
                          updateRow(index, "showDropdown", false);
                        }}
                      >
                        {b.nama_barang}
                        <span className="text-gray-500"> (stok: {b.stok})</span>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-400">Tidak ditemukan</li>
                  )}
                </ul>
              )}

              {/* Jumlah */}
              <label className="text-sm font-semibold block mt-3 dark:text-white/80">Jumlah</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={row.jumlah}
                onChange={(e) => updateRow(index, "jumlah", e.target.value)}
                placeholder="Jumlah"
              />

              {/* Delete */}
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

        {/* Add row */}
        <button
          type="button"
          onClick={addRow}
          className="px-4 py-2 bg-teal-500 text-white rounded shadow"
        >
          + Tambah Baris
        </button>

        {/* Submit */}
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

      {/* ================== PREVIEW ================== */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-3 dark:text-teal-400">Preview</h3>

        <p className="mb-3 dark:text-white">
          <b>Keterangan:</b> {keterangan || "-"}
        </p>

        {rows.map((r, i) => {
          const barang = barangList.find(b => b.id === r.barangId);

          return (
            <div key={i} className="border-b dark:border-gray-700 pb-3 mb-3">
              <p className="dark:text-white"><b>Barang:</b> {r.nama || "-"}</p>
              <p className="dark:text-white"><b>Jumlah:</b> {r.jumlah || "-"}</p>
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

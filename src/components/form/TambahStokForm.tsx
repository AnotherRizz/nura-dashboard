"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

interface Barang {
  id: string;
  nama_barang: string;
  stok: number;
}

interface BarangMasuk {
  id: string;
  tanggal_masuk: string;
  keterangan: string;
}

export default function TambahStokForm() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // 🔍 untuk pencarian
  const [selectedBarang, setSelectedBarang] = useState<string>("");
  const [jumlah, setJumlah] = useState<string>("");
  const [hargaMasuk, setHargaMasuk] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const navigate = useNavigate();

  // 🔹 Ambil semua barang
  useEffect(() => {
    const fetchBarang = async () => {
      const { data, error } = await supabase
        .from("Barang")
        .select("id, nama_barang, stok")
        .order("nama_barang");

      if (error) {
        console.error("Gagal ambil data barang:", error);
        return;
      }
      setBarangList(data || []);
    };

    fetchBarang();
  }, []);

  // 🔹 Filter hasil pencarian
  const filteredBarang = barangList.filter((b) =>
    b.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarang || !jumlah) {
      toast.error("Pilih barang dan isi jumlah stok!");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Ambil data barang lama
      const { data: barang, error: barangError } = await supabase
        .from("Barang")
        .select("stok, nama_barang, harga")
        .eq("id", selectedBarang)
        .single();

      if (barangError || !barang) throw barangError;

      // 2️⃣ Update stok + harga barang
      const newStock = (barang.stok ?? 0) + parseInt(jumlah);
      const newHarga = parseFloat(hargaMasuk || "0");

      const { error: updateError } = await supabase
        .from("Barang")
        .update({
          stok: newStock,
          harga: newHarga > 0 ? newHarga : barang.harga,
        })
        .eq("id", selectedBarang);

      if (updateError) throw updateError;

      // 3️⃣ Insert ke tabel BarangMasuk
      const { data: masukData, error: masukError } = await supabase
        .from("BarangMasuk")
        .insert([
          {
            tanggal_masuk: new Date().toISOString(),
            keterangan: `Penambahan stok ${barang.nama_barang}`,
          },
        ])
        .select()
        .single<BarangMasuk>();

      if (masukError) throw masukError;

      // 4️⃣ Insert ke tabel DetailBarangMasuk
      const { error: detailError } = await supabase
        .from("DetailBarangMasuk")
        .insert([
          {
            id_barang_masuk: masukData.id,
            id_barang: selectedBarang,
            jumlah: parseInt(jumlah),
            harga_masuk: parseFloat(hargaMasuk || "0"),
          },
        ]);

      if (detailError) throw detailError;

      toast.success(" Stok berhasil ditambahkan!");
      navigate("/barang");
    } catch (err) {
      console.error(" Gagal menambah stok:", err);
      toast.error("Terjadi kesalahan saat menambah stok.");
    } finally {
      setLoading(false);
    }
  };

  const selectedBarangName =
    barangList.find((b) => b.id === selectedBarang)?.nama_barang || "";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:border-gray-800 dark:bg-white/[0.03] dark:text-white p-6 rounded shadow-md">
      <h2 className="text-lg font-semibold text-brand-600 mb-4">
        Tambah Stok Barang
      </h2>

      {/* Searchable Dropdown Barang */}
      <div className="relative">
        <label className="block mb-1 text-sm font-medium">Pilih Barang</label>
        <input
          type="text"
          value={selectedBarang ? selectedBarangName : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedBarang("");
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Ketik nama barang..."
          className="w-full rounded border px-3 py-2 dark:border-gray-600"
        />
        {showDropdown && (
          <ul className="absolute z-10 bg-white dark:bg-gray-700 w-full border rounded mt-1 max-h-48 overflow-y-auto shadow">
            {filteredBarang.length > 0 ? (
              filteredBarang.map((b) => (
                <li
                  key={b.id}
                  onClick={() => {
                    setSelectedBarang(b.id);
                    setSearchTerm(b.nama_barang);
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer">
                  {b.nama_barang}{" "}
                  <span className="text-sm text-gray-500">
                    (stok: {b.stok})
                  </span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-400 text-sm">
                Barang tidak ditemukan
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Jumlah */}
      <div>
        <label className="block mb-1 text-sm font-medium">Jumlah Tambah</label>
        <input
          type="number"
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
          className="w-full rounded border px-3 py-2 dark:border-gray-600"
          placeholder="Masukkan jumlah stok yang ingin ditambahkan"
        />
      </div>

      {/* Harga Masuk */}
      <div>
        <label className="block mb-1 text-sm font-medium">Harga Masuk <span className="text-xs text-gray-400"> cth : 1000000</span></label>
        <input
          type="number"
          value={hargaMasuk}
          onChange={(e) => setHargaMasuk(e.target.value)}
          className="w-full rounded border px-3 py-2 dark:border-gray-600"
          placeholder="Masukkan harga masuk (opsional)"
        />
      </div>

      {/* Tombol */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Menyimpan..." : "Tambah Stok"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/barang")}
          className="px-4 py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600">
          Batal
        </button>
      </div>
    </form>
  );
}

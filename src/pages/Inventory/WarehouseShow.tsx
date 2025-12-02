import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../services/supabaseClient";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

import { BoxCubeIcon } from "../../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface Gudang {
  id: number;
  nama_gudang: string;
  lokasi?: string;
  keterangan?: string;
}

interface Barang {
  id: number;
  nama_barang: string;
  kode_barang: string;
  stok: number;
  satuan: string;
  harga: number;
  kategori?: { nama_kategori: string };
  supplier?: { nama_supplier: string };
}

export default function WarehouseShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [gudang, setGudang] = useState<Gudang | null>(null);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [filteredBarang, setFilteredBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJenis, setTotalJenis] = useState(0);
const [totalItem, setTotalItem] = useState(0);


  const [search, setSearch] = useState("");

 const fetchGudang = async () => {
  try {
    // Ambil data gudang
    const { data: gudangData, error: gudangErr } = await supabase
      .from("gudang")
      .select("*")
      .eq("id", id)
      .single();

    if (gudangErr) throw gudangErr;

    setGudang(gudangData);

    // AMBIL STOK GUDANG + DETAIL BARANG
   const { data: stokData, error: stokErr } = await supabase
  .from("stok_gudang")
  .select(`
    id,
    stok,
    barang:barang_id (
      id,
      nama_barang,
      kode_barang,
      satuan,
      harga,
      kategori:Kategori (nama_kategori),
      supplier:Supplier (nama_supplier)
    )
  `)
  .eq("gudang_id", id);


    if (stokErr) throw stokErr;

    // Ubah ke format Barang[]
  const mapped = stokData.map((item: any) => ({
  id: item.barang.id,
  nama_barang: item.barang.nama_barang,
  kode_barang: item.barang.kode_barang,
  stok: item.stok,    // ← stok asli dari stok_gudang
  satuan: item.barang.satuan,
  harga: item.barang.harga,
  kategori: item.barang.kategori,
  supplier: item.barang.supplier,
}));

setBarangList(mapped);
setFilteredBarang(mapped);

// hitung total jenis dan item
setTotalJenis(mapped.length);
setTotalItem(mapped.reduce((sum, b) => sum + (b.stok || 0), 0));

  } catch (error) {
    console.error("Gagal memuat gudang:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (id) fetchGudang();
  }, [id]);

  // -----------------------
  // 🔍 SEARCH FILTER
  // -----------------------
  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = barangList.filter(
      (b) =>
        b.nama_barang.toLowerCase().includes(term) ||
        b.kode_barang.toLowerCase().includes(term)
    );
    setFilteredBarang(filtered);
  }, [search, barangList]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!gudang) return <div className="p-6">Gudang tidak ditemukan.</div>;

  return (
    <div>
      <PageMeta
        description=""
        title={`Detail Gudang - ${gudang.nama_gudang}`}
      />

      <PageBreadcrumb pageTitle="Detail Gudang" />

      <div className="min-h-screen px-4 py-10 space-y-10">
        {/* DETAIL GUDANG */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
          <h2 className="text-2xl flex gap-1 font-bold text-gray-800 dark:text-white/90 mb-6">
            <BoxCubeIcon /> Detail Gudang
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Nama Gudang:
              </span>
              <span className="text-gray-900 dark:text-white">
                {gudang.nama_gudang}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Lokasi:
              </span>
              <span className="text-gray-900 dark:text-white">
                {gudang.lokasi || "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Keterangan:
              </span>
              <span className="text-gray-900 dark:text-white">
                {gudang.keterangan || "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Total Barang:
              </span>
           <span className="text-gray-900 dark:text-white">
  {totalJenis} jenis, total {totalItem} item
</span>

            </div>
          </div>
        </div>

        {/* TABEL BARANG + SEARCH */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Daftar Barang di Gudang Ini
            </h2>

            <input
              placeholder="Cari barang di gudang ini..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 w-80 dark:bg-gray-900 dark:text-white dark:border-gray-700"
            />
          </div>

          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Kode Barang
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Nama Barang
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Kategori
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Supplier
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Stok
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Harga
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredBarang.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {b.kode_barang}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {b.nama_barang}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {b.kategori?.nama_kategori || "-"}
                  </TableCell>

                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {b.supplier?.nama_supplier || "-"}
                  </TableCell>

                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {b.stok} {b.satuan}
                  </TableCell>

                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {b.harga.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    })}
                  </TableCell>
                </TableRow>
              ))}

              {filteredBarang.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Tidak ada barang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* TOMBOL BAWAH */}
        <div className="flex justify-end gap-2">
          <Button
            className="rounded-xl !bg-gray-800 text-white"
            onClick={() => navigate("/gudang")}>
            Kembali
          </Button>

          <Button
            className="rounded-xl"
            onClick={() => navigate(`/gudang/edit/${gudang.id}`)}>
            Edit Gudang
          </Button>
        </div>
      </div>
    </div>
  );
}

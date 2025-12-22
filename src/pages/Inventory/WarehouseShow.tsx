import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../services/supabaseClient";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { motion, AnimatePresence } from "framer-motion";

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
  // serial_number?: string[];
  serial_number: {
    id: string;
    sn: string;
    status: string;
  }[];
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
  const [activeTab, setActiveTab] = useState<"stok" | "masuk" | "keluar">(
    "stok"
  );
  const [barangMasukList, setBarangMasukList] = useState<any[]>([]);
  const [barangKeluarList, setBarangKeluarList] = useState<any[]>([]);

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
        .select(
          `
  id,
  stok,
serial_number:serial_number!serial_number_stok_gudang_id_fkey (
  id,
  sn,
  status
),

  barang:barang_id (
    id,
    nama_barang,
    kode_barang,
    satuan,
    harga,
    kategori:Kategori (nama_kategori),
    supplier:Supplier (nama_supplier)
  )
`
        )
        .eq("gudang_id", id);

      if (stokErr) throw stokErr;

      // Ubah ke format Barang[]
      const mapped = stokData.map((item: any) => ({
        id: item.barang.id,
        nama_barang: item.barang.nama_barang,
        kode_barang: item.barang.kode_barang,
        stok: item.stok,
        satuan: item.barang.satuan,
        harga: item.barang.harga,
        kategori: item.barang.kategori,
        supplier: item.barang.supplier,
        serial_number: item.serial_number || [],
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

  const fetchBarangMasuk = async () => {
    const { data, error } = await supabase
      .from("BarangMasuk")
      .select(
        `
      id,
      tanggal_masuk,
      keterangan,
      gudang_id,
      gudang:gudang (
        id,
        nama_gudang
      ),
      detailBarang:DetailBarangMasuk!id_barang_masuk (
        id,
        id_barang,
        jumlah,
        harga_masuk,
        barang:Barang (
          id,
          kode_barang,
          nama_barang,
          satuan,
          merk,
          tipe,
        stok_gudang (
  id,
  stok,
  gudang_id,
  serial_number!serial_number_stok_gudang_id_fkey (
    id,
    sn,
    status,
    detail_barang_masuk_id
  )
)

        )
      )
    `
      )
      .eq("gudang_id", id); // ✅ FILTER GUDANG DI SINI

    if (error) {
      console.error("Error barang masuk:", error);
      return;
    }

    setBarangMasukList(data || []);
  };

  const fetchBarangKeluar = async () => {
    const { data, error } = await supabase
      .from("detail_barang_keluar")
      .select(
        `
      id,
      jumlah,
      harga_keluar,
      barang:Barang (
        id,
        nama_barang,
        kode_barang,
        satuan
      ),
      keluar:barang_keluar (
        id,
        tanggal_keluar,
        keterangan
      ),
      serial_number:serial_number!inner (
        id,
        sn,
        status
      )
    `
      )
      .eq("serial_number.status", "out")
      .eq("distribusi->0->>gudang_id", id); // ✅ FILTER GUDANG DI SINI

    if (error) {
      console.error("Error barang keluar:", error);
      return;
    }

    setBarangKeluarList(data || []);
  };

  useEffect(() => {
    if (id) {
      fetchGudang();
      fetchBarangMasuk();
      fetchBarangKeluar();
    }
  }, [id]);

  function formatDateIndo(value?: string | Date | null) {
    if (!value) return "-";
    const date = new Date(value);

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatRupiah(value?: number | string | null) {
    if (value === null || value === undefined) return "-";

    const num = typeof value === "string" ? Number(value) : value;
    if (isNaN(num)) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  }

  // -----------------------
  // 🔍 SEARCH FILTER
  // -----------------------
  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = barangList.filter((b) => {
      const nama = b.nama_barang?.toLowerCase() || "";
      const kode = b.kode_barang?.toLowerCase() || "";

      return nama.includes(term) || kode.includes(term);
    });

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

        {/* TAB HEADER */}
        <div className="flex gap-4 dark:text-white border-b dark:border-gray-800 pb-2 mb-6">
          <button
            className={
              activeTab === "stok"
                ? "font-bold dark:text-blue-500 dark:border-blue-500 border-b-2 pb-1"
                : ""
            }
            onClick={() => setActiveTab("stok")}>
            Stok Barang
          </button>

          <button
            className={
              activeTab === "masuk"
                ? "font-bold dark:text-blue-500 dark:border-blue-500 border-b-2 pb-1"
                : ""
            }
            onClick={() => setActiveTab("masuk")}>
            Barang Masuk
          </button>

          <button
            className={
              activeTab === "keluar"
                ? "font-bold dark:text-blue-500 dark:border-blue-500 border-b-2 pb-1"
                : ""
            }
            onClick={() => setActiveTab("keluar")}>
            Barang Keluar
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "masuk" && (
            <motion.div
              key="masuk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-gray-200 dark:border-white/10 p-6 
                 bg-white dark:bg-gray-900/40 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Log Barang Masuk di{" "}
                <span className="text-blue-500">{gudang.nama_gudang}</span>{" "}
              </h2>

              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Tanggal Masuk
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Nama Barang
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Jumlah Barang Masuk
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Serial Number
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Harga Masuk
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {barangMasukList.flatMap((bm) =>
                    bm.detailBarang.map((d: any, i: any) => (
                      <TableRow key={`${bm.id}-${i}`}>
                        <TableCell className="px-4 py-3 dark:text-white/80">
                          {formatDateIndo(bm.tanggal_masuk)}
                        </TableCell>

                        <TableCell className="px-4 py-3 dark:text-white/80">
                          {d.barang?.nama_barang}
                        </TableCell>

                        <TableCell className="px-4 py-3 dark:text-white/80">
                          {d.jumlah} / {d.barang?.satuan}
                        </TableCell>

                        <TableCell className="px-4 py-3 dark:text-white/80">
                          {d.barang?.stok_gudang
                            ?.filter(
                              (sg: any) => String(sg.gudang_id) === String(id)
                            )
                            .flatMap((sg: any) =>
                              (sg.serial_number || []).filter(
                                (sn: any) => sn.detail_barang_masuk_id === d.id
                              )
                            ).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {d.barang.stok_gudang
                                .filter(
                                  (sg: any) =>
                                    String(sg.gudang_id) === String(id)
                                )
                                .flatMap((sg: any) =>
                                  (sg.serial_number || []).filter(
                                    (sn: any) =>
                                      sn.detail_barang_masuk_id === d.id
                                  )
                                )
                                .map((sn: any) => (
                                  <span
                                    key={sn.id}
                                    className="px-2 py-0.5 text-sm rounded-full
              bg-emerald-100 text-emerald-700
              dark:bg-emerald-900/40 dark:text-emerald-300">
                                    {sn.sn}
                                  </span>
                                ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell className="px-4 py-3 dark:text-white/80">
                          {formatRupiah(d.harga_masuk)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  {barangMasukList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Tidak ada barang ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === "keluar" && (
            <motion.div
              key="keluar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-gray-200 dark:border-white/10 p-6 
                 bg-white dark:bg-gray-900/40 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                {" "}
                Log Barang Keluar di{" "}
                <span className="text-blue-500">{gudang.nama_gudang}</span>{" "}
              </h2>

              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Tanggal Keluar
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Kode
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Nama Barang
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Jumlah Barang Keluar
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-start dark:text-white sm:px-6">
                      Serial Number
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {barangKeluarList.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3 dark:text-white/80">
                        {formatDateIndo(row.keluar?.tanggal_keluar)}
                      </TableCell>
                      <TableCell className="px-4 py-3 dark:text-white/80">
                        {row.barang?.kode_barang}
                      </TableCell>
                      <TableCell className="px-4 py-3 dark:text-white/80">
                        {row.barang?.nama_barang}
                      </TableCell>

                      <TableCell className="px-4 py-3 dark:text-white/80">
                        {row.jumlah} {row.barang?.satuan}
                      </TableCell>
                      <TableCell className="px-4 py-3 dark:text-white/80">
                        {row.serial_number?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.serial_number.map((sn: any) => (
                              <span
                                key={sn.id}
                                className="
            px-2 py-0.5 text-sm rounded-full
            bg-red-400/30 text-red-600
            line-through italic
          ">
                                {sn.sn}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {barangKeluarList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Tidak ada barang ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === "stok" && (
            <motion.div
              key="stok"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-gray-200 dark:border-white/10 
                 bg-white dark:bg-gray-900/40 shadow-lg p-8 backdrop-blur-sm">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  Daftar Barang di{" "}
                  <span className="text-blue-500">{gudang.nama_gudang}</span>
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
                      Serial Number
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
                        {b.serial_number && b.serial_number.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {b.serial_number.map((sn, i) => {
                              const statusClass =
                                sn.status === "available"
                                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                  : sn.status === "created"
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                  : sn.status === "out"
                                  ? "bg-red-400/30 text-red-500 line-through italic"
                                  : "bg-red-500/20 text-red-600";

                              return (
                                <span
                                  key={i}
                                  className={`
              px-2 py-0.5 text-sm rounded-full
              ${statusClass}
            `}>
                                  {sn.sn}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          "-"
                        )}
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
                      <TableCell colSpan={7} className="text-center py-4">
                        Tidak ada barang ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOMBOL BAWAH */}
        <div className="flex justify-end gap-2">
          <Button
            className="rounded-xl !bg-gray-800 text-white"
            onClick={() => navigate("/warehouse")}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}

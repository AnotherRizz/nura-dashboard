import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../services/supabaseClient"; // 🔹 pakai supabase
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { BoxCubeIcon, PieChartIcon, UserIcon } from "../../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface DetailMasuk {
  id: string;
  id_barang_masuk: string;
  id_barang: string;
  jumlah: number;
  harga_masuk: string;
}

interface Barang {
  id: string;
  nama_barang: string;
  kode_barang: string;
  satuan: string;
  gambar: string;
  stok: number;
  harga: number;
  kategori?: {
    nama_kategori: string;
  };
  supplier?: {
    nama_supplier: string;
    alamat?: string;
    kontak?: string;
    email?: string;
  };
  detailMasuk?: DetailMasuk[];
}

export default function BarangShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBarang = async () => {
    try {
      // 🔹 Query Supabase dengan join kategori, supplier, dan detailMasuk
      const { data, error } = await supabase
        .from("Barang")
        .select(
          `
          *,
          kategori:Kategori (nama_kategori),
          supplier:Supplier (nama_supplier,nama_pt, alamat, nama_pic, telp_pic),
          detailMasuk:DetailBarangMasuk (id, id_barang_masuk, id_barang, jumlah, harga_masuk)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setBarang(data as Barang);
    } catch (err) {
      console.error("Gagal mengambil detail barang", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBarang();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!barang) return <div className="p-6">Barang tidak ditemukan.</div>;

  // 🔹 Data untuk Bar Chart
  const chartCategories =
    barang.detailMasuk?.map((d) => `Masuk #${d.id_barang_masuk}`) || [];
  const chartSeries = [
    {
      name: "Jumlah Masuk",
      data: barang.detailMasuk?.map((d) => d.jumlah) || [],
    },
  ];

  const chartOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 220,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartCategories,
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: { labels: { style: { fontSize: "12px" } } },
    legend: { show: false },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: {
      y: { formatter: (val: number) => `${val} unit` },
    },
  };

  return (
    <div>
      <PageMeta
        title={`Detail Barang - ${barang.nama_barang}`}
        description="Detail barang"
      />
      <PageBreadcrumb pageTitle="Detail Barang" />

      <div className="min-h-screen px-4 py-10 space-y-10">
        {/* Detail Barang & Supplier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kiri: Detail Barang */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800  dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
            <h2 className="text-2xl flex gap-1 font-bold text-gray-800 dark:text-white/90 mb-6">
              <BoxCubeIcon /> Detail Barang
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Kode Barang:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {barang.kode_barang}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Nama Barang:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {barang.nama_barang}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Kategori:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {barang.kategori?.nama_kategori || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Stok:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {barang.stok}/{barang.satuan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Harga:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {barang.harga.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{" "}
                  / {barang.satuan}
                </span>
              </div>
              {/* Gambar Barang */}
              {barang.gambar && (
                <div className="flex justify-center mb-6">
                  <img
                    src={`https://fffzifpspmyhehqhrbtm.supabase.co/storage/v1/object/public/barang-images/${barang.gambar}`}
                    alt={barang.nama_barang}
                    className="max-h-64 rounded-xl border shadow-md object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Kanan: Detail Supplier */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800  dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
            <h2 className="text-2xl flex gap-1 font-bold text-gray-800 dark:text-white/90 mb-6">
              <UserIcon /> Detail Supplier
            </h2>

            {barang.supplier ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Nama Supplier:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {barang.supplier.nama_supplier}
                  </span>
                </div>
                {barang.supplier.alamat && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Alamat:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {barang.supplier.alamat}
                    </span>
                  </div>
                )}
                {barang.supplier.kontak && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Kontak:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {barang.supplier.kontak}
                    </span>
                  </div>
                )}
                {barang.supplier.email && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {barang.supplier.email}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Supplier tidak ada
              </p>
            )}
          </div>
        </div>

        {/* 🔹 Detail Masuk */}
        {barang.detailMasuk && barang.detailMasuk.length > 0 && (
          <div className="space-y-8">
            {/* Chart Barang Masuk */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-2xl flex gap-2 font-bold text-gray-800 dark:text-white/90 mb-6">
                <PieChartIcon /> Data Barang Masuk
              </h2>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={220}
              />
            </div>

            {/* Tabel Barang Masuk */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-4">
                Riwayat Barang Masuk
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>ID Masuk</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Harga Masuk</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barang.detailMasuk.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.id_barang_masuk}</TableCell>
                      <TableCell>{d.jumlah} unit</TableCell>
                      <TableCell>
                        {parseInt(d.harga_masuk).toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="mt-10 flex justify-end gap-2">
          <Button
            className="rounded-xl !bg-gray-800 text-white"
            onClick={() => navigate("/barang")}>
            Kembali
          </Button>
          <Button
            className="rounded-xl"
            onClick={() => navigate(`/barang/edit/${barang.id}`)}>
            Edit Barang
          </Button>
        </div>
      </div>
    </div>
  );
}

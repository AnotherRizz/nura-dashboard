import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../services/supabaseClient";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { BoxCubeIcon } from "../../icons";

interface DetailBarang {
  id: string;
  id_barang: string;
  jumlah: number;
  harga_masuk: number;
  barang: {
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    merk: string;
    tipe: string;
  };
}

interface BarangMasuk {
  id: string;
  tanggal_masuk: string;
  keterangan: string | null;
  gudang_id: string;
  gudang: {
    id: string;
    nama_gudang: string;
  };
  detailBarang: DetailBarang[];
}

export default function StokInShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<BarangMasuk | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
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
      detailBarang:DetailBarangMasuk (
        id,
        id_barang,
        jumlah,
        harga_masuk,
        barang:Barang (
          kode_barang,
          nama_barang,
          satuan,
          merk,
          tipe
        )
      )
    `
      )
      .eq("id", id)
      .single();

    if (error) console.error(error);
    setData(data as unknown as BarangMasuk);
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const formatTanggalWaktu = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Data tidak ditemukan.</div>;

  return (
    <div>
      <PageMeta
        title={`Detail Barang Masuk #${data.id}`}
        description="Detail Barang Masuk"
      />
      <PageBreadcrumb pageTitle="Detail Barang Masuk" />

      <div className="min-h-screen px-4 py-10 space-y-10">
        {/* INFORMASI BARANG MASUK */}
        <div className="rounded-2xl border-gray-800 bg-white  p-8 dark:bg-white/[0.05]">
          <h2 className="text-2xl dark:text-white text-gray-600 flex items-center gap-2 font-bold mb-6">
            <BoxCubeIcon /> Informasi Barang Masuk
          </h2>

          <div className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-4">
            <span className="font-medium text-gray-600 dark:text-white/70">
            <b> Gudang:</b>
              
            </span>
            <span className="dark:text-white/80">
              {data.gudang?.nama_gudang || "-"}
            </span>

            <span className="font-medium text-gray-600 dark:text-white/70">
            <b>    Tanggal Masuk:</b>
          
            </span>
            <span className="dark:text-white/80">
              {formatTanggalWaktu(data.tanggal_masuk)}
            </span>

            <span className="font-medium text-gray-600 dark:text-white/70">
            <b>    Keterangan:</b>
            </span>
            <span className="dark:text-white/80">{data.keterangan || "-"}</span>
          </div>

          <h2 className="text-xl font-bold mt-10 mb-5 text-gray-600 dark:text-white">
            Detail Barang Masuk
          </h2>

          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Kode
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Nama
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Merk
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Tipe
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Satuan
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Jumlah
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Harga Barang
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  Subtotal
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.detailBarang.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.barang.kode_barang}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.barang.nama_barang}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.barang.merk}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.barang.tipe}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.barang.satuan}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.jumlah}/{d.barang.satuan}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    Rp {d.harga_masuk.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    Rp {(d.jumlah * d.harga_masuk).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* TOMBOL */}
        <div className="flex justify-end gap-2">
          <Button
            className="!bg-gray-800 text-white"
            onClick={() => navigate("/barang-masuk")}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}

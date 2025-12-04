import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../services/supabaseClient";
import { generateStokOutShowPDF } from "../../services/exportStokOutShowPDF";
import PDFPreviewModal from "../../components/ui/modal/PDFPreviewModal";

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
  harga_keluar: number;
  distribusi: Array<{
    jumlah: number;
    nama_gudang: string;
  }>;
  barang: {
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    merk: string;
    tipe: string;
  };
}

interface BarangKeluar {
  id: string;
  tanggal_keluar: string;
  pic: string;
  nama_project: string;
  lokasi: string;
  no_spk: string;
  keterangan: string | null;
  detailBarang: DetailBarang[];
}

export default function StokOutShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<BarangKeluar | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [openPreview, setOpenPreview] = useState(false);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("barang_keluar")
      .select(
        `
      id,
      tanggal_keluar,
      pic,
      nama_project,
      lokasi,
      no_spk,
      keterangan,
      detailBarang:detail_barang_keluar (
        id,
        id_barang,
        jumlah,
        harga_keluar,
        distribusi,
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

    // 📌 FIX di sini
    if (data?.detailBarang) {
      data.detailBarang = data.detailBarang.map((d: any) => ({
        ...d,
        distribusi:
          typeof d.distribusi === "string"
            ? JSON.parse(d.distribusi)
            : d.distribusi ?? [],
      }));
    }

    setData(data as unknown as BarangKeluar);
    setLoading(false);
  };

  const formatDistribusi = (list: any[], satuan: string) => {
    if (!list || list.length === 0) return "-";

    return list
      .map((d) => `${d.jumlah} ${satuan} dari ${d.nama_gudang}`)
      .join(", ");
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);
  const formatTanggalWaktu = (tanggal: string | null) => {
    if (!tanggal) return "-";

    // Supabase timestamp biasanya "2025-02-12 00:00:00+00"
    // Pastikan ada "T"
    let iso = tanggal.replace(" ", "T");

    // Jika tidak ada timezone, tambahkan Z
    if (!iso.includes("+") && !iso.endsWith("Z")) {
      iso += "Z";
    }

    const d = new Date(iso);

    if (isNaN(d.getTime())) {
      console.error("Tanggal invalid:", tanggal, "→ setelah convert:", iso);
      return "-";
    }

    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Data tidak ditemukan.</div>;
  {
    console.log("Tanggal keluar:", data.tanggal_keluar);
  }
  return (
    <div>
      <PageMeta
        title={`Detail Barang Keluar #${data.id}`}
        description="Detail Barang Keluar"
      />
      <PageBreadcrumb pageTitle="Detail Barang Keluar" />

      <div className="min-h-screen px-4 py-10 space-y-10">
        {/* INFORMASI BARANG KELUAR */}
        <div className="rounded-2xl border-gray-800 bg-white p-8 dark:bg-white/[0.05]">
          <h2 className="text-2xl dark:text-white flex items-center gap-2 font-bold mb-6">
            <BoxCubeIcon /> Informasi Barang Keluar
          </h2>

          <div className="space-y-3 ">

            <div className="grid grid-cols-[150px_1fr]">
              <span className="font-medium text-gray-600 dark:text-white/70">
                Tanggal Keluar
              </span>
              <span className="dark:text-white/80">
                {formatTanggalWaktu(data.tanggal_keluar)}
              </span>
            </div>
            <div className="grid grid-cols-[150px_1fr]">
              <span className="font-medium text-gray-600 dark:text-white/70">
                No SPK
              </span>
              <span className="dark:text-white/80">{data.no_spk}</span>
            </div>
            <div className="grid grid-cols-[150px_1fr]">
              <span className="font-medium text-gray-600 dark:text-white/70">
                Nama Project
              </span>
              <span className="dark:text-white/80">{data.nama_project}</span>
            </div>

            <div className="grid grid-cols-[150px_1fr]">
              <span className="font-medium text-gray-600 dark:text-white/70">
                PIC
              </span>
              <span className="dark:text-white/80">{data.pic}</span>
            </div>
            <div className="grid grid-cols-[150px_1fr]">
              <span className="font-medium text-gray-600 dark:text-white/70">
                Lokasi
              </span>
              <span className="dark:text-white/80">{data.lokasi}</span>
            </div>

            <div className="grid grid-cols-[150px_1fr]">
              <span className="font-medium text-gray-600 dark:text-white/70">
                Keterangan
              </span>
              <span className="dark:text-white/80">
                {data.keterangan || "-"}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold my-6 dark:text-white">
            Detail Barang Keluar
          </h2>

          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Kode
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Nama
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Merk
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Satuan
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Jumlah
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Harga Keluar
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Subtotal
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-start dark:text-white">
                  Keterangan
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.detailBarang.map((d) => {
                const distribusiText = formatDistribusi(
                  d.distribusi,
                  d.barang.satuan
                );

                return (
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
                      {d.barang.satuan}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white/80">
                      {d.jumlah} {d.barang.satuan}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white/80">
                      Rp {d.harga_keluar.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white/80">
                      Rp {(d.jumlah * d.harga_keluar).toLocaleString("id-ID")}
                    </TableCell>

                    {/* DISTRIBUSI YANG SUDAH DIGABUNG */}
                    <TableCell className="px-4 py-3 dark:text-white/80">
                      {distribusiText}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end gap-2">
          <Button
            className="!bg-blue-600 text-white"
            onClick={async () => {
              const blob = await generateStokOutShowPDF(data);
              setPdfBlob(blob);
              setOpenPreview(true);
            }}>
            Export PDF
          </Button>

          <Button
            className="!bg-gray-800 text-white"
            onClick={() => navigate("/barang-keluar")}>
            Kembali
          </Button>
        </div>
      </div>
      <PDFPreviewModal
        open={openPreview}
        blob={pdfBlob}
        onClose={() => setOpenPreview(false)}
        onDownload={() => {
          if (!pdfBlob) return;
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `barang-keluar-${data.id}.pdf`;
          a.click();
        }}
      />
    </div>
  );
}

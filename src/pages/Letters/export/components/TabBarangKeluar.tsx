"use client";

import { useEffect, useState } from "react";
import Button from "../../../../components/ui/button/Button";
import { supabase } from "../../../../services/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { PrinterIcon } from "@heroicons/react/24/outline";

/* ================= HELPER ================= */
const getBulanLabel = (bulan: string) => {
  if (bulan === "all") return "Semua Bulan";

  const date = new Date(`${bulan}-01`);
  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

export default function TabBarangKeluar() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulanList, setBulanList] = useState<string[]>([]);
  const [bulan, setBulan] = useState("all");

  /* ================= LOAD BULAN ================= */
  const loadBulanFromDB = async () => {
    const { data, error } = await supabase
      .from("barang_keluar")
      .select("tanggal_keluar");

    if (error) {
      console.error(error);
      return;
    }

    const uniqueMonths = Array.from(
      new Set(
        data
          .map((d) => d.tanggal_keluar?.slice(0, 7)) // YYYY-MM
          .filter(Boolean)
      )
    ).sort();

    setBulanList(uniqueMonths);
  };
  const getNamaGudang = (distribusi: any[]) => {
    if (!Array.isArray(distribusi) || distribusi.length === 0) return "-";
    return distribusi[0]?.nama_gudang || "-";
  };

  /* ================= LOAD DATA ================= */
  const loadBarangKeluar = async () => {
    setLoading(true);

    let query = supabase
      .from("barang_keluar")
      .select(
        `
    id,
    tanggal_keluar,
    pic,
    keterangan,
    nama_project,
    lokasi,
    no_spk,
    detail:detail_barang_keluar!barang_keluar_id (
      id,
      jumlah,
      harga_keluar,
      distribusi,
      barang:Barang!id_barang (
        id,
        kode_barang,
        nama_barang,
        satuan
      ),
      serial_number:serial_number!detail_barang_keluar_id (
        id,
        sn,
        status
      )
    )
  `
      )
      .order("tanggal_keluar", { ascending: false });

    if (bulan !== "all") {
      query = query
        .gte("tanggal_keluar", `${bulan}-01`)
        .lte("tanggal_keluar", `${bulan}-31`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBulanFromDB();
  }, []);

  useEffect(() => {
    loadBarangKeluar();
  }, [bulan]);

  /* ================= EXPORT PDF ================= */
  const exportToPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text("LAPORAN BARANG KELUAR", 14, 15);

    doc.setFontSize(10);
    doc.text(`Bulan: ${getBulanLabel(bulan)}`, 14, 21);
    doc.text(
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
      14,
      26
    );

    doc.line(14, 29, 285, 29);

    const body: any[] = [];

    data.forEach((bk: any) => {
      bk.detail.forEach((d: any) => {
        body.push([
          new Date(bk.tanggal_keluar).toLocaleDateString("id-ID"),
          getNamaGudang(d.distribusi),
          d.barang?.kode_barang || "-",
          d.barang?.nama_barang || "-",
          `${d.jumlah} ${d.barang?.satuan || ""}`,
          d.serial_number?.map((sn: any) => sn.sn).join(", ") || "-",
          d.harga_keluar?.toLocaleString() || "-",
          bk.pic || "-",
          bk.nama_project || "-",
        ]);
      });
    });

    autoTable(doc, {
      startY: 34,
      theme: "grid",
      head: [
        [
          "Tanggal",
          "Gudang",
          "Kode",
          "Nama Barang",
          "Jumlah",
          "Serial Number",
          "Harga Keluar",
          "PIC",
          "Project",
        ],
      ],
      body,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: false,
        textColor: 20,
        fontStyle: "bold",
      },
    });

    const fileName =
      bulan === "all"
        ? "laporan-barang-keluar-semua-bulan.pdf"
        : `laporan-barang-keluar-${bulan}.pdf`;

    doc.save(fileName);
  };

  /* ================= UI ================= */
  return (
    <>
      {/* FILTER */}
      <div className="mb-6 flex items-center justify-end gap-3">
        <select
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          className="rounded-md border px-4 py-2 text-sm dark:bg-gray-900 dark:border-white/20 dark:text-white">
          <option value="all">Semua Bulan</option>
          {bulanList.map((b) => {
            const date = new Date(`${b}-01`);
            return (
              <option key={b} value={b}>
                {date.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            );
          })}
        </select>

        <Button
          onClick={exportToPDF}
          disabled={data.length === 0}
          className="bg-red-600 text-white py-1 hover:bg-red-700 flex items-center">
          <PrinterIcon className="h-6 w-6 mr-2" />
          Export PDF
        </Button>

        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl">
         <Table>
          {/* Header selalu tampil */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell  isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">Tanggal Keluar</TableCell>
                         <TableCell isHeader className="px-5 py-4 text-start dark:text-white sm:px-6">PIC</TableCell>
              <TableCell isHeader className="px-5 py-4 text-start dark:text-white sm:px-6">Project</TableCell>
              <TableCell  isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">Gudang</TableCell>
              <TableCell  isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">Nama Barang</TableCell>
              <TableCell  isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">Jumlah</TableCell>
              <TableCell  isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">Serial Number</TableCell>
              <TableCell  isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">Harga Keluar</TableCell>
     
            </TableRow>
          </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}

            {data.map((bk: any) =>
              bk.detail.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {new Date(bk.tanggal_keluar).toLocaleDateString("id-ID")}
                  </TableCell>
                   <TableCell className="px-4 py-3 dark:text-white/80">{bk.pic || "-"}</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">{bk.nama_project || "-"}</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">{getNamaGudang(d.distribusi)}</TableCell>

                  <TableCell className="px-4 py-3 dark:text-white/80">{d.barang?.nama_barang}</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.jumlah} {d.barang?.satuan}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.serial_number?.map((sn: any) => sn.sn).join(", ") || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {d.harga_keluar?.toLocaleString() || "-"}
                  </TableCell>
                 
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

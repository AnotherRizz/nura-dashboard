"use client";

import { useEffect, useState } from "react";
import Button from "../../../../components/ui/button/Button";
import { supabase } from "../../../../services/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PrinterIcon } from "@heroicons/react/24/outline";

export default function TabBarang() {
  const [gudangList, setGudangList] = useState<any[]>([]);
  const [selectedGudang, setSelectedGudang] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataBarang, setDataBarang] = useState<any[]>([]);

  /* ================= LOAD GUDANG ================= */
  useEffect(() => {
    supabase
      .from("gudang")
      .select("id, nama_gudang")
      .order("nama_gudang")
      .then(({ data }) => setGudangList(data || []));
  }, []);

  /* ================= LOAD BARANG (AUTO) ================= */
  const loadBarang = async () => {
    setLoading(true);

    let query = supabase.from("Barang").select(`
      id,
      kode_barang,
      nama_barang,
      harga,
      satuan,
      kategori:id_kategori ( nama_kategori ),
      supplier:supplier_id ( nama_supplier ),
      stok_gudang!inner (
        id,
        stok,
        gudang:gudang_id ( id, nama_gudang ),
        serial_number:serial_number!serial_number_stok_gudang_fk (
          sn, status
        )
      )
    `);

    if (selectedGudang) {
      query = query.eq("stok_gudang.gudang_id", selectedGudang);
    }

    query = query.eq("stok_gudang.serial_number.status", "available");

    const { data, error } = await query;
    if (!error) setDataBarang(data || []);

    setLoading(false);
  };

  // AUTO LOAD
  useEffect(() => {
    loadBarang();
  }, [selectedGudang]);

  /* ================= EXPORT PDF ================= */
  const exportToPDF = () => {
    if (!dataBarang.length) return;

    const doc = new jsPDF("l", "mm", "a4");

    const gudangName = selectedGudang
      ? gudangList.find((g) => String(g.id) === String(selectedGudang))
          ?.nama_gudang || "Semua Gudang"
      : "Semua Gudang";

    // ===== HEADER =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("LAPORAN DATA BARANG", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gudang : ${gudangName}`, 14, 22);
    doc.text(
      `Tanggal Cetak : ${new Date().toLocaleDateString("id-ID")}`,
      14,
      27
    );
    const today = new Date();
    const tanggal =
      today.getDate().toString().padStart(2, "0") +
      "-" +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      today.getFullYear();

    const safeGudangName = gudangName.replace(/[^a-z0-9]/gi, "-");

    const fileName = `Laporan-Data-Barang-${safeGudangName}-${tanggal}.pdf`;

    doc.line(14, 30, 285, 30);

    // ===== BODY =====
    const body: any[] = [];

    dataBarang.forEach((item: any) => {
      item.stok_gudang.forEach((sg: any) => {
        body.push([
          item.kode_barang || "-",
          item.nama_barang || "-",
          item.kategori?.nama_kategori || "-",
          item.supplier?.nama_supplier || "-",
          sg.gudang?.nama_gudang || "-",
          `${sg.stok} ${item.satuan || ""}`,
          sg.serial_number?.map((sn: any) => sn.sn).join(", ") || "-",
          item.harga ? `Rp ${item.harga.toLocaleString("id-ID")}` : "-",
        ]);
      });
    });

    autoTable(doc, {
      startY: 34,
      theme: "grid",
      head: [
        [
          "Kode",
          "Nama Barang",
          "Kategori",
          "Supplier",
          "Gudang",
          "Stok",
          "Serial Number",
          "Harga",
        ],
      ],
      body,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "top",
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: 20,
        fontStyle: "bold",
      },
      columnStyles: {
        6: { cellWidth: 55 }, // SN
        7: { cellWidth: 35 },
      },
      didDrawPage: () => {
        const page = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(
          `Halaman ${page}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_blank";
    a.click();

    URL.revokeObjectURL(url);
  };
  const totalData = dataBarang.reduce(
    (total, item) => total + (item.stok_gudang?.length || 0),
    0
  );

  /* ================= UI ================= */
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* LEFT: TOTAL DATA */}
        <div className="text- text-gray-600 dark:text-gray-400">
          {loading ? (
            "Memuat data..."
          ) : (
            <>
              Ditemukan{" "}
              <span className="font-bold text-red-700">
                {totalData} 
              </span>{" "}
              data barang di      <span className="font-bold text-red-700">{selectedGudang ? gudangList.find((g) => String(g.id) === String(selectedGudang))?.nama_gudang : "semua gudang"}</span>
            </>
          )}
        </div>

        {/* RIGHT: FILTER & ACTION */}
        <div className="flex items-center gap-4">
          <select
            value={selectedGudang}
            onChange={(e) => setSelectedGudang(e.target.value)}
            className="rounded-md border px-4 py-2 text-sm dark:bg-gray-900 dark:border-white/20 dark:text-white">
            <option value="">Semua Gudang</option>
            {gudangList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama_gudang}
              </option>
            ))}
          </select>

          <Button
            onClick={exportToPDF}
            disabled={!totalData}
            className="bg-red-600 text-white py-1 hover:bg-red-700 flex items-center">
            <PrinterIcon className="h-6 w-6 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "Kode",
                "Nama",
                "Kategori",
                "Supplier",
                "Gudang",
                "Stok",
                "SN",
                "Harga",
              ].map((h) => (
                <TableCell
                  key={h}
                  isHeader
                  className="px-5 py-4 text-start dark:text-white sm:px-6">
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {!loading && !dataBarang.length && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}

            {dataBarang.map((item: any) =>
              item.stok_gudang.map((sg: any) => (
                <TableRow key={`${item.id}-${sg.id}`}>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.kode_barang}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.nama_barang}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.kategori?.nama_kategori}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.supplier?.nama_supplier}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {sg.gudang?.nama_gudang}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {sg.stok} {item.satuan}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {sg.serial_number?.map((sn: any) => sn.sn).join(", ") ||
                      "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.harga
                      ? `Rp ${item.harga.toLocaleString("id-ID")}`
                      : "-"}
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

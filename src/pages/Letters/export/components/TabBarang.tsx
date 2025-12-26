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

export default function TabBarang() {
  const [gudangList, setGudangList] = useState<any[]>([]);
  const [selectedGudang, setSelectedGudang] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataBarang, setDataBarang] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("gudang")
      .select("id, nama_gudang")
      .order("nama_gudang")
      .then(({ data }) => setGudangList(data || []));
  }, []);

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
        gudang:gudang_id ( nama_gudang ),
        serial_number:serial_number!serial_number_stok_gudang_fk (
          id, sn, status
        )
      )
    `);

    if (selectedGudang) {
      query = query.eq("stok_gudang.gudang_id", selectedGudang);
    }

    query = query.eq("stok_gudang.serial_number.status", "available");

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setDataBarang(data || []);
    setLoading(false);
  };

  const exportToPDF = () => {
    if (dataBarang.length === 0) return;

    const doc = new jsPDF("l", "mm", "a4"); // Landscape A4

    /* ================= HEADER DOKUMEN ================= */
    doc.setFontSize(14);
    doc.text("LAPORAN DATA BARANG", 14, 15);

    doc.setFontSize(10);
    doc.text(`Gudang: ${selectedGudang || "Semua Gudang"}`, 14, 22);

    doc.line(14, 25, 285, 25); // garis pemisah

    /* ================= DATA TABLE ================= */
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
          item.harga?.toLocaleString() || "-",
        ]);
      });
    });

    autoTable(doc, {
      startY: 30,
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
      theme: "grid", // tampilan tabel standar
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: 20,
      },
      headStyles: {
        fillColor: false, // ⛔ tanpa background
        textColor: 20,
        fontStyle: "bold",
        lineWidth: 0.3,
      },
      bodyStyles: {
        lineWidth: 0.2,
      },
    });

    /* ================= PREVIEW PDF (TIDAK AUTO SAVE) ================= */
    const pdfBlob = doc.output("bloburl");
    window.open(pdfBlob, "_blank");
  };

  return (
    <>
      {/* FILTER */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={selectedGudang}
          onChange={(e) => setSelectedGudang(e.target.value)}
          className="rounded-xl border px-4 py-2 dark:bg-gray-900 dark:border-white/20 dark:text-white">
          <option value="">Semua Gudang</option>
          {gudangList.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nama_gudang}
            </option>
          ))}
        </select>

        <Button onClick={loadBarang}>
          {loading ? "Loading..." : "Load Data"}
        </Button>

        <Button
          onClick={exportToPDF}
          disabled={dataBarang.length === 0}
          className="bg-red-600 text-white">
          Export PDF
        </Button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl ">
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
                Gudang
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Stok
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                SN
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Harga
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {dataBarang.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500">
                  Belum ada data
                </TableCell>
              </TableRow>
            )}

            {dataBarang.map((item: any) =>
              item.stok_gudang.map((sg: any) => (
                <TableRow key={`${item.id}-${sg.id}`} className="border-t">
                  <TableCell className="py-6 text-center text-gray-500 dark:text-white/80">
                    {item.kode_barang || "-"}
                  </TableCell>
                  <TableCell className="py-6  text-gray-500 dark:text-white/80">
                    {item.nama_barang}
                  </TableCell>
                  <TableCell className="py-6  text-gray-500 dark:text-white/80">
                    {item.kategori?.nama_kategori || "-"}
                  </TableCell>
                  <TableCell className="py-6  text-gray-500 dark:text-white/80">
                    {item.supplier?.nama_supplier || "-"}
                  </TableCell>
                  <TableCell className="py-6  text-gray-500 dark:text-white/80">
                    {sg.gudang?.nama_gudang}
                  </TableCell>
                  <TableCell className="py-6  text-gray-500 dark:text-white/80">
                    {sg.stok} {item.satuan}
                  </TableCell>
                  <TableCell className="py-6  text-gray-500 dark:text-white/80">
                    {sg.serial_number?.map((sn: any) => sn.sn).join(", ") ||
                      "-"}
                  </TableCell>
                  <TableCell className="py-6  text-gray-500 dark:text-white/80">
                    {item.harga?.toLocaleString()}
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

"use client";

import { useEffect, useState } from "react";
import Button from "../../../../components/ui/button/Button";
import { supabase } from "../../../../services/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BULAN = [
  { value: "all", label: "Semua Bulan" },
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function TabBarangMasuk() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
 const [bulanList, setBulanList] = useState<string[]>([]);
const [bulan, setBulan] = useState("all");

const loadBulanFromDB = async () => {
  const { data, error } = await supabase
    .from("BarangMasuk")
    .select("tanggal_masuk");

  if (error) {
    console.error("LOAD BULAN ERROR:", error);
    return;
  }

  const uniqueMonths = Array.from(
    new Set(
      data
        .map((d) => d.tanggal_masuk?.slice(0, 7)) // YYYY-MM
        .filter(Boolean)
    )
  ).sort();

  setBulanList(uniqueMonths);
};

  /* ================= LOAD DATA (AUTO + FILTER BULAN) ================= */
const loadBarangMasuk = async () => {
  setLoading(true);

  let query = supabase
    .from("BarangMasuk")
    .select(`
      id,
      tanggal_masuk,
      keterangan,
      gudang:gudang_id (
        id,
        nama_gudang
      ),
      detail:DetailBarangMasuk!id_barang_masuk (
        id,
        jumlah,
        harga_masuk,
        barang:Barang!id_barang (
          id,
          kode_barang,
          nama_barang,
          satuan
        ),
        serial_number:serial_number!detail_barang_masuk_id (
          id,
          sn,
          status
        )
      )
    `)
    .order("tanggal_masuk", { ascending: false });

  if (bulan !== "all") {
    const startDate = `${bulan}-01`;
    const endDate = `${bulan}-31`;

    query = query
      .gte("tanggal_masuk", startDate)
      .lte("tanggal_masuk", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("LOAD BARANG MASUK ERROR:", error);
    setLoading(false);
    return;
  }

  setData(data || []);
  setLoading(false);
};

  // AUTO LOAD SAAT HALAMAN & FILTER BERUBAH
  useEffect(() => {
  loadBulanFromDB();
}, []);

useEffect(() => {
  loadBarangMasuk();
}, [bulan]);


  /* ================= EXPORT PDF ================= */
  const exportToPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text("LAPORAN BARANG MASUK", 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Bulan: ${BULAN.find((b) => b.value === bulan)?.label}`,
      14,
      21
    );
    doc.text(
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
      14,
      26
    );

    doc.line(14, 29, 285, 29);

    const body: any[] = [];

    data.forEach((bm: any) => {
      bm.detail.forEach((d: any) => {
        body.push([
          new Date(bm.tanggal_masuk).toLocaleDateString("id-ID"),
          bm.gudang?.nama_gudang || "-",
          d.barang?.kode_barang || "-",
          d.barang?.nama_barang || "-",
          `${d.jumlah} ${d.barang?.satuan || ""}`,
          d.serial_number?.map((sn: any) => sn.sn).join(", ") || "-",
          d.harga_masuk?.toLocaleString() || "-",
          bm.keterangan || "-",
        ]);
      });
    });

    autoTable(doc, {
      startY: 34,
      theme: "grid",
      head: [[
        "Tanggal",
        "Gudang",
        "Kode",
        "Nama Barang",
        "Jumlah",
        "Serial Number",
        "Harga Masuk",
        "Keterangan",
      ]],
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

    window.open(doc.output("bloburl"), "_blank");
  };

  /* ================= UI ================= */
  return (
    <>
      {/* FILTER & ACTION */}
      <div className="mb-6 flex items-center gap-3">
       <select
  value={bulan}
  onChange={(e) => setBulan(e.target.value)}
  className="rounded border px-3 py-2 text-sm"
>
  <option value="all">Semua Bulan</option>

  {bulanList.map((b) => {
    const date = new Date(`${b}-01`);
    const label = date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

    return (
      <option key={b} value={b}>
        {label}
      </option>
    );
  })}
</select>


        <Button
          onClick={exportToPDF}
          disabled={data.length === 0}
          className="bg-gray-700 text-white"
        >
          Export PDF
        </Button>

        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Gudang</th>
              <th className="px-4 py-2 text-left">Kode</th>
              <th className="px-4 py-2 text-left">Nama Barang</th>
              <th className="px-4 py-2 text-left">Jumlah</th>
              <th className="px-4 py-2 text-left">Serial Number</th>
              <th className="px-4 py-2 text-left">Harga Masuk</th>
              <th className="px-4 py-2 text-left">Keterangan</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}

            {data.map((bm: any) =>
              bm.detail.map((d: any) => (
                <tr key={d.id} className="border-t align-top">
                  <td className="px-4 py-2">
                    {new Date(bm.tanggal_masuk).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-2">{bm.gudang?.nama_gudang}</td>
                  <td className="px-4 py-2">{d.barang?.kode_barang}</td>
                  <td className="px-4 py-2">{d.barang?.nama_barang}</td>
                  <td className="px-4 py-2">
                    {d.jumlah} {d.barang?.satuan}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {d.serial_number?.map((sn: any) => sn.sn).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-2">
                    {d.harga_masuk?.toLocaleString() || "-"}
                  </td>
                  <td className="px-4 py-2">{bm.keterangan || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

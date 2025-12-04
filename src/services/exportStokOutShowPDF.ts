// src/services/exportStokOutShowPDF.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const d = date.getDate();
  const m = bulan[date.getMonth()];
  const y = date.getFullYear();

  return `${d} ${m} ${y}`;
}


export const generateStokOutShowPDF = (data: any) => {
  const doc = new jsPDF("p", "mm", "a4");

  // =================== HEADER ===================
  doc.setFontSize(14);
  doc.setFont("Times", "Bold");
  doc.text("PT. Line Global Teknologi", 105, 15, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("Times", "Normal");
  doc.text(
    "Ruko Freesia No.7, Jln. Jombang Raya, Pd. Kec. Pd.Aren, Kota Tangerang Selatan, Banten",
    105,
    22,
    { align: "center" }
  );
  doc.text("Telp: 0823 2323 9243 • Email: info@lineaglobal.co.id", 105, 28, {
    align: "center",
  });

  doc.setLineWidth(0.5);
  doc.line(15, 33, 195, 33);

  // =================== JUDUL ===================
  doc.setFontSize(13);
  doc.setFont("Times", "Bold");
  doc.text("LAPORAN BARANG KELUAR", 105, 45, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("Times", "Normal");
  doc.text(`ID Transaksi: ${data.id}`, 105, 52, { align: "center" });

  // =================== INFORMASI ===================
  let y = 65;

  doc.setFontSize(12);
  doc.setFont("Times", "Bold");
  doc.text("Informasi Transaksi", 15, y);

  y += 8;
  doc.setFont("Times", "Normal");

  const labelX = 15;
  const valueX = 60;

  const infoList = [
    ["Tanggal Keluar", formatDate(data.tanggal_keluar)],
    ["PIC", data.pic],
    ["Nama Project", data.nama_project],
    ["Lokasi", data.lokasi],
    ["No SPK", data.no_spk],
    ["Keterangan", data.keterangan || "-"],
  ];

  infoList.forEach(([label, value]) => {
    doc.text(`${label}`, labelX, y);
    doc.text(`: ${value}`, valueX, y);
    y += 7;
  });

  y += 5;

autoTable(doc, {
  startY: y,
  margin: { top: 10, bottom: 25, left: 10, right: 10 },
  pageBreak: 'auto',
  head: [["Kode", "Nama Barang", "Merk", "Satuan", "Jumlah", "Harga Satuan", "Subtotal", "Keterangan"]],
  body: data.detailBarang.map((d: any) => [
    d.barang.kode_barang,
    d.barang.nama_barang,
    d.barang.merk,
    d.barang.satuan,
    `${d.jumlah} ${d.barang.satuan}`,
    "Rp " + d.harga_keluar.toLocaleString("id-ID"),
    "Rp " + (d.jumlah * d.harga_keluar).toLocaleString("id-ID"),
    d.distribusi?.length
      ? d.distribusi.map((dist: any) => `${dist.nama_gudang} (${dist.jumlah})`).join("\n")
      : "-",
  ]),
  theme: "grid",
  headStyles: { fillColor: [40, 40, 40] },
  styles: {
    font: "Times",
    fontSize: 10,
    cellWidth: "wrap",
    minCellHeight: 6,
  },
  columnStyles: {
    1: { cellWidth: 60 },
    7: { cellWidth: 35 },
  },
});



  // =================== FOOTER ===================
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setFont("Times", "Italic");
  doc.text(
    "Dokumen ini dicetak otomatis dari sistem dan tidak memerlukan tanda tangan.",
    105,
    pageHeight - 10,
    { align: "center" }
  );

  return doc.output("blob");
};

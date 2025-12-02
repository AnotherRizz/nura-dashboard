import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAllPDF(data: any[]) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Laporan Barang Keluar - Semua Data", 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [["Tanggal", "Keterangan", "PIC", "Total Item", "Total Harga"]],
    body: data.map((item) => [
      new Date(item.tanggal_keluar).toLocaleDateString("id-ID"),
      item.keterangan || "-",
      item.pic || "-",
      item.total_item,
      item.total_harga.toLocaleString("id-ID"),
    ]),
  });

  doc.save(`barang-keluar-all.pdf`);
}

export function exportFilteredPDF(data: any[], filter: string) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Laporan Barang Keluar (${filter})`, 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [["Tanggal", "Keterangan", "PIC", "Total Item", "Total Harga"]],
    body: data.map((item) => [
      new Date(item.tanggal_keluar).toLocaleDateString("id-ID"),
      item.keterangan || "-",
      item.pic || "-",
      item.total_item,
      item.total_harga.toLocaleString("id-ID"),
    ]),
  });

  doc.save(`barang-keluar-${filter}.pdf`);
}

export function exportSinglePDF(item: any) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Detail Barang Keluar", 14, 15);

  doc.setFontSize(12);
  doc.text(`Tanggal: ${new Date(item.tanggal_keluar).toLocaleDateString("id-ID")}`, 14, 30);
  doc.text(`Keterangan: ${item.keterangan || "-"}`, 14, 38);
  doc.text(`PIC: ${item.pic || "-"}`, 14, 46);

  autoTable(doc, {
    startY: 60,
    head: [["Barang", "Jumlah", "Harga Keluar", "Subtotal"]],
    body: item.detail.map((d: any) => [
      d.barang?.nama_barang,
      d.jumlah,
      d.harga_keluar.toLocaleString("id-ID"),
      (d.harga_keluar * d.jumlah).toLocaleString("id-ID"),
    ]),
  });

  doc.save(`barang-keluar-${item.id}.pdf`);
}

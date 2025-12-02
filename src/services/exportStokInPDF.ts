import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAllPDF(data: any[]) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Laporan Barang Masuk - Semua Data", 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [["Tanggal", "Keterangan", "Total Item", "Total Harga"]],
    body: data.map((item) => [
      new Date(item.tanggal_masuk).toLocaleDateString("id-ID"),
      item.keterangan,
      item.total_item,
      item.total_harga.toLocaleString("id-ID"),
    ]),
  });

  doc.save(`barang-masuk-all.pdf`);
}

export function exportFilteredPDF(data: any[], filter: string) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Laporan Barang Masuk (${filter})`, 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [["Tanggal", "Keterangan", "Total Item", "Total Harga"]],
    body: data.map((item) => [
      new Date(item.tanggal_masuk).toLocaleDateString("id-ID"),
      item.keterangan,
      item.total_item,
      item.total_harga.toLocaleString("id-ID"),
    ]),
  });

  doc.save(`barang-masuk-${filter}.pdf`);
}

export function exportSinglePDF(item: any) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Detail Barang Masuk", 14, 15);

  doc.setFontSize(12);
  doc.text(`Tanggal: ${new Date(item.tanggal_masuk).toLocaleDateString("id-ID")}`, 14, 30);
  doc.text(`Keterangan: ${item.keterangan}`, 14, 38);

  autoTable(doc, {
    startY: 50,
    head: [["Barang", "Jumlah", "Harga Masuk", "Subtotal"]],
    body: item.detail.map((d: any) => [
      d.barang?.nama_barang,
      d.jumlah,
      d.harga_masuk.toLocaleString("id-ID"),
      (d.harga_masuk * d.jumlah).toLocaleString("id-ID"),
    ]),
  });

  doc.save(`barang-masuk-${item.id}.pdf`);
}

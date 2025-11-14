import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ⬅️ ini penting

export const exportPDF = (data: any[]) => {
  const doc = new jsPDF();

  // Judul
  doc.setFontSize(14);
  doc.text("Laporan Device Trouble", 14, 15);
  doc.setFontSize(10);

  // Data tabel
  const tableData = data.map((l, i) => [
    i + 1,
    l.device?.nama || "-",
    l.device?.ip || "-",
    l.interface || "-",
    l.status,
    l.starttime,
    l.endtime,
    l.duration || "-",
  ]);

  autoTable(doc, {
    head: [
      [
        "#",
        "Device",
        "IP",
        "Interface",
        "Status",
        "Mulai",
        "Selesai",
        "Durasi",
      ],
    ],
    body: tableData,
    startY: 25,
    styles: { fontSize: 8 },
  });

  // Simpan file PDF
  doc.save("trouble-log.pdf");
};

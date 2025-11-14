import * as XLSX from "xlsx";
import { toZonedTime, format } from "date-fns-tz";

// 🕐 Konversi UTC → WIB (Asia/Jakarta)
function formatToWIB(dateString: string | null | undefined) {
  if (!dateString) return "";
  const utcDate = new Date(dateString); // waktu dari DB (biasanya UTC)
  const wibDate = toZonedTime(utcDate, "Asia/Jakarta"); // ubah ke zona WIB
  return format(wibDate, "dd/MM/yyyy HH:mm", { timeZone: "Asia/Jakarta" });
}

export function exportCSV(filtered: any[]) {
  if (!filtered || filtered.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const formattedData = filtered.map((d) => ({
    Device: d.device?.nama || "-",
    Status: d.status || "-",
    Interface: d.interface || "-",
    Duration: d.duration || "-",
    Note: d.note || "-",
    "Start Time": formatToWIB(d.starttime),
    "End Time": formatToWIB(d.endtime),
  }));

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Device Logs");

  // 🧾 Generate file Excel
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Device_Logs_${format(
    toZonedTime(new Date(), "Asia/Jakarta"),
    "yyyyMMdd_HHmm",
    { timeZone: "Asia/Jakarta" }
  )}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

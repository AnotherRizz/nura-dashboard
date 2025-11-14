/**
 * Mengonversi waktu UTC ke waktu lokal dengan format Indonesia.
 * @param {string} utcTime - Waktu dalam format UTC (ISO string).
 * @returns {string} - Waktu dalam format yang disesuaikan dengan zona waktu lokal.
 */
export default function dateFormat(utcTime :any) {
  return new Date(utcTime).toLocaleString('id-ID', {
    timeZoneName: 'short',
    hour12: false, // Format 24 jam, bisa diganti ke true untuk format 12 jam
  });
}
